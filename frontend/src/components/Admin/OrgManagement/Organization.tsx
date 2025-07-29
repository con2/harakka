import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useRoles } from "@/hooks/useRoles";
import { fetchAllOrgLocations } from "@/store/slices/organizationLocationsSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, MapPin, Settings } from "lucide-react";
import OrgInfoCard from "./OrgInfoCard";
import OrgLocationManagement from "./OrgLocationManagement";

const Organization = () => {
  const dispatch = useAppDispatch();
  const {
    hasAnyRole,
    currentUserOrganizations,
    loading: rolesLoading,
  } = useRoles();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  const { orgLocations, loading: locationsLoading } = useAppSelector(
    (state) => state.orgLocations,
  );

  // Check if user has admin access
  const isAdmin = hasAnyRole([
    "admin",
    "super_admin",
    "storage_manager",
    "superVera",
    "main_admin",
  ]);

  // Set default organization when organizations load
  useEffect(() => {
    if (currentUserOrganizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(currentUserOrganizations[0].organization_id);
    }
  }, [currentUserOrganizations, selectedOrgId]);

  // Fetch organization locations when selected org changes
  useEffect(() => {
    if (selectedOrgId) {
      void dispatch(
        fetchAllOrgLocations({
          orgId: selectedOrgId,
        }),
      );
    }
  }, [selectedOrgId, dispatch]);

  const selectedOrganization = currentUserOrganizations.find(
    (org) => org.organization_id === selectedOrgId,
  );

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access organization management.
        </AlertDescription>
      </Alert>
    );
  }

  if (currentUserOrganizations.length === 0) {
    return (
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          You are not associated with any organizations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl">Organization Management</h1>
        </div>
      </div>

      {/* Organization Selector for Multi-Org Admins */}
      {currentUserOrganizations.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Organization</CardTitle>
            <CardDescription>
              Choose which organization to manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentUserOrganizations.map((org) => (
                <button
                  key={org.organization_id}
                  onClick={() => setSelectedOrgId(org.organization_id)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedOrgId === org.organization_id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>{org.organization_name}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {selectedOrganization && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview tab */}
          <TabsContent value="overview">
            <OrgInfoCard
              organization={selectedOrganization}
              orgLocations={orgLocations}
              loading={locationsLoading}
            />
          </TabsContent>

          {/* Storage locations tab */}
          <TabsContent value="locations">
            <OrgLocationManagement
              organizationId={selectedOrgId}
              orgLocations={orgLocations}
              loading={locationsLoading}
            />
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>
                  Manage organization configuration and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Organization settings management will be available soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Organization;
