import { useEffect, useState } from "react";
import { organizationApi } from "@/api/services/organizations";
import { OrganizationDetails } from "@/types/organization";

interface UseOrganizationNamesReturn {
  organizationNames: Record<string, string>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch organization names for a list of organization IDs
 * @param orgIds - Array of organization IDs to fetch names for
 * @returns Object mapping org ID to org name, loading state, and error
 */
export const useOrganizationNames = (
  orgIds: string[],
): UseOrganizationNamesReturn => {
  const [organizationNames, setOrganizationNames] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizationNames = async () => {
      if (orgIds.length === 0) {
        setOrganizationNames({});
        return;
      }

      // Filter out IDs we already have names for
      const unknownOrgIds = orgIds.filter((id) => !organizationNames[id]);

      if (unknownOrgIds.length === 0) {
        return; // We already have all the names we need
      }

      setLoading(true);
      setError(null);

      try {
        const promises = unknownOrgIds.map(async (orgId) => {
          try {
            const org: OrganizationDetails =
              await organizationApi.getOrganizationById(orgId);
            return { id: orgId, name: org.name };
          } catch (err) {
            console.warn(`Failed to fetch organization ${orgId}:`, err);
            return { id: orgId, name: "Unknown Organization" };
          }
        });

        const results = await Promise.all(promises);

        const newNames = results.reduce(
          (acc, { id, name }) => {
            acc[id] = name;
            return acc;
          },
          {} as Record<string, string>,
        );

        setOrganizationNames((prev) => ({ ...prev, ...newNames }));
      } catch (err) {
        console.error("Error fetching organization names:", err);
        setError("Failed to fetch organization information");
      } finally {
        setLoading(false);
      }
    };

    void fetchOrganizationNames();
  }, [orgIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return { organizationNames, loading, error };
};
