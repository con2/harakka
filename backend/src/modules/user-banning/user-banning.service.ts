import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  BanForRoleDto,
  BanForOrgDto,
  BanForAppDto,
  UnbanDto,
  UserBanHistoryDto,
  UserBanStatusDto,
  BanOperationResult,
  UserBanStatusCheck,
} from "./dto/user-banning.dto";
import { AuthRequest } from "../../middleware/interfaces/auth-request.interface";
import { handleSupabaseError } from "../../utils/handleError.utils";

@Injectable()
export class UserBanningService {
  private readonly logger = new Logger(UserBanningService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Ban user for a specific role in an organization
   */
  async banForRole(
    banForRoleDto: BanForRoleDto,
    req: AuthRequest,
  ): Promise<BanOperationResult> {
    const {
      userId,
      organizationId,
      roleId,
      banReason,
      isPermanent = false,
      notes,
    } = banForRoleDto;
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

    // Validate permissions
    await this.validateBanPermissions(userId, req);

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

    this.logger.log(
      `User ${userId} banned for role ${roleId} in org ${organizationId} by ${bannedByUserId}`,
    );

    return {
      success: true,
      message: `User has been banned for the specific role successfully`,
    };
  }

  /**
   * Ban user for all roles in an organization
   */
  async banForOrg(
    banForOrgDto: BanForOrgDto,
    req: AuthRequest,
  ): Promise<BanOperationResult> {
    const {
      userId,
      organizationId,
      banReason,
      isPermanent = false,
      notes,
    } = banForOrgDto;
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

    // Validate permissions
    await this.validateBanPermissions(userId, req);

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

    this.logger.log(
      `User ${userId} banned from organization ${organizationId} by ${bannedByUserId}`,
    );

    return {
      success: true,
      message: `User has been banned from the organization successfully`,
    };
  }

  /**
   * Ban user from the entire application
   */
  async banForApp(
    banForAppDto: BanForAppDto,
    req: AuthRequest,
  ): Promise<BanOperationResult> {
    const { userId, banReason, isPermanent = false, notes } = banForAppDto;
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

    // Validate permissions
    await this.validateBanPermissions(userId, req);

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

    this.logger.log(
      `User ${userId} banned from entire application by ${bannedByUserId}`,
    );

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
    // Validate permissions
    await this.validateBanPermissions(unbanDto.userId, req);

    let updateQuery = req.supabase
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
      updateQuery = updateQuery
        .eq("organization_id", unbanDto.organizationId)
        .eq("role_id", unbanDto.roleId);
    } else if (unbanDto.banType === "banForOrg") {
      if (!unbanDto.organizationId) {
        throw new BadRequestException(
          "Organization ID is required for unbanForOrg",
        );
      }
      updateQuery = updateQuery.eq("organization_id", unbanDto.organizationId);
    }
    // For banForApp, no additional filters needed

    const { error: updateError } = await updateQuery;

    if (updateError) {
      handleSupabaseError(updateError);
    }

    // Create unban history record
    const { error: historyError } = await req.supabase
      .from("user_ban_history")
      .insert({
        user_id: unbanDto.userId,
        banned_by: req.user.id,
        ban_type: unbanDto.banType,
        action: "unbanned",
        organization_id: unbanDto.organizationId,
        unbanned_at: new Date().toISOString(),
        notes: unbanDto.notes,
      });

    if (historyError) {
      this.logger.warn(
        `Failed to create unban history: ${historyError.message}`,
      );
      // Don't rollback unban for history failure
    }

    this.logger.log(
      `User ${unbanDto.userId} unbanned (${unbanDto.banType}) by ${req.user.id}`,
    );

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
  async getAllUserBanStatuses(req: AuthRequest): Promise<UserBanStatusDto[]> {
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
      isBannedForApp,
      bannedOrganizations,
      bannedRoles,
    };
  }

  /**
   * Validate if the requesting user has permission to ban/unban the target user
   * TODO: Update based on customer needs - right now admins and superVeras can ban users, and only superVeras can ban admins, superVeras can't be banned atm
   */
  private async validateBanPermissions(
    targetUserId: string,
    req: AuthRequest,
  ): Promise<void> {
    // Check if the requesting user has admin or superVera privileges
    const hasAdminRole = req.userRoles.some(
      (role) =>
        (role.role_name === "admin" || role.role_name === "superVera") &&
        role.is_active,
    );

    if (!hasAdminRole) {
      throw new ForbiddenException(
        "Insufficient permissions to ban/unban users",
      );
    }

    // Get target user's roles to prevent admins from banning other admins
    const { data: targetUserRoles } = await req.supabase
      .from("view_user_roles_with_details")
      .select("role_name")
      .eq("user_id", targetUserId)
      .eq("is_active", true);

    const targetIsAdmin = targetUserRoles?.some(
      (role) => role.role_name === "admin" || role.role_name === "superVera",
    );

    const requesterIsSuperVera = req.userRoles.some(
      (role) => role.role_name === "superVera" && role.is_active,
    );

    if (targetIsAdmin && !requesterIsSuperVera) {
      throw new ForbiddenException("Only superVera can ban admin users");
    }

    if (targetUserRoles?.some((role) => role.role_name === "superVera")) {
      throw new ForbiddenException("Cannot ban superVera users");
    }
  }
}
