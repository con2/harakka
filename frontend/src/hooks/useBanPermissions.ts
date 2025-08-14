import { useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  selectActiveOrganizationId,
  selectActiveRoleName,
  selectAllUserRoles,
} from "@/store/slices/rolesSlice";
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

  // Check if current user has super admin privileges
  const isActiveRoleSuper = isSuperAdminRole(activeRoleName || "");
  const isActiveRoleMainAdmin = isMainAdminRole(activeRoleName || "");

  /**
   * Check if current user can ban a target user based on hierarchy and organization context
   */
  const canBanUser = useCallback(
    (targetUserId: string): boolean => {
      // super_admin and superVera can ban anyone from anywhere
      if (isActiveRoleSuper) {
        return true;
      }

      // main_admin can only ban users whose role is below their own within their active org
      if (isActiveRoleMainAdmin && activeOrgId) {
        const targetUserRoles = allUserRoles.filter(
          (role) => role.user_id === targetUserId && role.is_active,
        );

        // Get target user's roles in the current active org (excluding Global roles)
        const targetOrgRoles = targetUserRoles.filter(
          (role) => role.organization_id === activeOrgId,
        );

        // If target user has no roles in the active org, they cannot be banned by main_admin
        if (targetOrgRoles.length === 0) {
          return false;
        }

        const currentUserLevel =
          ROLE_HIERARCHY[activeRoleName as RoleName] || -1;

        // Check if all target user's roles in the active org are below main_admin level
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
    isActiveRoleSuper,
    isActiveRoleMainAdmin,
  };
};
