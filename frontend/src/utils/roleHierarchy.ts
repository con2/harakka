/**
 * Role hierarchy utilities for user management system
 */

// Define role hierarchy levels (higher number = higher permission level)
export const ROLE_HIERARCHY = {
  main_admin: 4,
  admin: 3,
  storage_manager: 2,
  requester: 1,
  user: 0,
} as const;

export type RoleName = keyof typeof ROLE_HIERARCHY;

/**
 * Check if one role has higher permissions than another
 */
export const isRoleHigher = (role1: string, role2: string): boolean => {
  const level1 = ROLE_HIERARCHY[role1 as RoleName] ?? -1;
  const level2 = ROLE_HIERARCHY[role2 as RoleName] ?? -1;
  return level1 > level2;
};

/**
 * Get the permission level of a role
 */
export const getRoleLevel = (roleName: string): number => {
  return ROLE_HIERARCHY[roleName as RoleName] ?? -1;
};

/**
 * Check if a role is a super admin role
 */
export const isSuperAdminRole = (roleName: string): boolean => {
  return roleName === "super_admin" || roleName === "superVera";
};

/**
 * Check if a role is a main admin role
 */
export const isMainAdminRole = (roleName: string): boolean => {
  return roleName === "main_admin";
};
