import { useCallback, useState, useRef } from "react";
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
  selectAllUserRoles,
  selectRolesLoading,
  selectAdminLoading,
  selectRolesError,
  selectAdminError,
  selectAvailableRoles,
} from "@/store/slices/rolesSlice";
import { CreateUserRoleDto, UpdateUserRoleDto } from "@/types/roles";

// Global cache states - shared across all hook instances
let currentRolesFetched = false;
let allRolesFetched = false;
let fetchInProgress = false;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
let lastFetchTimestamp = 0;

export const useRoles = () => {
  const dispatch = useAppDispatch();

  // Track if we've received a response (even an empty one)
  const [responseReceived, setResponseReceived] = useState(false);

  // Current user roles and organizations
  const currentUserRoles = useAppSelector(selectCurrentUserRoles);
  const currentUserOrganizations = useAppSelector(
    selectCurrentUserOrganizations,
  );

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

  const isAnyTypeOfAdmin = checkHasAnyRole([
    "admin",
    "superVera",
    "main_admin",
    "super_admin",
    "store_manager",
  ]);

  // Check if cache is stale and needs refresh
  const isCacheStale = () => {
    return Date.now() - lastFetchTimestamp > CACHE_EXPIRY;
  };

  // Module-level promise ref to persist across renders
  const globalFetchPromiseRef = useRef<Promise<unknown> | null>(null);

  const refreshCurrentUserRoles = useCallback(
    async (force = false) => {
      if (fetchInProgress && !force) {
        // Only return the shared promise
        return (
          globalFetchPromiseRef.current ||
          Promise.resolve({ type: "roles/fetchCurrentUserRoles/skipped" })
        );
      }

      if (currentRolesFetched && !isCacheStale() && !force) {
        return Promise.resolve({ type: "roles/fetchCurrentUserRoles/cached" });
      }

      // Only log when actually starting a fetch
      console.log("🔄 Fetching current user roles");
      fetchInProgress = true;
      globalFetchPromiseRef.current = dispatch(fetchCurrentUserRoles())
        .unwrap()
        .then((result) => {
          currentRolesFetched = true;
          lastFetchTimestamp = Date.now();
          setResponseReceived(true);
          return {
            type: "roles/fetchCurrentUserRoles/fulfilled",
            payload: result,
          };
        })
        .finally(() => {
          fetchInProgress = false;
          globalFetchPromiseRef.current = null;
        });

      return globalFetchPromiseRef.current;
    },
    [dispatch],
  );

  const refreshAllUserRoles = useCallback(
    async (force = false) => {
      // Only admins should fetch all roles
      if (!isAnyTypeOfAdmin) {
        console.log("⚠️ Skipping all roles fetch - user is not admin");
        return Promise.resolve({ type: "roles/fetchAllUserRoles/notAdmin" });
      }

      // Skip if a fetch is already in progress (unless forced)
      if (fetchInProgress && !force) {
        console.log("🔄 Skipping all roles fetch - already in progress");
        return Promise.resolve({ type: "roles/fetchAllUserRoles/skipped" });
      }

      // Skip if data is already cached and not stale (unless forced)
      if (allRolesFetched && !isCacheStale() && !force) {
        console.log("🔄 Skipping all roles fetch - using cached data");
        return Promise.resolve({ type: "roles/fetchAllUserRoles/cached" });
      }

      console.log("🔄 Fetching all user roles");
      fetchInProgress = true;

      try {
        const result = await dispatch(fetchAllUserRoles()).unwrap();
        allRolesFetched = true;
        lastFetchTimestamp = Date.now();
        return { type: "roles/fetchAllUserRoles/fulfilled", payload: result };
      } finally {
        fetchInProgress = false;
      }
    },
    [dispatch, isAnyTypeOfAdmin],
  );

  const refreshAvailableRoles = useCallback(() => {
    return dispatch(fetchAvailableRoles());
  }, [dispatch]);

  const createRole = useCallback(
    (roleData: CreateUserRoleDto) => {
      return dispatch(createUserRole(roleData)).then((result) => {
        // Invalidate the cache after creating a role
        allRolesFetched = false;
        return result;
      });
    },
    [dispatch],
  );

  const updateRole = useCallback(
    (tableKeyId: string, updateData: UpdateUserRoleDto) => {
      return dispatch(updateUserRole({ tableKeyId, updateData })).then(
        (result) => {
          // Invalidate the cache after updating a role
          allRolesFetched = false;
          currentRolesFetched = false;
          return result;
        },
      );
    },
    [dispatch],
  );

  const deleteRole = useCallback(
    (tableKeyId: string) => {
      return dispatch(deleteUserRole(tableKeyId)).then((result) => {
        // Invalidate the cache after deleting a role
        allRolesFetched = false;
        currentRolesFetched = false;
        return result;
      });
    },
    [dispatch],
  );

  const permanentDeleteRole = useCallback(
    (tableKeyId: string) => {
      return dispatch(permanentDeleteUserRole(tableKeyId)).then((result) => {
        // Invalidate the cache after permanently deleting a role
        allRolesFetched = false;
        currentRolesFetched = false;
        return result;
      });
    },
    [dispatch],
  );

  const clearErrors = useCallback(() => {
    dispatch(clearRoleErrors());
  }, [dispatch]);

  const refreshAll = useCallback(
    async (force = false) => {
      console.log("🔄 Refresh all roles data requested");

      // Force refresh both current and all user roles
      await refreshCurrentUserRoles(force);

      if (isAnyTypeOfAdmin) {
        await refreshAllUserRoles(force);
      }

      await dispatch(fetchAvailableRoles());
      setResponseReceived(true);
    },
    [dispatch, isAnyTypeOfAdmin, refreshCurrentUserRoles, refreshAllUserRoles],
  );

  return {
    // Data
    currentUserRoles,
    currentUserOrganizations,
    allUserRoles,
    availableRoles,

    // Status
    loading: loading && !responseReceived,
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
