import React from "react";
import { LocationDetails } from "../../types/location";
import OrganizationStorageLink from "./OrganizationStorageLink";

interface OrganizationLocationsListProps {
  locations: LocationDetails[];
}

const OrganizationLocationsList: React.FC<OrganizationLocationsListProps> = ({
  locations,
}) => {
  return (
    <div>
      <h2>Locations</h2>
      <ul>
        {locations.map((location) => (
          <li key={location.id}>
            <h3>{location.name}</h3>
            <p>{location.address}</p>
            <OrganizationStorageLink orgSlug={location.org_slug} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrganizationLocationsList;
