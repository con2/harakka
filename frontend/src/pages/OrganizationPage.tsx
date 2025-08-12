import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { organizationApi } from "../api/services/organizations";
import OrganizationInfo from "../components/Organization/OrganizationInfo";
import OrganizationLocationsList from "../components/Organization/OrganizationLocationsList";
import { useRoles } from "@/hooks/useRoles";

const OrganizationPage = () => {
  const { org_slug } = useParams();
  const { activeContext } = useRoles();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizationDetails = async (slug: string | undefined) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all organizations and find the one matching the slug
      const { data } = await organizationApi.getAllOrganizations();
      const org = data.find((org) => org.slug === slug);

      if (!org) {
        throw new Error("Organization not found");
      }

      // Fetch detailed organization data
      const detailedOrg = await organizationApi.getOrganizationById(org.id);
      setOrganization(detailedOrg);
    } catch (err: any) {
      setError(
        err.message || "An error occurred while fetching the organization.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch organization details based on the URL slug or activeContext
    const slugToFetch = org_slug || activeContext.slug;
    if (slugToFetch) {
      void fetchOrganizationDetails(slugToFetch);
    }
  }, [org_slug, activeContext.slug]);

  if (loading) {
    return (
      <div className="text-center py-10">Loading organization details...</div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  if (!organization) {
    return <div className="text-center py-10">Organization not found.</div>;
  }

  return (
    <div className="organization-page">
      <OrganizationInfo
        name={organization.name}
        description={organization.description}
        contactDetails={{
          email: organization.contact_email || "N/A",
          phone: organization.contact_phone || "N/A",
        }}
      />
      <OrganizationLocationsList locations={organization.locations || []} />
    </div>
  );
};

export default OrganizationPage;
