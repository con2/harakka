import React from "react";
import { Link } from "react-router-dom";
import { OrganizationDetails } from "../../types/organization";

interface OrganizationStorageLinkProps {
  organization: OrganizationDetails;
}

const OrganizationStorageLink: React.FC<OrganizationStorageLinkProps> = ({
  organization,
}) => {
  return (
    <Link
      to={`/storage?org_slug=${organization.slug}`}
      className="text-blue-500 hover:underline"
    >
      View Storage Items
    </Link>
  );
};

export default OrganizationStorageLink;
