import { useCallback, useState, useEffect } from "react";
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
  setActiveRoleContext,
  clearActiveRoleContext,
  selectActiveRoleContext,
  selectHasActiveContext,
} from "@/store/slices/rolesSlice";
import { CreateUserRoleDto, UpdateUserRoleDto } from "@/types/roles";
import { useAuth } from "./useAuth";

// Global cache states with proper timestamps
const roleCache = {
  currentRoles: { fetched: false, timestamp: 0 },
  allRoles: { fetched: false, timestamp: 0 },
  availableRoles: { fetched: false, timestamp: 0 },
};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Track in-progress requests with a Map keyed by request type
const pendingRequests = new Map();

export const useRoles = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [responseReceived, setResponseReceived] = useState(false);

  // Get active role context from Redux
  const activeContext = useAppSelector(selectActiveRoleContext);
  const hasActiveContext = useAppSelector(selectHasActiveContext);

  // Method for setting active roel
  const setActiveContext = useCallback(
    (organizationId: string, roleName: string, organizationName: string) => {
      dispatch(
        setActiveRoleContext({
          organizationId,
          roleName,
          organizationName,
        }),
      );
    },
    [dispatch],
  );

  // Method for clearing active role context
  const clearActiveContext = useCallback(() => {
    dispatch(clearActiveRoleContext());
  }, [dispatch]);

  // Current user roles and organizations
  const currentUserRoles = useAppSelector(selectCurrentUserRoles);
  const currentUserOrganizations = useAppSelector(
    selectCurrentUserOrganizations,
  );
  const allUserRoles = useAppSelector(selectAllUserRoles);
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

  // Enhanced hasRole that can use active role context as fallback
  const checkHasRoleInContext = useCallback(
    (requiredRole: string, specificOrgId?: string) => {
      // If specific org ID provided, use that
      if (specificOrgId) {
        return checkHasRole(requiredRole, specificOrgId);
      }

      // Otherwise use active context if available
      if (hasActiveContext) {
        return checkHasRole(
          requiredRole,
          activeContext.organizationId || undefined,
        );
      }

      // Default to checking any organization
      return checkHasRole(requiredRole);
    },
    [checkHasRole, hasActiveContext, activeContext],
  );

  // The isAnyTypeOfAdmin should now be defined after checkHasAnyRole
  const isAnyTypeOfAdmin = checkHasAnyRole([
    "admin",
    "superVera",
    "main_admin",
    "super_admin",
    "store_manager",
  ]);

  // Check if cache is stale
  const isCacheStale = (cacheItem: { timestamp: number }) => {
    return Date.now() - cacheItem.timestamp > CACHE_EXPIRY;
  };

  // Improved refreshCurrentUserRoles with better caching and deduplication
  const refreshCurrentUserRoles = useCallback(
    async (force = false) => {
      if (!isAuthenticated && !force) {
        return Promise.resolve({
          type: "roles/fetchCurrentUserRoles/notLoggedIn",
        });
      }
      const requestKey = "currentUserRoles";

      // Always clear existing request when forced
      if (force && pendingRequests.has(requestKey)) {
        pendingRequests.delete(requestKey);
      }

      // Return existing promise if already in progress and not forced
      if (pendingRequests.has(requestKey) && !force) {
        return pendingRequests.get(requestKey);
      }

      // Skip if data is already cached and not stale (unless forced)
      if (
        roleCache.currentRoles.fetched &&
        !isCacheStale(roleCache.currentRoles) &&
        !force
      ) {
        // Use cached current roles data
        return Promise.resolve({
          type: "roles/fetchCurrentUserRoles/cached",
          payload: {
            roles: currentUserRoles,
            organizations: currentUserOrganizations,
          },
        });
      }

      // Create and store the promise
      const promise = dispatch(fetchCurrentUserRoles())
        .unwrap()
        .then((result) => {
          roleCache.currentRoles = {
            fetched: true,
            timestamp: Date.now(),
          };
          setResponseReceived(true);
          return result;
        })
        .finally(() => {
          // Only remove from pending requests when done
          pendingRequests.delete(requestKey);
        });

      pendingRequests.set(requestKey, promise);
      return promise;
    },
    [dispatch, currentUserRoles, currentUserOrganizations, isAuthenticated],
  );

  // Specialized refreshAllUserRoles that only runs for admins and doesn't auto-load
  const refreshAllUserRoles = useCallback(
    async (force = false) => {
      const requestKey = "allUserRoles";

      // Only admins should fetch all roles
      if (!isAnyTypeOfAdmin) {
        // Skip all roles fetch - not an admin");
        return Promise.resolve({ type: "roles/fetchAllUserRoles/notAdmin" });
      }

      // Return existing promise if already in progress and not forced
      if (pendingRequests.has(requestKey) && !force) {
        return pendingRequests.get(requestKey);
      }

      // Skip if data is already cached and not stale (unless forced)
      if (
        roleCache.allRoles.fetched &&
        !isCacheStale(roleCache.allRoles) &&
        !force
      ) {
        // Use cached all roles data
        return Promise.resolve({
          type: "roles/fetchAllUserRoles/cached",
          payload: allUserRoles,
        });
      }

      // Create and store the promise
      const promise = dispatch(fetchAllUserRoles())
        .unwrap()
        .then((result) => {
          roleCache.allRoles = {
            fetched: true,
            timestamp: Date.now(),
          };
          return result;
        })
        .finally(() => {
          pendingRequests.delete(requestKey);
        });

      pendingRequests.set(requestKey, promise);
      return promise;
    },
    [dispatch, isAnyTypeOfAdmin, allUserRoles],
  );

  const refreshAvailableRoles = useCallback(
    async (force = false) => {
      const requestKey = "availableRoles";

      // Return existing promise if already in progress
      if (pendingRequests.has(requestKey) && !force) {
        return pendingRequests.get(requestKey);
      }

      // Skip if data is already cached and not stale (unless forced)
      if (
        roleCache.availableRoles.fetched &&
        !isCacheStale(roleCache.availableRoles) &&
        !force
      ) {
        // Use cached available roles data
        return Promise.resolve({
          type: "roles/fetchAvailableRoles/cached",
          payload: availableRoles,
        });
      }

      // Create and store the promise
      const promise = dispatch(fetchAvailableRoles())
        .unwrap()
        .then((result) => {
          roleCache.availableRoles = {
            fetched: true,
            timestamp: Date.now(),
          };
          return result;
        })
        .finally(() => {
          pendingRequests.delete(requestKey);
        });

      pendingRequests.set(requestKey, promise);
      return promise;
    },
    [dispatch, availableRoles],
  );

  // Only load CURRENT user roles on initial mount - not ALL roles
  useEffect(() => {
    if (
      isAuthenticated &&
      !initialLoadComplete &&
      !loading &&
      currentUserRoles.length === 0
    ) {
      // Load only current user roles on initial mount
      refreshCurrentUserRoles()
        .then(() => {
          setInitialLoadComplete(true);
          // NOTE: We do NOT automatically load all user roles here
        })
        .catch(console.error);
    }
  }, [
    refreshCurrentUserRoles,
    initialLoadComplete,
    loading,
    currentUserRoles,
    isAuthenticated,
  ]);

  // Role modification operations with cache invalidation
  const createRole = useCallback(
    (roleData: CreateUserRoleDto) => {
      return dispatch(createUserRole(roleData)).then((result) => {
        // Invalidate only all-roles cache
        roleCache.allRoles.fetched = false;
        return result;
      });
    },
    [dispatch],
  );

  const updateRole = useCallback(
    (tableKeyId: string, updateData: UpdateUserRoleDto) => {
      return dispatch(updateUserRole({ tableKeyId, updateData })).then(
        (result) => {
          // Invalidate both caches as this could affect current user
          roleCache.allRoles.fetched = false;
          roleCache.currentRoles.fetched = false;
          return result;
        },
      );
    },
    [dispatch],
  );

  const deleteRole = useCallback(
    (tableKeyId: string) => {
      return dispatch(deleteUserRole(tableKeyId)).then((result) => {
        // Invalidate both caches as this could affect current user
        roleCache.allRoles.fetched = false;
        roleCache.currentRoles.fetched = false;
        return result;
      });
    },
    [dispatch],
  );

  const permanentDeleteRole = useCallback(
    (tableKeyId: string) => {
      return dispatch(permanentDeleteUserRole(tableKeyId)).then((result) => {
        // Invalidate both caches
        roleCache.allRoles.fetched = false;
        roleCache.currentRoles.fetched = false;
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
      const promises = [refreshCurrentUserRoles(force)];

      // Only fetch all roles if user is admin
      if (isAnyTypeOfAdmin) {
        promises.push(refreshAllUserRoles(force));
      }

      // Always refresh available roles
      promises.push(refreshAvailableRoles(force));

      await Promise.all(promises);
      setResponseReceived(true);
    },
    [
      isAnyTypeOfAdmin,
      refreshCurrentUserRoles,
      refreshAllUserRoles,
      refreshAvailableRoles,
    ],
  );

  const clearRoleCache = useCallback(
    (types?: ("current" | "all" | "available")[]) => {
      if (!types || types.length === 0) {
        // Clear all caches if no specific type provided
        roleCache.currentRoles.fetched = false;
        roleCache.allRoles.fetched = false;
        roleCache.availableRoles.fetched = false;
      } else {
        // Clear only specified caches
        types.forEach((type) => {
          if (type === "current") roleCache.currentRoles.fetched = false;
          if (type === "all") roleCache.allRoles.fetched = false;
          if (type === "available") roleCache.availableRoles.fetched = false;
        });
      }
    },
    [],
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
    hasRoleInContext: checkHasRoleInContext,

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
    clearRoleCache,

    // Active role context values and methods
    activeContext,
    hasActiveContext,
    setActiveContext,
    clearActiveContext,
  };
};
