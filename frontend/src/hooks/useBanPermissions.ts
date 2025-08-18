import { useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  selectActiveOrganizationId,
  selectActiveRoleName,
  selectAllUserRoles,
} from "@/store/slices/rolesSlice";
import { selectUserBanStatuses } from "@/store/slices/userBanningSlice";
import {
  ROLE_HIERARCHY,
  type RoleName,
  isSuperAdminRole,
  isMainAdminRole,
} from "@/utils/roleHierarchy";

export interface BanPermissions {
  canBanFromApp: boolean;
  canBanFromOrg: boolean;
  canBanFromRole: boolean;
}

/**
 * Custom hook for checking user banning permissions based on role hierarchy and organization context
 */
export const useBanPermissions = () => {
  const activeOrgId = useAppSelector(selectActiveOrganizationId);
  const activeRoleName = useAppSelector(selectActiveRoleName);
  const allUserRoles = useAppSelector(selectAllUserRoles);
  const userBanStatuses = useAppSelector(selectUserBanStatuses);

  // Check if current user has super admin privileges
  const isActiveRoleSuper = isSuperAdminRole(activeRoleName || "");
  const isActiveRoleMainAdmin = isMainAdminRole(activeRoleName || "");

  /**
   * Check if a user is currently banned (shared logic)
   * For tenant_admin: only show bans relevant to their active organization
   * For super_admin/superVera: show all bans
   */
  const isUserBanned = useCallback(
    (userId: string): boolean => {
      const userStatus = userBanStatuses[userId];

      if (!userStatus) return false;

      // Check if user has any active bans
      const banStatus = userStatus as unknown as Record<string, unknown>;

      // For super admins, show all bans
      if (isActiveRoleSuper) {
        return Boolean(
          banStatus.isBannedFromApp ||
            (banStatus.bannedFromOrganizations as string[])?.length > 0 ||
            (banStatus.bannedFromRoles as string[])?.length > 0 ||
            userStatus.isBanned,
        );
      }

      // For tenant_admin, only show bans relevant to their organization context
      if (isActiveRoleMainAdmin && activeOrgId) {
        // Check if user is banned from the app (applies to all orgs)
        if (banStatus.isBannedFromApp || userStatus.isBanned) {
          return true;
        }

        // Check if user is banned from the current active organization
        const bannedFromOrgs =
          (banStatus.bannedFromOrganizations as string[]) || [];
        if (bannedFromOrgs.includes(activeOrgId)) {
          return true;
        }

        // Check if user is banned from roles within the current organization
        // Get user's roles in the active org
        const userRolesInActiveOrg = allUserRoles.filter(
          (role) =>
            role.user_id === userId && role.organization_id === activeOrgId,
        );

        const bannedFromRoles = (banStatus.bannedFromRoles as string[]) || [];
        const isRoleBannedInActiveOrg = userRolesInActiveOrg.some((role) =>
          bannedFromRoles.includes(role.role_name || ""),
        );

        return isRoleBannedInActiveOrg;
      }

      // For other users (admin, etc.), don't show ban status
      return false;
    },
    [
      userBanStatuses,
      isActiveRoleSuper,
      isActiveRoleMainAdmin,
      activeOrgId,
      allUserRoles,
    ],
  );

  /**
   * Check if current user can ban a target user based on hierarchy and organization context
   */
  const canBanUser = useCallback(
    (targetUserId: string): boolean => {
      // super_admin and superVera can ban anyone from anywhere
      if (isActiveRoleSuper) {
        return true;
      }

      // tenant_admin can only ban users whose role is below their own within their active org
      if (isActiveRoleMainAdmin && activeOrgId) {
        // For ban permissions, we need to check ALL roles (active and inactive)
        // because banned users will have inactive roles but we still need to manage them
        const targetUserRoles = allUserRoles.filter(
          (role) => role.user_id === targetUserId,
        );

        // Get target user's roles in the current active org (excluding Global roles)
        const targetOrgRoles = targetUserRoles.filter(
          (role) => role.organization_id === activeOrgId,
        );

        // If target user has no roles in the active org, they cannot be banned by tenant_admin
        if (targetOrgRoles.length === 0) {
          return false;
        }

        const currentUserLevel =
          ROLE_HIERARCHY[activeRoleName as RoleName] || -1;

        // Check if all target user's roles in the active org are below tenant_admin level
        const canBanAllRoles = targetOrgRoles.every((role) => {
          const targetRoleLevel =
            ROLE_HIERARCHY[role.role_name as RoleName] ?? -1;
          return targetRoleLevel < currentUserLevel;
        });

        return canBanAllRoles;
      }

      // All other users (admin, storage_manager, requester, user) cannot ban
      return false;
    },
    [
      isActiveRoleSuper,
      isActiveRoleMainAdmin,
      activeOrgId,
      activeRoleName,
      allUserRoles,
    ],
  );

  /**
   * Get ban permissions for a specific target user
   */
  const getBanPermissions = useCallback(
    (targetUserId: string): BanPermissions => {
      const canBanTarget = canBanUser(targetUserId);

      return {
        canBanFromApp: isActiveRoleSuper && canBanTarget, // Only super admins can ban from application
        canBanFromOrg:
          (isActiveRoleSuper || isActiveRoleMainAdmin) && canBanTarget, // Super admins and main admins can ban from org
        canBanFromRole:
          (isActiveRoleSuper || isActiveRoleMainAdmin) && canBanTarget, // Super admins and main admins can ban from role
      };
    },
    [canBanUser, isActiveRoleSuper, isActiveRoleMainAdmin],
  );

  /**
   * Check if current user has any banning permissions
   */
  const hasBanPermissions = useCallback((): boolean => {
    return isActiveRoleSuper || isActiveRoleMainAdmin;
  }, [isActiveRoleSuper, isActiveRoleMainAdmin]);

  return {
    canBanUser,
    getBanPermissions,
    hasBanPermissions,
    isUserBanned,
    isActiveRoleSuper,
    isActiveRoleMainAdmin,
  };
};
