import { useCallback, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCurrentUserRoles,
  fetchAllUserRoles,
  fetchAvailableRoles,
  createUserRole,
  updateUserRole,
  replaceUserRole,
  deleteUserRole,
  permanentDeleteUserRole,
  leaveOrg,
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
  selectActiveRoleContext,
} from "@/store/slices/rolesSlice";
import { CreateUserRoleDto, UpdateUserRoleDto } from "@/types/roles";
import { useAuth } from "./useAuth";
import { refreshSupabaseSession } from "@/store/utils/refreshSupabaseSession";
import { roleApi } from "@/api/services/roles";

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

  // Helper to check if active context is populated
  const hasActiveContext = useCallback(() => {
    return !!(
      activeContext.organizationId != null &&
      activeContext.roleName != null &&
      activeContext.organizationName
    );
  }, [activeContext]);

  // Method for setting active role
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

  // org-aware but not limited to the selected role in activeContext
  const hasRole = useCallback(
    (requiredRole: string, specificOrgId?: string) => {
      const orgToCheck =
        specificOrgId ??
        (hasActiveContext()
          ? (activeContext.organizationId as string)
          : undefined);

      return currentUserRoles.some((r) => {
        if (!r.is_active) return false;
        if (r.role_name === null) return false;
        if (r.role_name !== requiredRole) return false;
        return orgToCheck ? r.organization_id === orgToCheck : true;
      });
    },
    [currentUserRoles, activeContext, hasActiveContext],
  );

  // FIX: keep behavior consistent with hasRole; prefer active org if present, else any org
  const hasAnyRole = useCallback(
    (roleNames: string[], specificOrgId?: string) => {
      const set = new Set(roleNames);
      const orgToCheck =
        specificOrgId ??
        (hasActiveContext()
          ? (activeContext.organizationId as string)
          : undefined);

      return currentUserRoles.some((r) => {
        if (!r.is_active) return false;
        if (r.role_name === null) return false;
        if (!set.has(r.role_name)) return false;
        return orgToCheck ? r.organization_id === orgToCheck : true;
      });
    },
    [currentUserRoles, activeContext, hasActiveContext],
  );

  const isAnyTypeOfAdmin = hasAnyRole([
    "tenant_admin",
    "super_admin",
    "storage_manager",
  ]);

  // Check if cache is stale
  const isCacheStale = (cacheItem: { timestamp: number }) => {
    return Date.now() - cacheItem.timestamp > CACHE_EXPIRY;
  };

  // Improved refreshCurrentUserRoles with better caching and deduplication
  const refreshCurrentUserRoles = useCallback(
    async (force = false) => {
      if (!isAuthenticated && !force) {
        setResponseReceived(true);
        setInitialLoadComplete(true);
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

  // Only load CURRENT user roles on initial mount for authenticated users
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
        .catch((error) => {
          console.error("Unauthorized: Missing access token", error);
          setResponseReceived(true);
          setInitialLoadComplete(true);
        });
    } else if (!isAuthenticated && !initialLoadComplete) {
      // If not authenticated, mark as complete immediately
      setInitialLoadComplete(true);
      setResponseReceived(true);
    }
  }, [
    refreshCurrentUserRoles,
    initialLoadComplete,
    loading,
    currentUserRoles,
    isAuthenticated,
  ]);

  // Mark this hook instance as "ready" once roles are present in the store,
  // even if this instance didn't initiate the fetch itself.
  useEffect(() => {
    if (!responseReceived && currentUserRoles.length > 0) {
      setResponseReceived(true);
    }
  }, [currentUserRoles.length, responseReceived]);

  // Reset states when user changes (including logout)
  useEffect(() => {
    // Clear module-level caches and in-flight promises on user switch
    roleCache.currentRoles = { fetched: false, timestamp: 0 };
    roleCache.allRoles = { fetched: false, timestamp: 0 };
    roleCache.availableRoles = { fetched: false, timestamp: 0 };
    pendingRequests.clear();

    // Reset component state on logout (when user becomes null)
    if (!user) {
      setInitialLoadComplete(false);
      setResponseReceived(false);
    }
  }, [user]);

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

  const replaceRole = useCallback(
    (oldRoleId: string, newRoleData: CreateUserRoleDto) => {
      return dispatch(replaceUserRole({ oldRoleId, newRoleData })).then(
        (result) => {
          // Invalidate caches as this could affect current user
          roleCache.allRoles.fetched = false;
          roleCache.currentRoles.fetched = false;
          return result;
        },
      );
    },
    [dispatch],
  );

  const leaveRoleInOrg = useCallback(
    (tableKeyId: string) => {
      return dispatch(leaveOrg(tableKeyId)).then((result) => {
        // Invalidate both caches
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

  // Sync session and roles after permission changes
  const syncSessionAndRoles = useCallback(async () => {
    try {
      // First refresh the Supabase session to get latest JWT
      await refreshSupabaseSession();
      // Then force refresh current user roles (bypassing cache)
      await refreshCurrentUserRoles(true);
      // Refresh all user roles
      await refreshAllUserRoles(true);
      // Return success
      return true;
    } catch (error) {
      console.error("Failed to sync session and roles:", error);
      return false;
    }
  }, [refreshCurrentUserRoles, refreshAllUserRoles]);

  const setupPeriodicSessionCheck = useCallback(
    (intervalMinutes = 4) => {
      // Don't set up checks if not authenticated
      if (!isAuthenticated) return () => {};

      // Check for role updates every X minutes
      const interval = setInterval(
        async () => {
          try {
            // Make a lightweight API call that will return the x-role-version header
            await roleApi.getCurrentUserRoles();
            // The interceptor in axios.ts handles version comparison and session refresh
          } catch (error) {
            console.error("Periodic session check failed:", error);
          }
        },
        intervalMinutes * 60 * 1000,
      );

      // Return cleanup function
      return () => clearInterval(interval);
    },
    [isAuthenticated],
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
    hasRole,
    hasAnyRole,

    // Actions
    refreshCurrentUserRoles,
    refreshAllUserRoles,
    refreshAvailableRoles,
    createRole,
    updateRole,
    deleteRole,
    permanentDeleteRole,
    leaveRoleInOrg,
    clearErrors,
    refreshAll,
    clearRoleCache,
    replaceRole,

    // Active role context values and methods
    activeContext,
    hasActiveContext, // boolean is it populated or null
    setActiveContext,

    // Sync session and roles
    syncSessionAndRoles,

    // Periodic session check setup
    setupPeriodicSessionCheck,

    // Helpers
    /**
     * Pick the best admin-capable role for a given organization.
     * Preference order: `tenant_admin` → `storage_manager` because those roles are allowed
     * manage/view bookings with provider organizations.
     * Returns a narrowed, non-nullable context shape suitable for setActiveContext.
     *
     * @param orgId - Organization id to match against the user's roles
     * @returns {null | { organization_id: string; role_name: string; organization_name: string | null }}
     *          Best matching role context or null if none found.
     */
    findBestOrgAdminRole: (orgId: string) => {
      const preferred: Array<"tenant_admin" | "storage_manager"> = [
        "tenant_admin",
        "storage_manager",
      ];
      const match = currentUserRoles.find(
        (r) =>
          r.is_active &&
          r.organization_id === orgId &&
          r.role_name !== null &&
          preferred.includes(r.role_name as (typeof preferred)[number]) &&
          r.organization_id !== null,
      );
      if (match && match.organization_id && match.role_name) {
        return {
          organization_id: match.organization_id,
          role_name: match.role_name,
          organization_name: match.organization_name ?? null,
        };
      }
      return null;
    },
    /**
     * Find a super_admin context for the current user.
     * Prefers the "Global" organization when available, falls back to the first super_admin role.
     * Returns a narrowed, non-nullable context shape suitable for setActiveContext.
     *
     * @returns {null | { organization_id: string; role_name: string; organization_name: string | null }}
     *          A super_admin role context or null if user lacks that role.
     */
    findSuperAdminRole: () => {
      // Prefer a Global super_admin if present, else first valid match
      const supers = currentUserRoles.filter(
        (r) =>
          r.is_active && r.role_name === "super_admin" && r.organization_id,
      );
      if (supers.length === 0) return null;
      const globalFirst =
        supers.find(
          (r) => (r.organization_name || "").toLowerCase() === "global",
        ) || supers[0];
      return {
        organization_id: globalFirst.organization_id as string,
        role_name: globalFirst.role_name as string,
        organization_name: globalFirst.organization_name ?? null,
      };
    },
  };
};
