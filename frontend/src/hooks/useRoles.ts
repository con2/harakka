import { useCallback, useEffect, useRef, useState } from "react";
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

  // Loading states
  const loading = useAppSelector(selectRolesLoading);
  const adminLoading = useAppSelector(selectAdminLoading);

  // Error states
  const error = useAppSelector(selectRolesError);
  const adminError = useAppSelector(selectAdminError);

  // Auto-refresh current user roles when loading state indicates a change
  useEffect(() => {
    if (loading && responseReceived) {
      dispatch(fetchCurrentUserRoles()).catch((error) => {
        console.error("❌ Failed to refresh current user roles:", error);
      });
    }
  }, [loading, responseReceived, dispatch]);

  // Role checking functions
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

  // Automatically refresh current user roles if needed
  const createRole = useCallback(
    async (roleData: CreateUserRoleDto) => {
      const result = await dispatch(createUserRole(roleData));

      // If the role was created for the current user, wait a moment for JWT to update
      const currentUserId = localStorage.getItem("userId");
      if (currentUserId && roleData.user_id === currentUserId) {
        setTimeout(() => {
          dispatch(fetchCurrentUserRoles());
        }, 1500); // Give backend time to update JWT
      }

      return result;
    },
    [dispatch],
  );

  const updateRole = useCallback(
    async (tableKeyId: string, updateData: UpdateUserRoleDto) => {
      const result = await dispatch(updateUserRole({ tableKeyId, updateData }));

      // Check if this update affects the current user
      const currentUserId = localStorage.getItem("userId");
      const affectedRole = allUserRoles.find((role) => role.id === tableKeyId);

      if (currentUserId && affectedRole?.user_id === currentUserId) {
        setTimeout(() => {
          dispatch(fetchCurrentUserRoles());
        }, 1500); // Give backend time to update JWT
      }

      return result;
    },
    [dispatch, allUserRoles],
  );

  const deleteRole = useCallback(
    async (tableKeyId: string) => {
      const roleToDelete = allUserRoles.find((role) => role.id === tableKeyId);
      const result = await dispatch(deleteUserRole(tableKeyId));

      // Check if this deletion affects the current user
      const currentUserId = localStorage.getItem("userId");
      if (currentUserId && roleToDelete?.user_id === currentUserId) {
        setTimeout(() => {
          dispatch(fetchCurrentUserRoles());
        }, 1500); // Give backend time to update JWT
      }

      return result;
    },
    [dispatch, allUserRoles],
  );

  const permanentDeleteRole = useCallback(
    async (tableKeyId: string) => {
      const roleToDelete = allUserRoles.find((role) => role.id === tableKeyId);
      const result = await dispatch(permanentDeleteUserRole(tableKeyId));

      // Check if this deletion affects the current user
      const currentUserId = localStorage.getItem("userId");
      if (currentUserId && roleToDelete?.user_id === currentUserId) {
        setTimeout(() => {
          dispatch(fetchCurrentUserRoles());
        }, 1500); // Give backend time to update JWT
      }

      return result;
    },
    [dispatch, allUserRoles],
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

  // Auto-fetch current user roles exactly once on mount and limit retries
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
    }
  }, [dispatch, loading, fetchAttempts]);

  return {
    // Data
    currentUserRoles,
    currentUserOrganizations,
    allUserRoles,

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
    createRole,
    updateRole,
    deleteRole,
    permanentDeleteRole,
    clearErrors,
    refreshAll,
  };
};
