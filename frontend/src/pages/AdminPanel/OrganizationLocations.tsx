import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectOrgLocationsLoading,
  selectOrgLocationsError,
  fetchAllOrgLocations,
  selectOrgLocations,
} from "@/store/slices/organizationLocationsSlice";
import { useRoles } from "@/hooks/useRoles";
import { LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import OrgLocationManagement from "@/components/Admin/OrgManagement/OrgLocationManagement";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";

const OrganizationLocations = () => {
  const dispatch = useAppDispatch();
  const { organizationId: activeOrgId } = useAppSelector(
    selectActiveRoleContext,
  );
  const { currentUserOrganizations } = useRoles();
  const { lang } = useLanguage();

  // Redux state using selectors
  const orgLocations = useAppSelector(selectOrgLocations);
  const loading = useAppSelector(selectOrgLocationsLoading);
  const error = useAppSelector(selectOrgLocationsError);

  // Filter organizations where user has location management permissions
  const orgsWithLocationAccess = useMemo(() => {
    const allowedRoles = ["tenant_admin", "storage_manager", "super_admin"];

    return (
      currentUserOrganizations?.filter((org) =>
        org.roles.some((role) => allowedRoles.includes(role)),
      ) || []
    );
  }, [currentUserOrganizations]);

  // Fetch locations when organization is selected
  useEffect(() => {
    if (activeOrgId) {
      void dispatch(
        fetchAllOrgLocations({
          orgId: activeOrgId,
          pageSize: 100,
          currentPage: 1,
        }),
      );
    }
  }, [dispatch, activeOrgId]);

  if (!orgsWithLocationAccess || orgsWithLocationAccess.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          {t.organizationLocations.noAccess.title[lang]}
        </h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {t.organizationLocations.noAccess.message[lang]}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-0">
        <h1 className="text-2xl md:text-xl mb-2">
          {t.organizationLocations.title[lang]}
        </h1>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              {t.organizationLocations.error[lang].replace("{error}", error)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && !orgLocations.length && (
        <div className="flex justify-center p-8">
          <LoaderCircle className="animate-spin h-8 w-8" />
        </div>
      )}

      {/* Location Management */}
      {activeOrgId && (
        <OrgLocationManagement
          organizationId={activeOrgId}
          orgLocations={orgLocations}
          loading={loading}
        />
      )}
    </div>
  );
};

export default OrganizationLocations;
