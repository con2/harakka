import React, { useState, useEffect } from "react";
import { useRoles } from "@/hooks/useRoles";
import { roleApi } from "@/api/services/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Shield, Users, Building, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserRoleWithDetails } from "@/types/roles";

export const RoleManagement: React.FC = () => {
  const {
    roles,
    organizations,
    loading,
    error,
    isSuperVera,
    hasRole,
    refreshRoles,
  } = useRoles();

  const [allUserRoles, setAllUserRoles] = useState<UserRoleWithDetails[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Check if user has admin privileges
  const isAdmin = hasRole("admin") || hasRole("superVera") || isSuperVera;

  const fetchAllUserRoles = async () => {
    if (!isAdmin) return;

    try {
      setAdminLoading(true);
      setAdminError(null);
      const data = await roleApi.getAllUserRoles();
      setAllUserRoles(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch all user roles";
      setAdminError(errorMessage);
      console.error("Admin role fetch error:", err);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllUserRoles();
    }
  }, [isAdmin]);

  const handleRefresh = async () => {
    await refreshRoles();
    if (isAdmin) {
      await fetchAllUserRoles();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load role information: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Role Management Dashboard</h2>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

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
                {organizations.map((org) => (
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
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
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
            Your Role Assignments ({roles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <p className="text-muted-foreground">No roles assigned.</p>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
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
                      <Badge variant="outline" className="text-xs">
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
              Admin: All User Roles ({allUserRoles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adminLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoaderCircle className="animate-spin w-6 h-6" />
              </div>
            ) : adminError ? (
              <Alert variant="destructive">
                <AlertDescription>{adminError}</AlertDescription>
              </Alert>
            ) : allUserRoles.length === 0 ? (
              <p className="text-muted-foreground">
                No role assignments found.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allUserRoles.map((role) => (
                  <div
                    key={role.id}
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
                        User: {role.user_id} • Role ID: {role.role_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {role.is_active ? (
                        <Badge variant="outline" className="text-xs">
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
              <Badge variant={isAdmin ? "outline" : "secondary"}>
                {isAdmin ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Has 'admin' role:</span>
              <Badge variant={hasRole("admin") ? "outline" : "secondary"}>
                {hasRole("admin") ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Has 'user' role:</span>
              <Badge variant={hasRole("user") ? "outline" : "secondary"}>
                {hasRole("user") ? "Yes" : "No"}
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
