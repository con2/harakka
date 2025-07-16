import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCurrentUserRoles,
  fetchAllUserRoles,
  fetchAvailableRoles,
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
  selectAvailableRoles,
} from "@/store/slices/rolesSlice";
import { CreateUserRoleDto, UpdateUserRoleDto } from "@/types/roles";

export const useRoles = () => {
  const dispatch = useAppDispatch();

  // Track fetch attempts with a state to ensure it survives re-renders
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const MAX_FETCH_ATTEMPTS = 2;
  const initialFetchAttempted = useRef(false);

  // Track if we've received a response (even an empty one)
  const [responseReceived, setResponseReceived] = useState(false);

  // Current user roles and organizations
  const currentUserRoles = useAppSelector(selectCurrentUserRoles);
  const currentUserOrganizations = useAppSelector(
    selectCurrentUserOrganizations,
  );
  const isSuperVera = useAppSelector(selectIsSuperVera);
  const isAdmin = useAppSelector(selectIsAdmin);

  // Admin data
  const allUserRoles = useAppSelector(selectAllUserRoles);

  // Available roles for dropdowns
  const availableRoles = useAppSelector(selectAvailableRoles);

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
    if (fetchAttempts < MAX_FETCH_ATTEMPTS) {
      setFetchAttempts((prev) => prev + 1);
      return dispatch(fetchCurrentUserRoles()).then((result) => {
        setResponseReceived(true);
        return result;
      });
    }
    return Promise.resolve({ type: "roles/fetchCurrentUserRoles/rejected" });
  }, [dispatch, fetchAttempts]);

  const refreshAllUserRoles = useCallback(() => {
    if (fetchAttempts < MAX_FETCH_ATTEMPTS) {
      setFetchAttempts((prev) => prev + 1);
      return dispatch(fetchAllUserRoles());
    }
    return Promise.resolve({ type: "roles/fetchAllUserRoles/rejected" });
  }, [dispatch, fetchAttempts]);

  const refreshAvailableRoles = useCallback(() => {
    return dispatch(fetchAvailableRoles());
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
    // Only refresh if we haven't exceeded maximum attempts
    if (fetchAttempts < MAX_FETCH_ATTEMPTS) {
      setFetchAttempts((prev) => prev + 1);
      await dispatch(fetchCurrentUserRoles());
    }
  }, [dispatch, fetchAttempts]);

  // Auto-fetch current user roles and available roles on mount exactly once on mount and limit retries
  useEffect(() => {
    if (
      !initialFetchAttempted.current &&
      !loading &&
      fetchAttempts < MAX_FETCH_ATTEMPTS
    ) {
      console.log(
        `Initial roles fetch (attempt ${fetchAttempts + 1}/${MAX_FETCH_ATTEMPTS})`,
      );
      initialFetchAttempted.current = true;
      setFetchAttempts((prev) => prev + 1);

      dispatch(fetchCurrentUserRoles())
        .then(() => {
          setResponseReceived(true);
        })
        .catch(() => {
          setResponseReceived(true); // Even on error, we've received a response
        });
      dispatch(fetchAvailableRoles());
    }
  }, [dispatch, loading, fetchAttempts]);

  return {
    // Data
    currentUserRoles,
    currentUserOrganizations,
    allUserRoles,
    availableRoles,

    // Status
    isSuperVera,
    isAdmin,
    loading: loading && !responseReceived, // Only show loading if we haven't received any response
    adminLoading,
    error,
    adminError,

    // Role checking
    hasRole: checkHasRole,
    hasAnyRole: checkHasAnyRole,

    // Actions
    refreshCurrentUserRoles,
    refreshAllUserRoles,
    refreshAvailableRoles,
    createRole,
    updateRole,
    deleteRole,
    permanentDeleteRole,
    clearErrors,
    refreshAll,
  };
};
