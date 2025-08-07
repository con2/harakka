import React, { useCallback, useEffect, useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Shield, Users, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import RoleEditer from "./RoleEditer";
import { toast } from "sonner";
import { refreshSupabaseSession } from "@/store/utils/refreshSupabaseSession";
import { useAuth } from "@/hooks/useAuth";

export const RoleManagement: React.FC = () => {
  // Get auth state directly from Auth context
  const { authLoading } = useAuth();

  // Get role-specific functions and data from useRoles
  const {
    currentUserRoles,
    allUserRoles,
    adminLoading,
    error,
    adminError,
    refreshCurrentUserRoles,
    refreshAllUserRoles,
    hasAnyRole,
    hasRole,
    clearRoleCache,
  } = useRoles();

  // Define admin status solely from new user roles
  const isAnyTypeOfAdmin = hasAnyRole([
    "admin",
    "superVera",
    "main_admin",
    "super_admin",
    "store_manager",
  ]);

  const isSuperVera = hasRole("superVera");

  // Track only session refreshing state
  const [sessionRefreshing, setSessionRefreshing] = useState(false);

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

      {/* Debug Information */}
      <Card data-cy="role-management-debug-card">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm font-mono">
            <div>
              Auth Loading:{" "}
              <span
                className={authLoading ? "text-red-600" : "text-green-600"}
                data-cy="role-management-loading"
              >
                {authLoading.toString()}
              </span>
            </div>
            <div>
              Admin Loading:{" "}
              <span
                className={adminLoading ? "text-red-600" : "text-green-600"}
                data-cy="role-management-admin-loading"
              >
                {adminLoading.toString()}
              </span>
            </div>
            <div>
              Error:{" "}
              <span
                className={error ? "text-red-600" : "text-green-600"}
                data-cy="role-management-error"
              >
                {error || "None"}
              </span>
            </div>
            <div>
              Admin Error:{" "}
              <span
                className={adminError ? "text-red-600" : "text-green-600"}
                data-cy="role-management-admin-error"
              >
                {adminError || "None"}
              </span>
            </div>
            <div>
              Current User Roles:{" "}
              <span
                className="text-blue-600"
                data-cy="role-management-current-user-roles"
              >
                {currentUserRoles?.length || 0}
              </span>
            </div>
            <div>
              All User Roles:{" "}
              <span
                className="text-blue-600"
                data-cy="role-management-all-user-roles"
              >
                {allUserRoles?.length || 0}
              </span>
            </div>
            <div>
              is Any Type Of Admin:{" "}
              <span
                className={
                  isAnyTypeOfAdmin ? "text-green-600" : "text-orange-600"
                }
                data-cy="role-management-is-admin"
              >
                {isAnyTypeOfAdmin.toString()}
              </span>
            </div>
            <div>
              Is SuperVera:{" "}
              <span
                className={isSuperVera ? "text-purple-600" : "text-gray-600"}
                data-cy="role-management-is-supervera"
              >
                {isSuperVera.toString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current User Roles */}
      <Card data-cy="role-management-current-roles-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Role Assignments ({currentUserRoles?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentUserRoles || currentUserRoles.length === 0 ? (
            <p
              className="text-muted-foreground"
              data-cy="role-management-no-roles"
            >
              No roles assigned.
            </p>
          ) : (
            <div className="space-y-3" data-cy="role-management-roles-list">
              {currentUserRoles.map((role, index) => (
                <div
                  key={role.id || index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-cy="role-management-role-row"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="default"
                        data-cy="role-management-role-badge"
                      >
                        {role.role_name}
                      </Badge>
                      <span
                        className="text-sm text-muted-foreground"
                        data-cy="role-management-role-org"
                      >
                        in {role.organization_name}
                      </span>
                    </div>
                    <p
                      className="text-xs text-muted-foreground"
                      data-cy="role-management-role-ids"
                    >
                      Role ID: {role.role_id} • Org ID: {role.organization_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {role.is_active ? (
                      <Badge
                        variant="default"
                        className="text-xs bg-green-100 text-green-800"
                        data-cy="role-management-role-active"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        data-cy="role-management-role-inactive"
                      >
                        Inactive
                      </Badge>
                    )}
                    {role.assigned_at && (
                      <span
                        className="text-xs text-muted-foreground"
                        data-cy="role-management-role-assigned-at"
                      >
                        {new Date(role.assigned_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Section */}
      {isAnyTypeOfAdmin && (
        <Card data-cy="role-management-admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              All Users Roles ({allUserRoles?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adminLoading ? (
              <div
                className="flex justify-center items-center h-32"
                data-cy="role-management-admin-loading-row"
              >
                <LoaderCircle className="animate-spin w-6 h-6" />
                <span className="ml-2">Loading admin data...</span>
              </div>
            ) : adminError ? (
              <Alert
                variant="destructive"
                data-cy="role-management-admin-error-alert"
              >
                <AlertDescription>{adminError}</AlertDescription>
              </Alert>
            ) : !allUserRoles || allUserRoles.length === 0 ? (
              <p
                className="text-muted-foreground"
                data-cy="role-management-admin-no-roles"
              >
                No role assignments found.
              </p>
            ) : (
              <div
                className="space-y-3 max-h-96 overflow-y-auto"
                data-cy="role-management-admin-roles-list"
              >
                {allUserRoles.map((role, index) => (
                  <div
                    key={role.id || index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    data-cy="role-management-admin-role-row"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="default"
                          data-cy="role-management-admin-role-badge"
                        >
                          {role.role_name}
                        </Badge>
                        <span
                          className="text-sm font-medium"
                          data-cy="role-management-admin-role-org"
                        >
                          {role.organization_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span data-cy="role-management-admin-role-email">
                          User email: {role.user_email}
                        </span>
                        {role.user_phone && (
                          <span data-cy="role-management-admin-role-phone">
                            📞 {role.user_phone}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs text-muted-foreground"
                        data-cy="role-management-admin-role-ids"
                      >
                        Role ID: {role.role_id} • Org ID: {role.organization_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {role.is_active ? (
                        <Badge
                          variant="default"
                          className="text-xs bg-green-100 text-green-800"
                          data-cy="role-management-admin-role-active"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          data-cy="role-management-admin-role-inactive"
                        >
                          Inactive
                        </Badge>
                      )}
                      {role.assigned_at && (
                        <span
                          className="text-xs text-muted-foreground"
                          data-cy="role-management-admin-role-assigned-at"
                        >
                          {new Date(role.assigned_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Roles editing Section */}
      {isAnyTypeOfAdmin && (
        <div className="my-6" data-cy="role-management-editer">
          <RoleEditer onRolesChanged={handleRolesChanged} />
        </div>
      )}
    </div>
  );
};
