import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchOrganizationLocations } from "../api/organizations";
import OrganizationLocationsList from "../components/Organization/OrganizationLocationsList";

const OrganizationLocationsPage = () => {
  const { org_slug } = useParams();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getLocations = async () => {
      try {
        const data = await fetchOrganizationLocations(org_slug);
        setLocations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getLocations();
  }, [org_slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Locations for {org_slug}</h1>
      <OrganizationLocationsList locations={locations} />
    </div>
  );
};

export default OrganizationLocationsPage;
