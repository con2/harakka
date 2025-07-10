import React, { useEffect, useCallback, useRef, useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Shield, Users, Building, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const RoleManagement: React.FC = () => {
  const {
    currentUserRoles,
    currentUserOrganizations,
    allUserRoles,
    loading,
    adminLoading,
    error,
    adminError,
    refreshCurrentUserRoles,
    refreshAllUserRoles,
  } = useRoles();

  // Define admin status solely from new user roles (without old system)
  const isAdmin =
    currentUserRoles?.some(
      (role) =>
        role.role_name === "admin" ||
        role.role_name === "superVera" ||
        role.role_name === "super_admin" ||
        role.role_name === "main_admin",
    ) ?? false;

  const isSuperVera =
    currentUserRoles?.some((role) => role.role_name === "superVera") ?? false;

  // Add fetch attempt tracking with a "roles attempted" flag
  const [fetchingAdminData, setFetchingAdminData] = useState(false);
  const fetchAttemptsRef = useRef(0);
  const MAX_FETCH_ATTEMPTS = 2;

  useEffect(() => {
    // Only fetch admin roles if user is admin and we don't have them yet
    if (
      isAdmin &&
      allUserRoles.length === 0 &&
      !adminLoading &&
      !adminError &&
      !fetchingAdminData &&
      fetchAttemptsRef.current < MAX_FETCH_ATTEMPTS // Limit to 2 attempts
    ) {
      console.log(
        `Attempting to fetch admin roles (attempt ${fetchAttemptsRef.current + 1}/2)`,
      );
      fetchAttemptsRef.current += 1;
      setFetchingAdminData(true);

      refreshAllUserRoles().finally(() => {
        setFetchingAdminData(false);
      });
    }
  }, [
    isAdmin,
    allUserRoles.length,
    adminLoading,
    adminError,
    refreshAllUserRoles,
    fetchingAdminData,
  ]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    try {
      await refreshCurrentUserRoles();
      if (isAdmin) {
        await refreshAllUserRoles();
      }
    } catch (err) {
      console.error("❌ RoleManagement - Manual refresh failed:", err);
    }
  }, [refreshCurrentUserRoles, refreshAllUserRoles, isAdmin]);

  // Loading state
  if (loading) {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Role Management Dashboard</h2>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm font-mono">
            <div>
              Loading:{" "}
              <span className={loading ? "text-red-600" : "text-green-600"}>
                {loading.toString()}
              </span>
            </div>
            <div>
              Admin Loading:{" "}
              <span
                className={adminLoading ? "text-red-600" : "text-green-600"}
              >
                {adminLoading.toString()}
              </span>
            </div>
            <div>
              Error:{" "}
              <span className={error ? "text-red-600" : "text-green-600"}>
                {error || "None"}
              </span>
            </div>
            <div>
              Admin Error:{" "}
              <span className={adminError ? "text-red-600" : "text-green-600"}>
                {adminError || "None"}
              </span>
            </div>
            <div>
              Current User Roles:{" "}
              <span className="text-blue-600">
                {currentUserRoles?.length || 0}
              </span>
            </div>
            <div>
              All User Roles:{" "}
              <span className="text-blue-600">{allUserRoles?.length || 0}</span>
            </div>
            <div>
              Is Admin:{" "}
              <span className={isAdmin ? "text-green-600" : "text-orange-600"}>
                {isAdmin.toString()}
              </span>
            </div>
            <div>
              Is SuperVera:{" "}
              <span
                className={isSuperVera ? "text-purple-600" : "text-gray-600"}
              >
                {isSuperVera.toString()}
              </span>
            </div>
            <div>
              Refresh Function:{" "}
              <span className="text-blue-600">
                {typeof refreshCurrentUserRoles}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Your Access Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              {isSuperVera ? (
                <Badge variant="destructive">SuperVera (Global Admin)</Badge>
              ) : isAdmin ? (
                <Badge variant="default">Admin</Badge>
              ) : (
                <Badge variant="secondary">User</Badge>
              )}
            </div>

            <div>
              <span className="font-medium">Organizations & Roles:</span>
              <div className="mt-2 space-y-2">
                {currentUserOrganizations &&
                currentUserOrganizations.length > 0 ? (
                  currentUserOrganizations.map((org) => (
                    <div
                      key={org.organization_id}
                      className="flex items-center gap-2"
                    >
                      <Building className="w-4 h-4" />
                      <span className="font-medium">
                        {org.organization_name}:
                      </span>
                      <div className="flex gap-1">
                        {org.roles.map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className="text-xs"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No organizations found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Role Assignments ({currentUserRoles?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentUserRoles || currentUserRoles.length === 0 ? (
            <p className="text-muted-foreground">No roles assigned.</p>
          ) : (
            <div className="space-y-3">
              {currentUserRoles.map((role, index) => (
                <div
                  key={role.id || index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{role.role_name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        in {role.organization_name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Role ID: {role.role_id} • Org ID: {role.organization_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {role.is_active ? (
                      <Badge
                        variant="default"
                        className="text-xs bg-green-100 text-green-800"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                    {role.created_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(role.created_at).toLocaleDateString()}
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
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin: All User Roles ({allUserRoles?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adminLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoaderCircle className="animate-spin w-6 h-6" />
                <span className="ml-2">Loading admin data...</span>
              </div>
            ) : adminError ? (
              <Alert variant="destructive">
                <AlertDescription>{adminError}</AlertDescription>
              </Alert>
            ) : !allUserRoles || allUserRoles.length === 0 ? (
              <p className="text-muted-foreground">
                No role assignments found.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allUserRoles.map((role, index) => (
                  <div
                    key={role.id || index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{role.role_name}</Badge>
                        <span className="text-sm font-medium">
                          {role.organization_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>User email: {role.user_email}</span>
                        {role.user_phone && <span>📞 {role.user_phone}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Role ID: {role.role_id} • Org ID: {role.organization_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {role.is_active ? (
                        <Badge
                          variant="default"
                          className="text-xs bg-green-100 text-green-800"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                      {role.created_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(role.created_at).toLocaleDateString()}
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

      {/* Permission Testing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Can access admin functions:</span>
              <Badge
                variant={isAdmin ? "default" : "secondary"}
                className={isAdmin ? "bg-green-100 text-green-800" : ""}
              >
                {isAdmin ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Has 'admin' role:</span>
              <Badge
                variant={
                  currentUserRoles?.some((r) => r.role_name === "admin")
                    ? "default"
                    : "secondary"
                }
                className={
                  currentUserRoles?.some((r) => r.role_name === "admin")
                    ? "bg-green-100 text-green-800"
                    : ""
                }
              >
                {currentUserRoles?.some((r) => r.role_name === "admin")
                  ? "Yes"
                  : "No"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Has 'user' role:</span>
              <Badge
                variant={
                  currentUserRoles?.some((r) => r.role_name === "user")
                    ? "default"
                    : "secondary"
                }
                className={
                  currentUserRoles?.some((r) => r.role_name === "user")
                    ? "bg-green-100 text-green-800"
                    : ""
                }
              >
                {currentUserRoles?.some((r) => r.role_name === "user")
                  ? "Yes"
                  : "No"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Is SuperVera:</span>
              <Badge variant={isSuperVera ? "destructive" : "secondary"}>
                {isSuperVera ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
