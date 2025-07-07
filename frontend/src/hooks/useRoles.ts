import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCurrentUserRoles,
  fetchAllUserRoles,
  createUserRole,
  updateUserRole,
  deleteUserRole,
  permanentDeleteUserRole,
  clearRoleErrors,
  selectCurrentUserRoles,
  selectCurrentUserOrganizations,
  selectIsSuperVera,
  selectAllUserRoles,
  selectRolesLoading,
  selectAdminLoading,
  selectRolesError,
  selectAdminError,
  selectIsAdmin,
  hasRole,
  hasAnyRole,
} from "@/store/slices/rolesSlice";
import { CreateUserRoleDto, UpdateUserRoleDto } from "@/types/roles";

export const useRoles = () => {
  const dispatch = useAppDispatch();

  // Current user roles and organizations
  const currentUserRoles = useAppSelector(selectCurrentUserRoles);
  const currentUserOrganizations = useAppSelector(
    selectCurrentUserOrganizations,
  );
  const isSuperVera = useAppSelector(selectIsSuperVera);
  const isAdmin = useAppSelector(selectIsAdmin);

  // Admin data
  const allUserRoles = useAppSelector(selectAllUserRoles);

  // Loading states
  const loading = useAppSelector(selectRolesLoading);
  const adminLoading = useAppSelector(selectAdminLoading);

  // Error states
  const error = useAppSelector(selectRolesError);
  const adminError = useAppSelector(selectAdminError);

  // Role checking functions - FIX: Use proper role checking based on current roles
  const checkHasRole = useCallback(
    (roleName: string, organizationId?: string) => {
      return currentUserRoles.some((role) => {
        const roleMatch = role.role_name === roleName;
        const orgMatch = organizationId
          ? role.organization_id === organizationId
          : true;
        return roleMatch && orgMatch && role.is_active;
      });
    },
    [currentUserRoles],
  );

  const checkHasAnyRole = useCallback(
    (roleNames: string[], organizationId?: string) => {
      return roleNames.some((roleName) =>
        checkHasRole(roleName, organizationId),
      );
    },
    [checkHasRole],
  );

  // Actions
  const refreshCurrentUserRoles = useCallback(() => {
    return dispatch(fetchCurrentUserRoles());
  }, [dispatch]);

  const refreshAllUserRoles = useCallback(() => {
    return dispatch(fetchAllUserRoles());
  }, [dispatch]);

  const createRole = useCallback(
    (roleData: CreateUserRoleDto) => {
      return dispatch(createUserRole(roleData));
    },
    [dispatch],
  );

  const updateRole = useCallback(
    (tableKeyId: string, updateData: UpdateUserRoleDto) => {
      return dispatch(updateUserRole({ tableKeyId, updateData }));
    },
    [dispatch],
  );

  const deleteRole = useCallback(
    (tableKeyId: string) => {
      return dispatch(deleteUserRole(tableKeyId));
    },
    [dispatch],
  );

  const permanentDeleteRole = useCallback(
    (tableKeyId: string) => {
      return dispatch(permanentDeleteUserRole(tableKeyId));
    },
    [dispatch],
  );

  const clearErrors = useCallback(() => {
    dispatch(clearRoleErrors());
  }, [dispatch]);

  const refreshAll = useCallback(async () => {
    await dispatch(fetchCurrentUserRoles());
  }, [dispatch]);

  // Auto-fetch current user roles on mount
  useEffect(() => {
    if (currentUserRoles.length === 0) {
      dispatch(fetchCurrentUserRoles());
    }
  }, []);

  return {
    // Data
    currentUserRoles,
    currentUserOrganizations,
    allUserRoles,

    // Status
    isSuperVera,
    isAdmin,
    loading,
    adminLoading,
    error,
    adminError,

    // Role checking
    hasRole: checkHasRole,
    hasAnyRole: checkHasAnyRole,

    // Actions
    refreshCurrentUserRoles,
    refreshAllUserRoles,
    createRole,
    updateRole,
    deleteRole,
    permanentDeleteRole,
    clearErrors,
    refreshAll,
  };
};
