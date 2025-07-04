import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { UserRoleWithDetails } from "./interfaces/role.interface";
import { CreateUserRoleDto, UpdateUserRoleDto } from "./dto/role.dto";
import { JwtService } from "../jwt/jwt.service";

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
  constructor(private readonly jwtService: JwtService) {}
  /**
   * Get all active roles for the current authenticated user
   * Uses roles already fetched and attached to request by AuthMiddleware
   */
  getCurrentUserRoles(req: AuthRequest): UserRoleWithDetails[] {
    const userId = req.user.id;

    this.logger.log(
      `Returning ${req.userRoles.length} roles for user: ${userId}`,
    );

    return req.userRoles;
  }

  /**
   * Check if user has specific role in organization
   */
  hasRole(
    req: AuthRequest,
    roleName: string,
    organizationId?: string,
  ): boolean {
    return req.userRoles.some((role) => {
      const roleMatch = role.role_name === roleName;
      const orgMatch = organizationId
        ? role.organization_id === organizationId
        : true;
      return roleMatch && orgMatch;
    });
  }

  /**
   * Check if user has any of the specified roles
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

  /**
   * Check if user is superVera (global admin)
   */
  isSuperVera(req: AuthRequest): boolean {
    return req.userRoles.some((role) => role.role_name === "superVera");
  }

  /**
   * Get user organizations from request context
   */
  getUserOrganizations(req: AuthRequest): Array<{
    organization_id: string;
    organization_name: string;
    roles: string[];
  }> {
    const orgMap = new Map<
      string,
      {
        organization_id: string;
        organization_name: string;
        roles: string[];
      }
    >();

    req.userRoles.forEach((role) => {
      const orgId = role.organization_id;
      if (!orgMap.has(orgId)) {
        orgMap.set(orgId, {
          organization_id: orgId,
          organization_name: role.organization_name,
          roles: [],
        });
      }
      const org = orgMap.get(orgId);
      if (org) {
        org.roles.push(role.role_name);
      }
    });

    return Array.from(orgMap.values());
  }

  /**
   * Get user's roles in a specific organization
   */
  getCurrentUserRolesInOrganization(
    organizationId: string,
    req: AuthRequest,
  ): UserRoleWithDetails[] {
    return req.userRoles.filter(
      (role) => role.organization_id === organizationId,
    );
  }

  /**
   * Create a new user role assignment
   */
  async createUserRole(
    createRoleDto: CreateUserRoleDto,
    req: AuthRequest,
  ): Promise<UserRoleWithDetails> {
    const { user_id, organization_id, role_id } = createRoleDto;

    // Check if assignment already exists
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

    // Create the role assignment
    const { data, error } = await req.supabase
      .from("user_organization_roles")
      .insert({
        user_id,
        organization_id,
        role_id,
        is_active: true,
      })
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

    if (error) {
      this.logger.error(`Failed to create user role: ${error.message}`);
      throw new BadRequestException("Failed to create role assignment");
    }

    const result = {
      id: data.id,
      user_id: data.user_id,
      organization_id: data.organization_id,
      role_id: data.role_id,
      role_name: String(data.roles.role),
      organization_name: data.organizations.name,
      is_active: data.is_active ?? true,
      created_at: data.created_at ?? undefined,
    };

    // After successful role creation, update JWT
    await this.updateUserJWT(createRoleDto.user_id, req);

    return result;
  }

  /**
   * Update a user role assignment
   */
  async updateUserRole(
    tableKeyId: string,
    updateRoleDto: UpdateUserRoleDto,
    req: AuthRequest,
  ): Promise<UserRoleWithDetails> {
    // Check if assignment exists
    const { data: existing, error: existingError } = await req.supabase
      .from("user_organization_roles")
      .select("id, user_id, organization_id")
      .eq("id", tableKeyId)
      .single();

    if (existingError || !existing) {
      throw new NotFoundException("Role assignment not found");
    }

    // Update the role assignment
    const { data, error } = await req.supabase
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

    if (error) {
      this.logger.error(`Failed to update user role: ${error.message}`);
      throw new BadRequestException("Failed to update role assignment");
    }

    const result = {
      id: data.id,
      user_id: data.user_id,
      organization_id: data.organization_id,
      role_id: data.role_id,
      role_name: String(data.roles.role),
      organization_name: data.organizations.name,
      is_active: data.is_active ?? true,
      created_at: data.created_at ?? undefined,
    };

    // After successful role update, update JWT
    await this.updateUserJWT(existing.user_id, req);

    return result;
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
    await this.updateUserJWT(existing.user_id, req);

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
    // Check if assignment exists
    const { data: existing, error: existingError } = await req.supabase
      .from("user_organization_roles")
      .select("id, user_id")
      .eq("id", tableKeyId)
      .single();

    if (existingError || !existing) {
      throw new NotFoundException("Role assignment not found");
    }

    // Hard delete
    const { error } = await req.supabase
      .from("user_organization_roles")
      .delete()
      .eq("id", tableKeyId);

    if (error) {
      this.logger.error(
        `Failed to permanently delete user role: ${error.message}`,
      );
      throw new BadRequestException(
        "Failed to permanently delete role assignment",
      );
    }

    // After successful permanent deletion, update JWT
    await this.updateUserJWT(existing.user_id, req);

    return {
      success: true,
      message: "Role assignment permanently deleted",
    };
  }

  /**
   * Get all user role assignments (admin only)
   */
  async getAllUserRoles(req: AuthRequest): Promise<UserRoleWithDetails[]> {
    const { data, error } = await req.supabase
      .from("user_organization_roles")
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
      .order("created_at", { ascending: false });

    if (error) {
      this.logger.error(`Failed to fetch all user roles: ${error.message}`);
      throw new BadRequestException("Failed to fetch user roles");
    }

    return data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      organization_id: item.organization_id,
      role_id: item.role_id,
      role_name: String(item.roles.role),
      organization_name: item.organizations.name,
      is_active: item.is_active ?? true,
      created_at: item.created_at ?? undefined,
    }));
  }

  private async updateUserJWT(userId: string, req: AuthRequest): Promise<void> {
    try {
      // Force refresh user roles and update JWT
      const { data: freshRoles } = await req.supabase
        .from("user_organization_roles")
        .select(
          `
      id, user_id, organization_id, role_id, is_active, created_at,
      roles!inner(role),
      organizations!inner(name)
    `,
        )
        .eq("user_id", userId)
        .eq("is_active", true);

      if (freshRoles) {
        const userRoles = freshRoles.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          organization_id: item.organization_id,
          role_id: item.role_id || "user",
          role_name: item.roles.role,
          organization_name: item.organizations.name,
          is_active: item.is_active ?? true,
          created_at: item.created_at ?? undefined,
        }));

        // Use the JWT service to force update
        await this.jwtService.forceUpdateJWTWithRoles(userId, userRoles);
      }
    } catch (error) {
      this.logger.error(
        `Failed to update JWT for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
