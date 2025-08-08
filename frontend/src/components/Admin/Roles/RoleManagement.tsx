import React, { useCallback, useEffect, useState, lazy, Suspense } from "react";
import { useRoles } from "@/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
const RoleEditer = lazy(() => import("./RoleEditer"));
import { toast } from "sonner";
import { refreshSupabaseSession } from "@/store/utils/refreshSupabaseSession";
import { useAuth } from "@/hooks/useAuth";
import RolesList from "./RolesList";

export const RoleManagement: React.FC = () => {
  // Get auth state directly from Auth context
  const { authLoading } = useAuth();

  // Get role-specific functions and data from useRoles
  const {
    currentUserRoles,
    error,
    refreshCurrentUserRoles,
    refreshAllUserRoles,
    hasAnyRole,
    clearRoleCache,
  } = useRoles();

  // Define admin status solely from new user roles
  const isAnyTypeOfAdmin = hasAnyRole([
    "admin",
    "superVera",
    "main_admin",
    "super_admin",
    "storage_manager",
  ]);

  // Track only session refreshing state
  const [sessionRefreshing, setSessionRefreshing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // Manual refresh function - now using force=true to bypass cache
  const handleRefresh = useCallback(async () => {
    try {
      await refreshCurrentUserRoles(true);
      if (isAnyTypeOfAdmin) {
        await refreshAllUserRoles(true);
      }
      toast.success("Roles refreshed successfully");
    } catch (err) {
      console.error("❌ RoleManagement - Manual refresh failed:", err);
      toast.error("Failed to refresh roles");
    }
  }, [refreshCurrentUserRoles, refreshAllUserRoles, isAnyTypeOfAdmin]);

  // Handler for refreshing Supabase session
  const handleRefreshSession = useCallback(async () => {
    setSessionRefreshing(true);
    try {
      await refreshSupabaseSession();
      toast.success("Supabase session refreshed!");
    } catch (err) {
      toast.error("Failed to refresh Supabase session");
      console.error("❌ Supabase session refresh failed:", err);
    } finally {
      setSessionRefreshing(false);
    }
  }, []);

  // Handler to refresh roles after any role operation
  const handleRolesChanged = useCallback(async () => {
    try {
      // Clear the cache entry before forcing a refresh
      clearRoleCache(["current", "all"]);

      // Now force refresh with the cleared cache
      await Promise.all([
        refreshCurrentUserRoles(true),
        isAnyTypeOfAdmin ? refreshAllUserRoles(true) : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Error refreshing roles:", error);
    }
  }, [
    refreshCurrentUserRoles,
    refreshAllUserRoles,
    isAnyTypeOfAdmin,
    clearRoleCache,
  ]);

  // Explicitly fetch all roles when the admin page loads
  useEffect(() => {
    // This only runs when the admin page is mounted
    if (isAnyTypeOfAdmin) {
      refreshAllUserRoles(false).catch(console.error);
    }
  }, [isAnyTypeOfAdmin, refreshAllUserRoles]);

  // Combined loading state from both auth and roles
  const isLoading = authLoading || (!currentUserRoles && !error);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="animate-spin w-8 h-8" />
        <span className="ml-2">Loading roles...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load role information: {error}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-6" data-cy="role-management-root">
      <div
        className="flex justify-between items-center"
        data-cy="role-management-header"
      >
        <h2 className="text-2xl font-bold" data-cy="role-management-title">
          Role Management Dashboard
        </h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          data-cy="role-management-refresh-btn"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button
          onClick={handleRefreshSession}
          variant="outline"
          size="sm"
          disabled={sessionRefreshing}
          data-cy="role-management-refresh-session-btn"
        >
          {sessionRefreshing ? (
            <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh session
        </Button>
      </div>

      {/* All assigned roles list */}
      {isAnyTypeOfAdmin && <RolesList />}

      {/* Roles editing Section */}
      {isAnyTypeOfAdmin && (
        <div className="my-6" data-cy="role-management-editer">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditor((v) => !v)}
          >
            {showEditor ? "Hide Role Editor" : "Open Role Editor"}
          </Button>
          {showEditor && (
            <Suspense
              fallback={
                <div className="flex items-center gap-2 mt-3">
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  <span>Loading editor…</span>
                </div>
              }
            >
              <RoleEditer onRolesChanged={handleRolesChanged} />
            </Suspense>
          )}
        </div>
      )}
    </div>
  );
};
