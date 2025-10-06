import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import {
  UserBanHistoryDto,
  ViewUserBanStatusRow,
} from "./dto/user-banning.dto";
import {
  BanForRoleDto,
  BanForOrgDto,
  BanForAppDto,
  UnbanDto,
  BanOperationResult,
  UserBanStatusCheck,
} from "./interfaces/user-banning.interface";
import { AuthRequest } from "../../middleware/interfaces/auth-request.interface";
import { handleSupabaseError } from "../../utils/handleError.utils";

@Injectable()
export class UserBanningService {
  constructor() {}
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
    const { data, error } = await req.supabase.rpc("ban_user_for_role", {
      p_target_user: userId,
      p_organization_id: organizationId,
      p_role_id: roleId,
      p_reason: banReason,
      p_is_permanent: isPermanent,
      p_notes: notes ?? undefined,
    });

    if (error) {
      handleSupabaseError(error);
    }

    if (!data) {
      throw new NotFoundException("Ban operation did not return a record");
    }
    return {
      success: true,
      message: `User has been banned for the specific role successfully`,
      banRecord: data,
      ban_history_id: data.id,
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
    const { data, error } = await req.supabase.rpc("ban_user_for_org", {
      p_target_user: userId,
      p_organization_id: organizationId,
      p_reason: banReason,
      p_is_permanent: isPermanent,
      p_notes: notes ?? undefined,
    });

    if (error) {
      handleSupabaseError(error);
    }

    if (!data) {
      throw new NotFoundException(
        "No active roles found for user in this organization",
      );
    }
    return {
      success: true,
      message: `User has been banned from the organization successfully`,
      banRecord: data,
      ban_history_id: data.id,
    };
  }

  /**
   * Ban user from the entire application
   */
  async banForApp(
    { userId, banReason, isPermanent = false, notes }: BanForAppDto,
    req: AuthRequest,
  ): Promise<BanOperationResult> {
    const { data, error } = await req.supabase.rpc("ban_user_for_app", {
      p_target_user: userId,
      p_reason: banReason,
      p_is_permanent: isPermanent,
      p_notes: notes ?? undefined,
    });

    if (error) {
      handleSupabaseError(error);
    }

    if (!data) {
      throw new NotFoundException("No active roles found for user");
    }

    return {
      success: true,
      message: `User has been banned from the entire application successfully`,
      banRecord: data,
      ban_history_id: data.id,
    };
  }

  /**
   * Unban user based on ban type
   */
  async unbanUser(
    unbanDto: UnbanDto,
    req: AuthRequest,
  ): Promise<BanOperationResult> {
    if (unbanDto.banType === "banForRole") {
      if (!unbanDto.organizationId || !unbanDto.roleId) {
        throw new BadRequestException(
          "Organization ID and Role ID are required for role unban",
        );
      }
    }

    if (unbanDto.banType === "banForOrg" && !unbanDto.organizationId) {
      throw new BadRequestException(
        "Organization ID is required for organisation unban",
      );
    }

    const { data, error } = await req.supabase.rpc("unban_user", {
      p_target_user: unbanDto.userId,
      p_ban_type: unbanDto.banType,
      p_organization_id: unbanDto.organizationId ?? undefined,
      p_role_id: unbanDto.roleId ?? undefined,
      p_notes: unbanDto.notes ?? undefined,
    });

    if (error) {
      handleSupabaseError(error);
    }

    if (!data || data.length === 0) {
      throw new NotFoundException("No active ban found to remove");
    }

    return {
      success: true,
      message: `User has been unbanned successfully`,
      banRecords: data,
      ban_history_id: data[0]?.id,
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
  async getAllUserBanStatuses(
    req: AuthRequest,
  ): Promise<ViewUserBanStatusRow[]> {
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
    const { data: viewRow, error: statusError } = await req.supabase
      .from("view_user_ban_status")
      .select(
        "id, ban_status, ban_reason, latest_ban_type, latest_action, banned_at, is_permanent",
      )
      .eq("id", userId)
      .maybeSingle();

    if (statusError) {
      handleSupabaseError(statusError);
    }

    const { data: roleDetails, error: roleDetailsError } = await req.supabase
      .from("view_user_roles_with_details")
      .select(
        "organization_id, organization_name, role_id, role_name, is_active",
      )
      .eq("user_id", userId);

    if (roleDetailsError) {
      handleSupabaseError(roleDetailsError);
    }

    const orgStats = new Map<
      string,
      { name: string | null; active: number; total: number }
    >();
    const bannedRolesMap = new Map<
      string,
      {
        organizationId: string;
        organizationName: string | null;
        roleId: string;
        roleName: string | null;
      }
    >();

    (roleDetails ?? []).forEach((role) => {
      if (!role.organization_id) {
        return;
      }

      if (!orgStats.has(role.organization_id)) {
        orgStats.set(role.organization_id, {
          name: role.organization_name,
          active: 0,
          total: 0,
        });
      }
      const orgSummary = orgStats.get(role.organization_id)!;
      orgSummary.total += 1;
      if (role.is_active) {
        orgSummary.active += 1;
      } else {
        const key = `${role.organization_id}-${role.role_id}`;
        if (role.role_id && !bannedRolesMap.has(key)) {
          bannedRolesMap.set(key, {
            organizationId: role.organization_id,
            organizationName: role.organization_name,
            roleId: role.role_id,
            roleName: role.role_name,
          });
        }
      }
    });

    const bannedFromOrganizations = Array.from(orgStats.entries())
      .filter(([, stats]) => stats.total > 0 && stats.active === 0)
      .map(([organizationId, stats]) => ({
        organizationId,
        organizationName: stats.name,
      }));

    const bannedFromRoles = Array.from(bannedRolesMap.values());

    const isBannedForApp =
      viewRow?.ban_status === "banned_app" ||
      ((roleDetails ?? []).length > 0 &&
        (roleDetails ?? []).every((role) => role.is_active === false));

    const isBanned =
      isBannedForApp ||
      bannedFromOrganizations.length > 0 ||
      bannedFromRoles.length > 0;

    return {
      userId,
      isBanned,
      isBannedForApp,
      bannedFromOrganizations,
      bannedFromRoles,
      banReason: viewRow?.ban_reason ?? null,
      latestBanType: viewRow?.latest_ban_type ?? null,
      latestAction: viewRow?.latest_action ?? null,
      bannedAt: viewRow?.banned_at ?? null,
      isPermanent: viewRow?.is_permanent ?? null,
    };
  }
}
