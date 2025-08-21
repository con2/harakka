import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectOrgLocationsLoading,
  selectOrgLocationsError,
  fetchAllOrgLocations,
  selectOrgLocations,
} from "@/store/slices/organizationLocationsSlice";
import { useRoles } from "@/hooks/useRoles";
import { LoaderCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrgLocationManagement from "@/components/Admin/OrgManagement/OrgLocationManagement";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const OrganizationLocations = () => {
  const dispatch = useAppDispatch();
  const { currentUserOrganizations } = useRoles();
  const { lang } = useLanguage();

  // Redux state using selectors
  const orgLocations = useAppSelector(selectOrgLocations);
  const loading = useAppSelector(selectOrgLocationsLoading);
  const error = useAppSelector(selectOrgLocationsError);

  // Local state
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  // Filter organizations where user has location management permissions
  const orgsWithLocationAccess = useMemo(() => {
    const allowedRoles = [
      "tenant_admin",
      "storage_manager",
      "super_admin",
      "superVera",
    ];

    return (
      currentUserOrganizations?.filter((org) =>
        org.roles.some((role) => allowedRoles.includes(role)),
      ) || []
    );
  }, [currentUserOrganizations]);

  // Get the first organization the user belongs to
  useEffect(() => {
    if (orgsWithLocationAccess && orgsWithLocationAccess.length > 0) {
      const firstOrg = orgsWithLocationAccess[0];
      setSelectedOrgId(firstOrg.organization_id);
    }
  }, [orgsWithLocationAccess]);

  // Fetch locations when organization is selected
  useEffect(() => {
    if (selectedOrgId) {
      void dispatch(
        fetchAllOrgLocations({
          orgId: selectedOrgId,
          pageSize: 100,
          currentPage: 1,
        }),
      );
    }
  }, [dispatch, selectedOrgId]);

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
      <div className="flex items-center space-x-3">
        <h1 className="text-xl">{t.organizationLocations.title[lang]}</h1>
      </div>

      {/* Organization Selector (if user belongs to multiple orgs) */}
      {orgsWithLocationAccess.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t.organizationLocations.selector.title[lang]}
            </CardTitle>
            <CardDescription>
              {t.organizationLocations.selector.description[lang]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    t.organizationLocations.selector.placeholder[lang]
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {orgsWithLocationAccess.map((org) => (
                  <SelectItem
                    key={org.organization_id}
                    value={org.organization_id}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">
                        {org.organization_name || org.organization_id}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

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
      {selectedOrgId && (
        <OrgLocationManagement
          organizationId={selectedOrgId}
          orgLocations={orgLocations}
          loading={loading}
        />
      )}
    </div>
  );
};

export default OrganizationLocations;
