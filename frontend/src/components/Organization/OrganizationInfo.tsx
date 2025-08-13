import React from "react";
import { OrganizationDetails } from "@/types/organization";

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
        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          {/* TODO: this is a temporary placeholder for organization logo, replace with actual logo when available */}
          <span className="text-lg font-semibold">Logo</span>
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
