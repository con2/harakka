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
  isTenantAdminRole,
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
  const isActiveRoleTenantAdmin = isTenantAdminRole(activeRoleName || "");

  /**
   * Check if a user is currently banned (shared logic)
   * For tenant_admin: only show bans relevant to their active organization
   * For super_admin: show all bans
   */
  const isUserBanned = useCallback(
    (userId: string): boolean => {
      const userStatus = userBanStatuses[userId];

      if (!userStatus) return false;

      if (isActiveRoleSuper) {
        return userStatus.isBanned;
      }

      if (isActiveRoleTenantAdmin && activeOrgId) {
        if (userStatus.isBannedForApp) {
          return true;
        }

        const orgBan = userStatus.bannedFromOrganizations.some(
          (org) => org.organizationId === activeOrgId,
        );
        if (orgBan) {
          return true;
        }

        const roleBan = userStatus.bannedFromRoles.some(
          (role) => role.organizationId === activeOrgId,
        );

        return roleBan;
      }

      return false;
    },
    [userBanStatuses, isActiveRoleSuper, isActiveRoleTenantAdmin, activeOrgId],
  );

  /**
   * Check if current user can ban a target user based on hierarchy and organization context
   */
  const canBanUser = useCallback(
    (targetUserId: string): boolean => {
      // super_admin can ban anyone from anywhere
      if (isActiveRoleSuper) {
        return true;
      }

      // tenant_admin can only ban users whose role is below their own within their active org
      if (isActiveRoleTenantAdmin && activeOrgId) {
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
      isActiveRoleTenantAdmin,
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
          (isActiveRoleSuper || isActiveRoleTenantAdmin) && canBanTarget, // Super admins and tenant admins can ban from org
        canBanFromRole:
          (isActiveRoleSuper || isActiveRoleTenantAdmin) && canBanTarget, // Super admins and tenant admins can ban from role
      };
    },
    [canBanUser, isActiveRoleSuper, isActiveRoleTenantAdmin],
  );

  /**
   * Check if current user has any banning permissions
   */
  const hasBanPermissions = useCallback((): boolean => {
    return isActiveRoleSuper || isActiveRoleTenantAdmin;
  }, [isActiveRoleSuper, isActiveRoleTenantAdmin]);

  return {
    canBanUser,
    getBanPermissions,
    hasBanPermissions,
    isUserBanned,
    isActiveRoleSuper,
    isActiveRoleTenantAdmin,
  };
};
