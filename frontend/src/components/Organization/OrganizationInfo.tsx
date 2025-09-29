import React from "react";
import { OrganizationDetails } from "@/types/organization";
import { Building2 } from "lucide-react";

interface OrganizationInfoProps {
  organization: OrganizationDetails;
}

const OrganizationInfo: React.FC<OrganizationInfoProps> = ({
  organization,
}) => {
  return (
    <div className="organization-info space-y-6 p-6">
      {/* Organization Header */}
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
          {organization.logo_picture_url ? (
            <img
              src={organization.logo_picture_url}
              alt={`${organization.name} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 className="h-10 w-10" />
          )}
        </div>

        <h1 className="text-2xl font-bold">{organization.name}</h1>
      </div>

      {/* Description */}
      <p className="text-gray-700">
        {organization.description || "No description available."}
      </p>

      {/* Storage Link */}
      <div></div>
    </div>
  );
};

export default OrganizationInfo;
