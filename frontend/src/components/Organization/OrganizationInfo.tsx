import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrganizationDetails } from "@/types/organization";
import { Building2, ArrowRight, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { Button } from "@/components/ui/button";
import { useRoles } from "@/hooks/useRoles";
import { formatRoleName } from "@/utils/format";

interface OrganizationInfoProps {
  organization: OrganizationDetails;
}

const OrganizationInfo: React.FC<OrganizationInfoProps> = ({
  organization,
}) => {
  const { lang } = useLanguage();
  const { currentUserOrganizations } = useRoles();
  const navigate = useNavigate();

  // Get user's role information for this organization
  const userOrgRole = currentUserOrganizations.find(
    (org) => org.organization_id === organization.id,
  );

  return (
    <div className="organization-info space-y-6 p-6">
      {/* Organization Header */}
      <section className="w-full max-w-xl px-4 sm:px-6 md:px-8 mx-auto mb-6">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-full flex justify-start">
            <Button asChild variant="secondary">
              <Link to="/organizations" className="gap-2">
                <ArrowRight className="h-4 w-4 rotate-180" />
                <span>{t.organizationList.actions.backButton[lang]}</span>
              </Link>
            </Button>
          </div>
          <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden shadow-sm">
            {organization.logo_picture_url ? (
              <img
                src={organization.logo_picture_url}
                alt={`${organization.name} logo`}
                className="h-24 w-24 object-cover rounded-xl"
              />
            ) : (
              <Building2 className="h-12 w-12 text-blue-600" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">
            {organization.name}
          </h2>

          {/* Member Information */}
          {userOrgRole && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {t.organizationList.membership.youAreRole[lang].replace(
                  "{role}",
                  formatRoleName(userOrgRole.roles[0]),
                )}
                {userOrgRole.roles.length > 1 &&
                  ` +${userOrgRole.roles.length - 1}`}
              </span>
            </div>
          )}

          {organization.description && (
            <p className="text-gray-700 text-center leading-relaxed">
              {organization.description}
            </p>
          )}

          {/* Browse Storage Button */}
          <Button
            variant="secondary"
            className="gap-2 group"
            onClick={() =>
              navigate("/storage", {
                state: {
                  preSelectedFilters: {
                    orgIds: [organization.id],
                  },
                },
              })
            }
          >
            <span>
              {t.organizationList.actions.browseStorage[lang]}{" "}
              {organization.name} {t.organizationList.actions.browseItems[lang]}
            </span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default OrganizationInfo;
