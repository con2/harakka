import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrganizations,
  selectOrganizations,
  selectOrganizationLoading,
  selectOrganizationError,
} from "@/store/slices/organizationSlice";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    void dispatch(fetchAllOrganizations({ page: 1, limit: 50 }));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_item, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-lg"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
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

  // Filter out High Council and Global organizations
  const filteredOrganizations = organizations.filter(
    (org) =>
      !org.name.toLowerCase().includes("high council") &&
      !org.name.toLowerCase().includes("global"),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 bg-white">
      {/* Header Section */}
      <section className="w-full max-w-2xl px-4 sm:px-6 md:px-8 mx-auto mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">
          {t.organizationList.header.title[lang]}
        </h2>
        <p className="text-gray-700 text-center">
          {t.organizationList.header.description[lang]}
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:px-2 md:px-2 pb-10">
        {filteredOrganizations.map((org) => (
          <Card
            key={org.id}
            className="hover:shadow-md transition-shadow duration-200 px-0 h-full flex flex-col"
          >
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Organization logo */}
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                    {org.logo_picture_url ? (
                      <img
                        src={org.logo_picture_url}
                        alt={t.organizationList.alt.organizationLogo[
                          lang
                        ].replace("{orgName}", org.name)}
                        className="h-10 w-10 object-cover rounded-lg"
                      />
                    ) : (
                      <Building2 className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="font-semibold text-gray-900 truncate">
                      {org.name}
                    </CardTitle>
                  </div>
                </div>

                {/* Membership indicator */}
                {userOrgRoles[org.id] && (
                  <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                    <Users className="h-4 w-4" />
                    <span>
                      {formatRoleName(userOrgRoles[org.id][0])}
                      {userOrgRoles[org.id].length > 1 &&
                        ` +${userOrgRoles[org.id].length - 1}`}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex-1 flex flex-col">
              <div className="flex-1">
                {org.description && (
                  <CardDescription className="text-sm text-gray-600 mb-6 line-clamp-2">
                    {org.description}
                  </CardDescription>
                )}
              </div>

              <div className="flex flex-row justify-between gap-2 mt-auto">
                <button
                  onClick={() =>
                    navigate("/storage", {
                      state: {
                        preSelectedFilters: {
                          orgIds: [org.id],
                        },
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200 group"
                >
                  <span>
                    {t.organizationList.actions.browseStorage[lang]} {org.name}{" "}
                    {t.organizationList.actions.browseItems[lang]}
                  </span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>

                {org.slug ? (
                  <Link
                    to={`/organization/${org.slug}`}
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors duration-200 group"
                  >
                    <span>{t.organizationList.actions.readMore[lang]}</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </Link>
                ) : (
                  <span className="text-gray-400 text-sm">
                    {t.organizationList.actions.readMore[lang]} (unavailable)
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrganizationsList;
