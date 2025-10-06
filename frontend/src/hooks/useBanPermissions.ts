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

        return userStatus.bannedFromOrganizations.some(
          (org) => org.organizationId === activeOrgId,
        );
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
      if (isActiveRoleSuper) {
        return true;
      }

      if (isActiveRoleTenantAdmin && activeOrgId) {
        const targetUserRoles = allUserRoles.filter(
          (role) => role.user_id === targetUserId,
        );

        if (
          !targetUserRoles.some((role) => role.organization_id === activeOrgId)
        ) {
          return false;
        }

        const currentUserLevel =
          ROLE_HIERARCHY[activeRoleName as RoleName] || -1;

        return targetUserRoles
          .filter((role) => role.organization_id === activeOrgId)
          .every((role) => {
            const targetRoleLevel =
              ROLE_HIERARCHY[role.role_name as RoleName] ?? -1;
            return targetRoleLevel < currentUserLevel;
          });
      }

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
        canBanFromApp: isActiveRoleSuper && canBanTarget,
        canBanFromOrg:
          (isActiveRoleSuper || isActiveRoleTenantAdmin) && canBanTarget,
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
