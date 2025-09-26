import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrganizations,
  selectOrganizations,
  selectOrganizationLoading,
  selectOrganizationError,
} from "@/store/slices/organizationSlice";
import { Link } from "react-router-dom";
import { Building2, Users, ArrowRight } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { formatRoleName } from "@/utils/format";

const OrganizationsList = () => {
  const dispatch = useAppDispatch();
  const organizations = useAppSelector(selectOrganizations);
  const loading = useAppSelector(selectOrganizationLoading);
  const error = useAppSelector(selectOrganizationError);
  const { currentUserOrganizations } = useRoles();
  const { lang } = useLanguage();

  useEffect(() => {
    void dispatch(fetchAllOrganizations({ page: 1, limit: 50 }));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_item, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        {t.organizationList.error[lang]} {error}
      </div>
    );
  }

  // Extract organization roles for the current user
  const userOrgRoles = currentUserOrganizations.reduce(
    (acc, org) => {
      acc[org.organization_id] = org.roles; // Map org ID to roles
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <Card
            key={org.id}
            className="relative flex flex-col h-full hover:shadow-lg transition-shadow duration-200 border-0 shadow-sm"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Organization logo */}
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden shadow-sm">
                    {org.logo_picture_url ? (
                      <img
                        src={org.logo_picture_url}
                        alt={t.organizationList.alt.organizationLogo[
                          lang
                        ].replace("{orgName}", org.name)}
                        className="h-12 w-12 object-cover rounded-xl"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                      {org.name}
                    </CardTitle>
                  </div>
                </div>

                {/* Membership indicator on the right */}
                {userOrgRoles[org.id] && (
                  <div className="flex flex-col items-end ml-4">
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <Users className="h-4 w-4" />
                      <span>
                        {t.organizationList.membership.youAreRole[lang].replace(
                          "{role}",
                          formatRoleName(userOrgRoles[org.id][0]),
                        )}
                        {userOrgRoles[org.id].length > 1 &&
                          ` +${userOrgRoles[org.id].length - 1}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0 flex-grow flex flex-col">
              <CardDescription className="text-sm text-gray-600 mb-4 overflow-hidden">
                {org.description ||
                  t.organizationList.columns.description[lang]}
              </CardDescription>

              <div className="mt-auto">
                <Link
                  to={`/storage?organization=${encodeURIComponent(org.name)}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200 group"
                >
                  <span>
                    {t.organizationList.actions.browseStorage[lang]} {org.name}
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrganizationsList;
