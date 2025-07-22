import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  BanForRoleDto,
  BanForOrgDto,
  BanForAppDto,
  UnbanDto,
  BanOperationResult,
  UserBanStatusCheck,
  UserBanHistoryDto,
  ViewUserBanStatusRow,
} from "./dto/user-banning.dto";
import { AuthRequest } from "../../middleware/interfaces/auth-request.interface";
import { handleSupabaseError } from "../../utils/handleError.utils";

@Injectable()
export class UserBanningService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Check if user has required admin roles for banning operations
   */
  private validateAdminPermissions(req: AuthRequest): void {
    const requiredRoles = ["admin", "main_admin", "super_admin", "superVera"];
    
    // Check both 'name' and 'role_name' fields to be compatible with any JWT format
    const hasPermission = req.userRoles?.some((role) => {
      const roleObj = role as Record<string, unknown>;
      const roleName = role.role_name || (roleObj.name as string) || "";
      return requiredRoles.includes(roleName) && role.is_active;
    });

    if (!hasPermission) {
      throw new BadRequestException(
        "Insufficient permissions to perform this operation",
      );
    }
  }

  /**
   * Check if user has required high-level admin roles for app-level banning
   */
  private validateHighLevelAdminPermissions(req: AuthRequest): void {
    const requiredRoles = ["main_admin", "super_admin", "superVera"];
    
    // Check both 'name' and 'role_name' fields to be compatible with any JWT format
    const hasPermission = req.userRoles?.some((role) => {
      const roleObj = role as Record<string, unknown>;
      const roleName = role.role_name || (roleObj.name as string) || "";
      return requiredRoles.includes(roleName) && role.is_active;
    });

    if (!hasPermission) {
      throw new BadRequestException(
        "Insufficient permissions to perform this operation",
      );
    }
  }
  /**
   * Ban user for a specific role in an organization
   */
  async banForRole(
    {
      userId,
      organizationId,
      roleId,
      banReason,
      isPermanent = false,
      notes,
    }: BanForRoleDto,
    req: AuthRequest,
  ): Promise<BanOperationResult> {
    // Validate admin permissions
    this.validateAdminPermissions(req);
    
    const bannedByUserId = req.user.id;
    // Find the specific role assignment
    const { data: roleAssignment, error: findError } = await req.supabase
      .from("user_organization_roles")
      .select("id, user_id, is_active")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .eq("role_id", roleId)
      .single();

    if (findError) {
      handleSupabaseError(findError);
    }
    if (!roleAssignment) {
      throw new NotFoundException("Role assignment not found");
    }

    if (!roleAssignment.is_active) {
      throw new BadRequestException("User is already banned for this role");
    }

    // Set is_active = false for this specific role assignment
    const { error: updateError } = await req.supabase
      .from("user_organization_roles")
      .update({ is_active: false })
      .eq("id", roleAssignment.id);

    if (updateError) {
      handleSupabaseError(updateError);
    }

    // Create ban history record
    const { error: historyError } = await req.supabase
      .from("user_ban_history")
      .insert({
        user_id: userId,
        banned_by: bannedByUserId,
        ban_type: "banForRole",
        action: "banned",
        ban_reason: banReason,
        is_permanent: isPermanent,
        role_assignment_id: roleAssignment.id,
        organization_id: organizationId,
        notes,
      });

    if (historyError) {
      // Rollback
      await req.supabase
        .from("user_organization_roles")
        .update({ is_active: true })
        .eq("id", roleAssignment.id);
      handleSupabaseError(historyError);
    }
    return {
      success: true,
      message: `User has been banned for the specific role successfully`,
    };
  }

  /**
   * Ban user for all roles in an organization
   */
  async banForOrg(
    {
      userId,
      organizationId,
      banReason,
      isPermanent = false,
      notes,
    }: BanForOrgDto,
    req: AuthRequest,
  ): Promise<BanOperationResult> {
    // Validate admin permissions
    this.validateAdminPermissions(req);
    
    const bannedByUserId = req.user.id;

    // Find all active role assignments for this user in this organization
    const { data: roleAssignments, error: findError } = await req.supabase
      .from("user_organization_roles")
      .select("id, role_id")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .eq("is_active", true);

    if (findError) {
      handleSupabaseError(findError);
    }

    if (!roleAssignments || roleAssignments.length === 0) {
      throw new NotFoundException(
        "No active roles found for user in this organization",
      );
    }
    // Set is_active = false for all role assignments in this organization
    const { error: updateError } = await req.supabase
      .from("user_organization_roles")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .eq("is_active", true);

    if (updateError) {
      handleSupabaseError(updateError);
    }
    // Create ban history record with affected assignments
    const { error: historyError } = await req.supabase
      .from("user_ban_history")
      .insert({
        user_id: userId,
        banned_by: bannedByUserId,
        ban_type: "banForOrg",
        action: "banned",
        ban_reason: banReason,
        is_permanent: isPermanent,
        organization_id: organizationId,
        affected_assignments: { assignments: roleAssignments },
        notes,
      });
    if (historyError) {
      // Rollback
      await req.supabase
        .from("user_organization_roles")
        .update({ is_active: true })
        .eq("user_id", userId)
        .eq("organization_id", organizationId);

      handleSupabaseError(historyError);
    }
    return {
      success: true,
      message: `User has been banned from the organization successfully`,
    };
  }

  /**
   * Ban user from the entire application
   */
  async banForApp(
    { userId, banReason, isPermanent = false, notes }: BanForAppDto,
    req: AuthRequest,
  ): Promise<BanOperationResult> {
    // Validate admin permissions
    this.validateAdminPermissions(req);
    
    const bannedByUserId = req.user.id;

    // Find all active role assignments for this user
    const { data: roleAssignments, error: findError } = await req.supabase
      .from("user_organization_roles")
      .select("id, organization_id, role_id")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (findError) {
      handleSupabaseError(findError);
    }

    if (!roleAssignments || roleAssignments.length === 0) {
      throw new NotFoundException("No active roles found for user");
    }

    // Set is_active = false for all role assignments
    const { error: updateError } = await req.supabase
      .from("user_organization_roles")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("is_active", true);

    if (updateError) {
      handleSupabaseError(updateError);
    }

    // Create ban history record with all affected assignments
    const { error: historyError } = await req.supabase
      .from("user_ban_history")
      .insert({
        user_id: userId,
        banned_by: bannedByUserId,
        ban_type: "banForApp",
        action: "banned",
        ban_reason: banReason,
        is_permanent: isPermanent,
        affected_assignments: { assignments: roleAssignments },
        notes,
      });

    if (historyError) {
      // Rollback
      await req.supabase
        .from("user_organization_roles")
        .update({ is_active: true })
        .eq("user_id", userId);

      handleSupabaseError(historyError);
    }

    return {
      success: true,
      message: `User has been banned from the entire application successfully`,
    };
  }

  /**
   * Unban user based on ban type
   */
  async unbanUser(
    unbanDto: UnbanDto,
    req: AuthRequest,
  ): Promise<BanOperationResult> {
    // Validate admin permissions
    this.validateAdminPermissions(req);
    
    // First, find the active ban record(s) to update
    let banQuery = req.supabase
      .from("user_ban_history")
      .select("id, notes")
      .eq("user_id", unbanDto.userId)
      .eq("action", "banned")
      .is("unbanned_at", null); // Only active bans

    // Apply filters based on ban type to find the specific ban record
    if (unbanDto.banType === "banForRole") {
      if (!unbanDto.organizationId || !unbanDto.roleId) {
        throw new BadRequestException(
          "Organization ID and Role ID are required for unbanForRole",
        );
      }
      banQuery = banQuery
        .eq("ban_type", "banForRole")
        .eq("organization_id", unbanDto.organizationId);

      // For role bans, we need to find the role assignment
      const { data: roleAssignment } = await req.supabase
        .from("user_organization_roles")
        .select("id")
        .eq("user_id", unbanDto.userId)
        .eq("organization_id", unbanDto.organizationId)
        .eq("role_id", unbanDto.roleId)
        .single();

      if (roleAssignment) {
        banQuery = banQuery.eq("role_assignment_id", roleAssignment.id);
      }
    } else if (unbanDto.banType === "banForOrg") {
      if (!unbanDto.organizationId) {
        throw new BadRequestException(
          "Organization ID is required for unbanForOrg",
        );
      }
      banQuery = banQuery
        .eq("ban_type", "banForOrg")
        .eq("organization_id", unbanDto.organizationId);
    } else if (unbanDto.banType === "banForApp") {
      banQuery = banQuery.eq("ban_type", "banForApp");
    }

    const { data: activeBans, error: findError } = await banQuery;

    if (findError) {
      handleSupabaseError(findError);
    }

    if (!activeBans || activeBans.length === 0) {
      throw new NotFoundException("No active ban found to remove");
    }

    // Update the ban history record(s) to mark as unbanned
    // Build the same query conditions as used to find the bans
    let historyUpdateQuery = req.supabase
      .from("user_ban_history")
      .update({
        unbanned_at: new Date().toISOString(),
        notes: unbanDto.notes ? `[Unbanned] ${unbanDto.notes}` : undefined,
      })
      .eq("user_id", unbanDto.userId)
      .eq("action", "banned")
      .is("unbanned_at", null);

    // Apply the same specific filters to ensure we only update the correct ban records
    if (unbanDto.banType === "banForRole") {
      historyUpdateQuery = historyUpdateQuery
        .eq("ban_type", "banForRole")
        .eq("organization_id", unbanDto.organizationId!);

      // For role bans, we need to find the role assignment
      const { data: roleAssignment } = await req.supabase
        .from("user_organization_roles")
        .select("id")
        .eq("user_id", unbanDto.userId)
        .eq("organization_id", unbanDto.organizationId!)
        .eq("role_id", unbanDto.roleId!)
        .single();

      if (roleAssignment) {
        historyUpdateQuery = historyUpdateQuery.eq(
          "role_assignment_id",
          roleAssignment.id,
        );
      }
    } else if (unbanDto.banType === "banForOrg") {
      historyUpdateQuery = historyUpdateQuery
        .eq("ban_type", "banForOrg")
        .eq("organization_id", unbanDto.organizationId!);
    } else if (unbanDto.banType === "banForApp") {
      historyUpdateQuery = historyUpdateQuery.eq("ban_type", "banForApp");
    }

    const { error: historyUpdateError } = await historyUpdateQuery;

    if (historyUpdateError) {
      handleSupabaseError(historyUpdateError);
    }

    // Update user_organization_roles to reactivate roles
    let roleUpdateQuery = req.supabase
      .from("user_organization_roles")
      .update({ is_active: true })
      .eq("user_id", unbanDto.userId)
      .eq("is_active", false);

    // Apply filters based on ban type
    if (unbanDto.banType === "banForRole") {
      if (!unbanDto.organizationId || !unbanDto.roleId) {
        throw new BadRequestException(
          "Organization ID and Role ID are required for unbanForRole",
        );
      }
      roleUpdateQuery = roleUpdateQuery
        .eq("organization_id", unbanDto.organizationId)
        .eq("role_id", unbanDto.roleId);
    } else if (unbanDto.banType === "banForOrg") {
      if (!unbanDto.organizationId) {
        throw new BadRequestException(
          "Organization ID is required for unbanForOrg",
        );
      }
      roleUpdateQuery = roleUpdateQuery.eq(
        "organization_id",
        unbanDto.organizationId,
      );
    }
    // For banForApp, no additional filters needed

    const { error: roleUpdateError } = await roleUpdateQuery;

    if (roleUpdateError) {
      handleSupabaseError(roleUpdateError);
    }

    return {
      success: true,
      message: `User has been unbanned successfully`,
    };
  }

  /**
   * Get ban history for a user
   */
  async getUserBanHistory(
    userId: string,
    req: AuthRequest,
  ): Promise<UserBanHistoryDto[]> {
    // Validate admin permissions
    this.validateAdminPermissions(req);
    
    const { data, error } = await req.supabase
      .from("user_ban_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }
    return data || [];
  }

  /**
   * Get all user ban statuses (admin view)
   */
  async getAllUserBanStatuses(
    req: AuthRequest,
  ): Promise<ViewUserBanStatusRow[]> {
    // Validate admin permissions
    this.validateAdminPermissions(req);
    
    const { data, error } = await req.supabase
      .from("view_user_ban_status")
      .select("*")
      .order("user_created_at", { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    return data || [];
  }

  /**
   * Check if user is banned
   */
  async checkUserBanStatus(
    userId: string,
    req: AuthRequest,
  ): Promise<UserBanStatusCheck> {
    // Validate admin permissions
    this.validateAdminPermissions(req);
    
    // Get all role assignments for the user
    const { data: allRoles, error: allRolesError } = await req.supabase
      .from("user_organization_roles")
      .select("organization_id, role_id, is_active")
      .eq("user_id", userId);

    if (allRolesError) {
      handleSupabaseError(allRolesError);
    }

    const activeRoles = allRoles?.filter((role) => role.is_active) || [];
    const inactiveRoles = allRoles?.filter((role) => !role.is_active) || [];

    // Check if banned from entire app
    const isBannedForApp =
      activeRoles.length === 0 && allRoles && allRoles.length > 0;

    // Get organizations where user is completely banned
    const bannedOrganizations: string[] = [];
    const organizationRoles = new Map<
      string,
      { active: number; total: number }
    >();

    allRoles?.forEach((role) => {
      const orgId = role.organization_id;
      if (!organizationRoles.has(orgId)) {
        organizationRoles.set(orgId, { active: 0, total: 0 });
      }
      const orgData = organizationRoles.get(orgId)!;
      orgData.total++;
      if (role.is_active) {
        orgData.active++;
      }
    });

    organizationRoles.forEach((data, orgId) => {
      if (data.active === 0 && data.total > 0) {
        bannedOrganizations.push(orgId);
      }
    });

    // Get specific banned roles
    const bannedRoles = inactiveRoles.map((role) => ({
      organizationId: role.organization_id,
      roleId: role.role_id,
    }));

    return {
      userId,
      isBannedFromApp: isBannedForApp,
      bannedFromOrganizations: bannedOrganizations,
      bannedFromRoles: bannedRoles.map(
        (role) => `${role.organizationId}-${role.roleId}`,
      ),
    };
  }
}
