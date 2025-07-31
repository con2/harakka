import React, { useEffect, useCallback, useRef, useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LoaderCircle,
  Shield,
  Users,
  Building,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import RoleEditer from "./RoleEditer";
import { toast } from "sonner";
import { refreshSupabaseSession } from "@/store/utils/refreshSupabaseSession";

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
    hasAnyRole,
    hasRole,
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
  const [sessionRefreshing, setSessionRefreshing] = useState(false);

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
      fetchAttemptsRef.current += 1;
      setFetchingAdminData(true);

      void refreshAllUserRoles().finally(() => {
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

  // For hasAnyRole testing
  const [roleTestInput, setRoleTestInput] = useState("");
  const [orgTestInput, setOrgTestInput] = useState("");
  const [testRoles, setTestRoles] = useState<string[]>([]);
  const [roleTestResult, setRoleTestResult] = useState(false);
  const [roleTestPerformed, setRoleTestPerformed] = useState(false);

  // For hasRole testing (single role)
  const [singleRoleInput, setSingleRoleInput] = useState("");
  const [singleOrgInput, setSingleOrgInput] = useState("");
  const [singleRoleResult, setSingleRoleResult] = useState(false);
  const [singleRoleTestPerformed, setSingleRoleTestPerformed] = useState(false);

  // Handler for testing multiple roles (hasAnyRole)
  const handleTestRoles = useCallback(() => {
    const rolesToTest = roleTestInput
      .split(",")
      .map((role) => role.trim())
      .filter((role) => role.length > 0);

    setTestRoles(rolesToTest);
    const result = hasAnyRole(rolesToTest, orgTestInput || undefined);
    setRoleTestResult(result);
    setRoleTestPerformed(true);
  }, [roleTestInput, orgTestInput, hasAnyRole]);

  // Handler for testing a single role (hasRole)
  const handleTestSingleRole = useCallback(() => {
    setSingleRoleTestPerformed(true);
    const result = hasRole(singleRoleInput, singleOrgInput || undefined);
    setSingleRoleResult(result);
  }, [singleRoleInput, singleOrgInput, hasRole]);

  // Handler to refresh roles after any role operation
  const handleRolesChanged = useCallback(async () => {
    await refreshCurrentUserRoles();
    if (isAdmin) {
      await refreshAllUserRoles();
    }
    toast.success("Roles updated!");
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
              Loading:{" "}
              <span
                className={loading ? "text-red-600" : "text-green-600"}
                data-cy="role-management-loading"
              >
                {loading.toString()}
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
              Is Admin:{" "}
              <span
                className={isAdmin ? "text-green-600" : "text-orange-600"}
                data-cy="role-management-is-admin"
              >
                {isAdmin.toString()}
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
            <div>
              Refresh Function:{" "}
              <span
                className="text-blue-600"
                data-cy="role-management-refresh-fn"
              >
                {typeof refreshCurrentUserRoles}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Status Card */}
      <Card data-cy="role-management-status-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Your Access Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              className="flex items-center gap-2"
              data-cy="role-management-status-row"
            >
              <span className="font-medium">Status:</span>
              {isSuperVera ? (
                <Badge
                  variant="destructive"
                  data-cy="role-management-status-badge-supervera"
                >
                  SuperVera (Global Admin)
                </Badge>
              ) : isAdmin ? (
                <Badge
                  variant="default"
                  data-cy="role-management-status-badge-admin"
                >
                  Admin
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  data-cy="role-management-status-badge-user"
                >
                  User
                </Badge>
              )}
            </div>
            <div>
              <span className="font-medium">Organizations & Roles:</span>
              <div
                className="mt-2 space-y-2"
                data-cy="role-management-orgs-list"
              >
                {currentUserOrganizations &&
                currentUserOrganizations.length > 0 ? (
                  currentUserOrganizations.map((org) => (
                    <div
                      key={org.organization_id}
                      className="flex items-center gap-2"
                      data-cy="role-management-org-row"
                    >
                      <Building className="w-4 h-4" />
                      <span
                        className="font-medium"
                        data-cy="role-management-org-name"
                      >
                        {org.organization_name}:
                      </span>
                      <div
                        className="flex gap-1"
                        data-cy="role-management-org-roles"
                      >
                        {org.roles.map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className="text-xs"
                            data-cy="role-management-org-role"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p
                    className="text-muted-foreground"
                    data-cy="role-management-no-orgs"
                  >
                    No organizations found.
                  </p>
                )}
              </div>
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
      {isAdmin && (
        <Card data-cy="role-management-admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin: All User Roles ({allUserRoles?.length || 0})
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
      {isAdmin && (
        <div className="my-6" data-cy="role-management-editer">
          <RoleEditer onRolesChanged={handleRolesChanged} />
        </div>
      )}

      {/* Permission Testing Section */}
      <Card data-cy="role-management-permission-testing-card">
        <CardHeader>
          <CardTitle>Permission Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div
              className="flex items-center gap-2"
              data-cy="role-management-permission-admin-row"
            >
              <span className="font-medium">Can access admin functions:</span>
              <Badge
                variant={isAdmin ? "default" : "secondary"}
                className={isAdmin ? "bg-green-100 text-green-800" : ""}
                data-cy="role-management-permission-admin-badge"
              >
                {isAdmin ? "Yes" : "No"}
              </Badge>
            </div>
            <div
              className="flex items-center gap-2"
              data-cy="role-management-permission-has-admin-row"
            >
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
                data-cy="role-management-permission-has-admin-badge"
              >
                {currentUserRoles?.some((r) => r.role_name === "admin")
                  ? "Yes"
                  : "No"}
              </Badge>
            </div>
            <div
              className="flex items-center gap-2"
              data-cy="role-management-permission-has-user-row"
            >
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
                data-cy="role-management-permission-has-user-badge"
              >
                {currentUserRoles?.some((r) => r.role_name === "user")
                  ? "Yes"
                  : "No"}
              </Badge>
            </div>
            <div
              className="flex items-center gap-2"
              data-cy="role-management-permission-supervera-row"
            >
              <span className="font-medium">Is SuperVera:</span>
              <Badge
                variant={isSuperVera ? "destructive" : "secondary"}
                data-cy="role-management-permission-supervera-badge"
              >
                {isSuperVera ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Check Testing Section (hasAnyRole) */}
      <Card data-cy="role-management-hasanyrole-card">
        <CardHeader>
          <CardTitle>Test hasAnyRole Function</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="roleTest">Role Names (comma separated)</Label>
              <div
                className="flex gap-2 mt-1"
                data-cy="role-management-hasanyrole-inputs"
              >
                <Input
                  id="roleTest"
                  placeholder="e.g. admin,user,manager"
                  value={roleTestInput}
                  onChange={(e) => setRoleTestInput(e.target.value)}
                  data-cy="role-management-hasanyrole-roles-input"
                />
                <Input
                  placeholder="Organization ID (optional)"
                  value={orgTestInput}
                  onChange={(e) => setOrgTestInput(e.target.value)}
                  data-cy="role-management-hasanyrole-org-input"
                />
                <Button
                  onClick={handleTestRoles}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-cy="role-management-hasanyrole-test-btn"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Test Multiple Roles
                </Button>
              </div>
            </div>

            {roleTestPerformed && (
              <>
                <Separator />
                <div
                  className="space-y-2"
                  data-cy="role-management-hasanyrole-result"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Testing roles:</span>
                    <div className="flex flex-wrap gap-1">
                      {testRoles.map((role, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          data-cy="role-management-hasanyrole-tested-role"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {orgTestInput && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">In organization:</span>
                      <Badge
                        variant="outline"
                        data-cy="role-management-hasanyrole-tested-org"
                      >
                        {orgTestInput}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Result:</span>
                    {roleTestResult ? (
                      <div
                        className="flex items-center text-green-600"
                        data-cy="role-management-hasanyrole-result-yes"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        <span>User has at least one of these roles</span>
                      </div>
                    ) : (
                      <div
                        className="flex items-center text-red-600"
                        data-cy="role-management-hasanyrole-result-no"
                      >
                        <X className="w-4 h-4 mr-1" />
                        <span>User does not have any of these roles</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mt-2">
                    <pre
                      className="p-2 bg-slate-100 rounded overflow-x-auto"
                      data-cy="role-management-hasanyrole-result-json"
                    >
                      {JSON.stringify(
                        {
                          testedRoles: testRoles,
                          organizationId: orgTestInput || "any",
                          result: roleTestResult,
                          userRoles: currentUserRoles.map((r) => ({
                            role: r.role_name,
                            org: r.organization_name,
                            orgId: r.organization_id,
                          })),
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Single Role Testing Section (hasRole) */}
      <Card data-cy="role-management-hasrole-card">
        <CardHeader>
          <CardTitle>Test hasRole Function</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="singleRoleTest">Single Role Name</Label>
              <div
                className="flex gap-2 mt-1"
                data-cy="role-management-hasrole-inputs"
              >
                <Input
                  id="singleRoleTest"
                  placeholder="e.g. admin"
                  value={singleRoleInput}
                  onChange={(e) => setSingleRoleInput(e.target.value)}
                  data-cy="role-management-hasrole-role-input"
                />
                <Input
                  placeholder="Organization ID (optional)"
                  value={singleOrgInput}
                  onChange={(e) => setSingleOrgInput(e.target.value)}
                  data-cy="role-management-hasrole-org-input"
                />
                <Button
                  onClick={handleTestSingleRole}
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-cy="role-management-hasrole-test-btn"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Test Single Role
                </Button>
              </div>
            </div>

            {singleRoleTestPerformed && (
              <>
                <Separator />
                <div
                  className="space-y-2"
                  data-cy="role-management-hasrole-result"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Testing role:</span>
                    <Badge
                      variant="outline"
                      data-cy="role-management-hasrole-tested-role"
                    >
                      {singleRoleInput}
                    </Badge>
                  </div>

                  {singleOrgInput && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">In organization:</span>
                      <Badge
                        variant="outline"
                        data-cy="role-management-hasrole-tested-org"
                      >
                        {singleOrgInput}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Result:</span>
                    {singleRoleResult ? (
                      <div
                        className="flex items-center text-green-600"
                        data-cy="role-management-hasrole-result-yes"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        <span>User has this specific role</span>
                      </div>
                    ) : (
                      <div
                        className="flex items-center text-red-600"
                        data-cy="role-management-hasrole-result-no"
                      >
                        <X className="w-4 h-4 mr-1" />
                        <span>User does not have this role</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mt-2">
                    <pre
                      className="p-2 bg-slate-100 rounded overflow-x-auto"
                      data-cy="role-management-hasrole-result-json"
                    >
                      {JSON.stringify(
                        {
                          testedRole: singleRoleInput,
                          organizationId: singleOrgInput || "any",
                          result: singleRoleResult,
                          userRoles: currentUserRoles.map((r) => ({
                            role: r.role_name,
                            org: r.organization_name,
                            orgId: r.organization_id,
                          })),
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
