import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchOrganizationDetails } from "../api/organizationService";
import OrganizationInfo from "../components/Organization/OrganizationInfo";
import OrganizationLocationsList from "../components/Organization/OrganizationLocationsList";

const OrganizationPage = () => {
  const { org_slug } = useParams();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOrganizationDetails = async () => {
      try {
        const data = await fetchOrganizationDetails(org_slug);
        setOrganization(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getOrganizationDetails();
  }, [org_slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {organization && (
        <>
          <OrganizationInfo organization={organization} />
          <OrganizationLocationsList locations={organization.locations} />
        </>
      )}
    </div>
  );
};

export default OrganizationPage;
