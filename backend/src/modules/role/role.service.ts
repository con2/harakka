import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import type { SupabaseClient } from "@supabase/supabase-js";

import { CreateUserRoleDto, UpdateUserRoleDto } from "./dto/role.dto";
import { JwtService } from "../jwt/jwt.service";
import { SupabaseService } from "../supabase/supabase.service";
import { ViewUserRolesWithDetails } from "@common/role.types";

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly supabaseService: SupabaseService,
  ) {}
  /**
   * Get all active roles for the current authenticated user
   * Uses roles already fetched and attached to request by AuthMiddleware
   */
  getCurrentUserRoles(req: AuthRequest): ViewUserRolesWithDetails[] {
    const userId = req.user.id;

    this.logger.log(
      `Returning ${req.userRoles.length} roles for user: ${userId}`,
    );

    return req.userRoles;
  }

  /**
   * Check if the current user has *specified role* in organization
   */
  hasRole(
    req: AuthRequest,
    roleName: string,
    organizationId?: string,
  ): boolean {
    return req.userRoles.some((role) => {
      const roleMatch = role.role_name !== null && role.role_name === roleName;
      const orgMatch = organizationId
        ? role.organization_id === organizationId
        : true;
      return roleMatch && orgMatch;
    });
  }

  /**
   * Check if the current user has *any of the specified roles* in organization
   */
  hasAnyRole(
    req: AuthRequest,
    roleNames: string[],
    organizationId?: string,
  ): boolean {
    return roleNames.some((roleName) =>
      this.hasRole(req, roleName, organizationId),
    );
  }

  /* The method is used to extract and organize the user's organizations from the request context.
  It processes the user roles and groups them based on the organization they belong to.
  It returns an array of objects, where each object represents an organization with its ID,
  name, and an array of roles associated with that organization. */
  /**
   * Get user organizations from request context
   */
  getUserOrganizations(req: AuthRequest): Array<{
    organization_id: string;
    organization_name: string;
    roles: string[];
  }> {
    return Object.values(
      req.userRoles.reduce(
        (acc, role) => {
          const orgId = role.organization_id; // extract organization ID from the role
          if (!orgId) return acc; // skip if orgId is null/undefined
          if (!acc[orgId]) {
            // if this organization hasn't been added yet, add
            acc[orgId] = {
              organization_id: orgId,
              organization_name:
                role.organization_name ?? "Unknown Organization", // fallback for null organization name
              roles: [],
            };
          }
          acc[orgId].roles.push(role.role_name ?? "Unknown role"); //Add the role name to the organization's roles array (with fallback)
          return acc;
        },
        {} as Record<
          string,
          //Response shape for each organization
          {
            organization_id: string;
            organization_name: string;
            roles: string[];
          }
        >,
      ),
    );
  }

  /**
   * Get user's roles in a specific organization
   */
  getCurrentUserRolesInOrganization(
    organizationId: string,
    req: AuthRequest,
  ): ViewUserRolesWithDetails[] {
    return req.userRoles.filter(
      (role) => role.organization_id === organizationId,
    );
  }

  /**
   * Get all available roles from the roles table
   */
  async getAllRoles(req: AuthRequest) {
    const { data, error } = await req.supabase
      .from("roles")
      .select("*")
      .order("role", { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch roles: ${error.message}`);
      throw new BadRequestException("Failed to fetch roles");
    }
    return data;
  }

  /**
   * Create a new user role assignment
   */
  async createUserRole(
    createRoleDto: CreateUserRoleDto,
    req: AuthRequest,
  ): Promise<ViewUserRolesWithDetails> {
    const { user_id, organization_id, role_id }: CreateUserRoleDto =
      createRoleDto;

    // First check: Does this exact role assignment already exist?
    const { data: existing } = await req.supabase
      .from("user_organization_roles")
      .select("id")
      .eq("user_id", user_id)
      .eq("organization_id", organization_id)
      .eq("role_id", role_id)
      .single();

    if (existing) {
      throw new BadRequestException(
        "User already has this role in this organization",
      );
    }

    // Second check (before inserting!): Does user have ANY active role in this organization?
    const { data: existingRole } = await req.supabase
      .from("user_organization_roles")
      .select("id, role_id")
      .eq("user_id", user_id)
      .eq("organization_id", organization_id)
      .eq("is_active", true)
      .maybeSingle();

    if (existingRole) {
      throw new BadRequestException(
        `User already has a role in this organization (role_id=${existingRole.role_id})`,
      );
    }

    // Now create the role assignment since all checks have passed
    const { data, error } = await req.supabase
      .from("user_organization_roles")
      .insert({
        user_id,
        organization_id,
        role_id,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) {
      this.logger.error(`Failed to create user role: ${error.message}`);
      throw new BadRequestException("Failed to create role assignment");
    }

    // Get the complete role details using the view
    const { data: roleDetails, error: viewError } = await req.supabase
      .from("view_user_roles_with_details")
      .select("*")
      .eq("id", data.id)
      .single();

    if (viewError || !roleDetails) {
      this.logger.error(
        `Failed to fetch created role details: ${viewError?.message}`,
      );
      throw new BadRequestException("Failed to fetch created role details");
    }

    // After successful role creation, update JWT
    await this.updateUserJWTById(createRoleDto.user_id);

    return roleDetails;
  }

  /**
   * Update a user role assignment
   */
  async updateUserRole(
    tableKeyId: string,
    updateRoleDto: UpdateUserRoleDto,
    req: AuthRequest,
  ): Promise<ViewUserRolesWithDetails> {
    // Check if assignment exists
    const { data: existing, error: existingError } = await req.supabase
      .from("user_organization_roles")
      .select("id, user_id, organization_id")
      .eq("id", tableKeyId)
      .single();

    if (existingError || !existing) {
      throw new NotFoundException("Role assignment not found");
    }

    // if a role is activated, ensure no other active role exists for this user in the same organization
    if (updateRoleDto.is_active) {
      await req.supabase
        .from("user_organization_roles")
        .update({ is_active: false })
        .eq("user_id", existing.user_id)
        .eq("organization_id", existing.organization_id);
    }

    // Update the role assignment
    const { data } = await req.supabase
      .from("user_organization_roles")
      .update({
        role_id: updateRoleDto.role_id,
        is_active: updateRoleDto.is_active,
      })
      .eq("id", tableKeyId)
      .select(
        `
        id,
        user_id,
        organization_id,
        role_id,
        is_active,
        created_at,
        roles!inner(
          id,
          role
        ),
        organizations!inner(
          id,
          name,
          slug
        )
      `,
      )
      .single();

    if (!data) {
      this.logger.error("No data returned after updating user role assignment");
      throw new BadRequestException("No data returned after update");
    }

    // Get the complete role details using the view
    const { data: roleDetails, error: viewError } = await req.supabase
      .from("view_user_roles_with_details")
      .select("*")
      .eq("id", data.id)
      .single();

    if (viewError || !roleDetails) {
      this.logger.error(
        `Failed to fetch updated role details: ${viewError?.message}`,
      );
      throw new BadRequestException("Failed to fetch created role details");
    }

    // After successful role creation, update JWT
    await this.updateUserJWTById(existing.user_id);

    return roleDetails;
  }

  /**
   * Replace a user role (delete old role and create new one)
   */
  async replaceUserRole(
    oldRoleId: string,
    createRoleDto: CreateUserRoleDto,
    req: AuthRequest,
  ): Promise<ViewUserRolesWithDetails> {
    // First check if old role exists
    const { data: existingRole, error: existingError } = await req.supabase
      .from("user_organization_roles")
      .select("id, user_id, organization_id")
      .eq("id", oldRoleId)
      .single();

    if (existingError || !existingRole) {
      throw new NotFoundException("Original role assignment not found");
    }

    // Verify the new role is for the same user
    if (existingRole.user_id !== createRoleDto.user_id) {
      throw new BadRequestException(
        "User ID mismatch between old and new role",
      );
    }

    // Step 1: Delete the old role
    const { error: deleteError } = await req.supabase
      .from("user_organization_roles")
      .delete()
      .eq("id", oldRoleId);

    if (deleteError) {
      this.logger.error(`Failed to delete old role: ${deleteError.message}`);
      throw new BadRequestException("Failed to delete old role assignment");
    }

    // Step 2: Create the new role
    // Check if another role already exists in this org (which could happen if roles were modified during this operation)
    const { data: conflictingRole } = await req.supabase
      .from("user_organization_roles")
      .select("id, role_id")
      .eq("user_id", createRoleDto.user_id)
      .eq("organization_id", createRoleDto.organization_id)
      .eq("is_active", true)
      .maybeSingle();

    if (conflictingRole) {
      this.logger.warn(
        `User already has another active role in this organization after deleting the old one: ${conflictingRole.id}`,
      );
      throw new BadRequestException(
        `User already has a role in this organization (role_id=${conflictingRole.role_id})`,
      );
    }

    // Create the new role assignment
    const { data: newRole, error: createError } = await req.supabase
      .from("user_organization_roles")
      .insert({
        user_id: createRoleDto.user_id,
        organization_id: createRoleDto.organization_id,
        role_id: createRoleDto.role_id,
        is_active: true,
      })
      .select("id")
      .single();

    if (createError || !newRole) {
      this.logger.error(`Failed to create new role: ${createError?.message}`);
      throw new BadRequestException("Failed to create new role assignment");
    }

    // Get the complete role details using the view
    const { data: roleDetails, error: viewError } = await req.supabase
      .from("view_user_roles_with_details")
      .select("*")
      .eq("id", newRole.id)
      .single();

    if (viewError || !roleDetails) {
      this.logger.error(
        `Failed to fetch created role details: ${viewError?.message}`,
      );
      throw new BadRequestException("Failed to fetch created role details");
    }

    // After successful role replacement, update JWT
    await this.updateUserJWTById(createRoleDto.user_id);

    this.logger.log(
      `Role replaced for user ${createRoleDto.user_id}: ${roleDetails.role_name}@${roleDetails.organization_name}`,
    );

    return roleDetails;
  }

  /**
   * Delete a user role assignment (soft delete by setting is_active = false)
   */
  async deleteUserRole(
    tableKeyId: string,
    req: AuthRequest,
  ): Promise<{ success: boolean; message: string }> {
    // Check if assignment exists
    const { data: existing, error: existingError } = await req.supabase
      .from("user_organization_roles")
      .select("id, user_id, organization_id")
      .eq("id", tableKeyId)
      .single();

    if (existingError || !existing) {
      throw new NotFoundException("Role assignment not found");
    }

    // Soft delete by setting is_active = false
    const { error } = await req.supabase
      .from("user_organization_roles")
      .update({ is_active: false })
      .eq("id", tableKeyId);

    if (error) {
      this.logger.error(`Failed to delete user role: ${error.message}`);
      throw new BadRequestException("Failed to delete role assignment");
    }

    // After successful role deletion, update JWT
    await this.updateUserJWTById(existing.user_id);

    return {
      success: true,
      message: "Role assignment deactivated successfully",
    };
  }

  /**
   * Hard delete a user role assignment (permanent removal) USE IT ONLY IF YOU KNOW WHAT YOU ARE DOING!
   */
  async permanentDeleteUserRole(
    tableKeyId: string,
    req: AuthRequest,
  ): Promise<{ success: boolean; message: string }> {
    // Use shared low-level delete helper so admin and user flows behave the same
    const { userId } = await this.deleteRoleRecordById(
      tableKeyId,
      req.supabase,
    );

    // After successful permanent deletion, update JWT
    await this.updateUserJWTById(userId);

    return {
      success: true,
      message: "Role assignment permanently deleted",
    };
  }

  /**
   * Allow the current authenticated user to permanently remove their own role assignment
   * Performs ownership check and prevents removing the Global 'user' role.
   */
  async leaveOrg(
    tableKeyId: string,
    req: AuthRequest,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data: roleDetails, error: viewError } = await req.supabase
        .from("view_user_roles_with_details")
        .select("*")
        .eq("id", tableKeyId)
        .single();

      if (viewError || !roleDetails) {
        this.logger.warn(`leaveOrg: role ${tableKeyId} not found`);
        throw new NotFoundException("Role assignment not found");
      }

      if (roleDetails.user_id !== req.user.id) {
        this.logger.warn(
          `User ${req.user.id} attempted to remove role ${tableKeyId} owned by ${roleDetails.user_id}`,
        );
        throw new BadRequestException("You may only remove your own role");
      }

      if (
        roleDetails.role_name === "user" &&
        roleDetails.organization_name === "Global"
      ) {
        this.logger.warn(
          `User ${req.user.id} attempted to remove Global user role - blocked`,
        );
        throw new BadRequestException(
          "Cannot remove the Global user role for this account",
        );
      }

      // Perform the actual delete using the shared helper so admin and user
      // flows use the same SQL and error handling. Use the request-scoped
      // supabase client so RLS applies.
      const { userId } = await this.deleteRoleRecordById(
        tableKeyId,
        req.supabase,
      );

      // Update the user's JWT after the removal
      await this.updateUserJWT(userId, req);

      return {
        success: true,
        message: "Role assignment permanently deleted",
      };
    } catch (err) {
      // Re-throw known exceptions
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      this.logger.error(
        `Failed to execute leaveOrg for ${tableKeyId}: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new BadRequestException("Failed to leave organization");
    }
  }

  /**
   * Get all user role assignments (admin only)
   */
  async getAllUserRoles(req: AuthRequest): Promise<ViewUserRolesWithDetails[]> {
    const { data, error } = await req.supabase
      .from("view_user_roles_with_details")
      .select("*")
      .order("assigned_at", { ascending: false });

    if (error) {
      this.logger.error(`Failed to fetch all user roles: ${error.message}`);
      throw new BadRequestException("Failed to fetch user roles");
    }
    if (!data) {
      return [];
    }

    return this.filterUserRoles(data, req);
  }

  /**
   * Low-level hard delete helper used by both admin and user flows.
   * Returns the deleted record's user_id so callers can refresh JWT.
   */
  private async deleteRoleRecordById(
    tableKeyId: string,
    supabaseClient: SupabaseClient,
  ): Promise<{ userId: string }> {
    // Check if assignment exists and get user_id
    const { data: existing, error: existingError } = await supabaseClient
      .from("user_organization_roles")
      .select("id, user_id")
      .eq("id", tableKeyId)
      .single();

    if (existingError || !existing) {
      this.logger.warn(`deleteRoleRecordById: role ${tableKeyId} not found`);
      throw new NotFoundException("Role assignment not found");
    }

    // Perform hard delete
    const { error } = await supabaseClient
      .from("user_organization_roles")
      .delete()
      .eq("id", tableKeyId);

    if (error) {
      this.logger.error(
        `Failed to delete role record ${tableKeyId}: ${error.message}`,
      );
      throw new BadRequestException("Failed to delete role assignment");
    }

    return { userId: existing.user_id };
  }

  /**
   * Filter user roles based on permissions
   */
  private filterUserRoles(
    roles: ViewUserRolesWithDetails[],
    req: AuthRequest,
  ): ViewUserRolesWithDetails[] {
    // Super admins can see all roles regardless of organization
    if (this.hasRole(req, "super_admin")) {
      return roles;
    }

    // Other admins can only see roles in their organizations
    const userOrgIds = req.userRoles.map((role) => role.organization_id);
    return roles.filter((role) => userOrgIds.includes(role.organization_id));
  }

  /**
   * Create a new user role assignment (INTERNAL SERVICE-TO-SERVICE ONLY)
   * SECURITY WARNING: This method bypasses all authentication/authorization checks
   * NEVER expose this method through public API endpoints
   * Only use for trusted internal operations like user signup automation
   *
   * This version doesn't require an AuthRequest and uses the service client
   */
  async createUserRoleById(
    userId: string,
    organizationId: string,
    roleId: string,
  ): Promise<ViewUserRolesWithDetails> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if assignment already exists
    const { data: existing } = await supabase
      .from("user_organization_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .eq("role_id", roleId)
      .single();

    if (existing) {
      this.logger.warn(
        `User ${userId} already has role ${roleId} in organization ${organizationId}`,
      );
      // Fetch and return existing role details
      const { data: existingRole } = await supabase
        .from("view_user_roles_with_details")
        .select("*")
        .eq("id", existing.id)
        .single();

      if (existingRole) {
        return existingRole;
      }
    }

    // Create the role assignment
    const { data, error } = await supabase
      .from("user_organization_roles")
      .insert({
        user_id: userId,
        organization_id: organizationId,
        role_id: roleId,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) {
      this.logger.error(`Failed to create user role: ${error.message}`);
      throw new Error(`Failed to create role assignment: ${error.message}`);
    }

    // Get the complete role details using the view
    const { data: roleDetails, error: viewError } = await supabase
      .from("view_user_roles_with_details")
      .select("*")
      .eq("id", data.id)
      .single();

    if (viewError || !roleDetails) {
      this.logger.error(
        `Failed to fetch created role details: ${viewError?.message}`,
      );
      throw new Error("Failed to fetch created role details");
    }

    // After successful role creation, update JWT
    await this.updateUserJWTById(userId);

    this.logger.log(
      `Role assignment created for user ${userId}: ${roleDetails.role_name}@${roleDetails.organization_name}`,
    );

    return roleDetails;
  }

  /**
   * Update user JWT with fresh roles (public method for service-to-service calls)
   */
  async updateUserJWTById(userId: string): Promise<void> {
    try {
      // Create a service client to fetch roles
      const supabase = this.supabaseService.getServiceClient();

      // Get fresh roles using the optimized view
      const { data: freshRoles } = await supabase
        .from("view_user_roles_with_details")
        .select("*")
        .eq("user_id", userId);

      if (freshRoles) {
        // Use the JWT service to force update
        await this.jwtService.forceUpdateJWTWithRoles(userId, freshRoles);
      }
    } catch (error) {
      this.logger.error(
        `Failed to update JWT for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async updateUserJWT(userId: string, req: AuthRequest): Promise<void> {
    try {
      // Get fresh roles using the optimized view
      const { data: freshRoles } = await req.supabase
        .from("view_user_roles_with_details")
        .select("*")
        .eq("user_id", userId);

      if (freshRoles) {
        // Use the JWT service to force update
        await this.jwtService.forceUpdateJWTWithRoles(userId, freshRoles);
      }
    } catch (error) {
      this.logger.error(
        `Failed to update JWT for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
