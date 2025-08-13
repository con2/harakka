import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchOrganizationBySlug,
  selectOrganizationLoading,
  selectOrganizationError,
  selectedOrganization,
} from "@/store/slices/organizationSlice";
import {
  fetchLocationsByOrgId,
  selectCurrentOrgLocations,
  selectOrgLocationsLoading,
  clearOrgLocations,
  selectOrgLocationsError,
} from "@/store/slices/organizationLocationsSlice";
import OrganizationInfo from "../components/Organization/OrganizationInfo";
import LocationsList from "@/components/Admin/OrgManagement/LocationsList";

const OrganizationPage = () => {
  const { org_slug } = useParams();
  const dispatch = useAppDispatch();
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Track the active request to prevent race conditions
  const activeRequestSlugRef = useRef<string | undefined>(org_slug);

  // Get data from Redux store
  const organization = useAppSelector(selectedOrganization);
  const orgLocations = useAppSelector(selectCurrentOrgLocations);
  const organizationLoading = useAppSelector(selectOrganizationLoading);
  const locationsLoading = useAppSelector(selectOrgLocationsLoading);
  const organizationError = useAppSelector(selectOrganizationError);
  const locationsError = useAppSelector(selectOrgLocationsError);

  // Update the reference of the current active slug when it changes
  useEffect(() => {
    activeRequestSlugRef.current = org_slug;
  }, [org_slug]);

  // Reset state and fetch data when slug changes
  useEffect(() => {
    setFetchError(null);

    // Clear any existing data in the store
    dispatch(clearOrgLocations());

    // Fetch new organization data
    if (org_slug) {
      const fetchData = async () => {
        try {
          // First fetch organization data
          const orgAction = await dispatch(fetchOrganizationBySlug(org_slug));

          // Check if we successfully got the organization
          if (fetchOrganizationBySlug.fulfilled.match(orgAction)) {
            // Make sure we're still on the same page
            if (activeRequestSlugRef.current !== org_slug) {
              return; // We've navigated away, abort
            }

            const org = orgAction.payload;
            if (org?.id) {
              // Fetch locations using the organization ID
              await dispatch(
                fetchLocationsByOrgId({
                  id: org.id,
                  page: 1,
                  limit: 100,
                }),
              ).unwrap();

              // Verify we're still on the same page after locations fetch
              if (activeRequestSlugRef.current !== org_slug) {
                dispatch(clearOrgLocations()); // Clean up if navigated away
              }
            }
          }
        } catch (err) {
          console.error("Error in data fetching:", err);
          // Only set error if we're still on the same page
          if (activeRequestSlugRef.current === org_slug) {
            setFetchError("Failed to load data. Please try again.");
          }
        }
      };

      fetchData();
    }

    // Clean up when unmounting or slug changes
    return () => {
      dispatch(clearOrgLocations());
    };
  }, [org_slug, dispatch]);

  // Combine the errors from organization and locations
  const error = organizationError || locationsError || fetchError;

  // Handle error state
  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  // Handle loading state
  if (organizationLoading || (organization && locationsLoading)) {
    return (
      <div className="text-center py-10">Loading organization data...</div>
    );
  }

  if (!organization) {
    return <div className="text-center py-10">Organization not found.</div>;
  }

  // Filter locations to ensure they belong to the current organization
  const displayLocations = orgLocations.filter(
    (location) => location.organization_id === organization.id,
  );

  return (
    <div className="organization-page space-y-6">
      {/* Organization Info */}
      <OrganizationInfo organization={organization} />

      {/* Locations List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Locations</h2>

        {/* Error message */}
        {fetchError && <div className="text-red-500 mb-4">{fetchError}</div>}

        {/* Debug info */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-muted-foreground mb-2">
            <p>Organization ID: {organization.id}</p>
            <p>Total Locations: {orgLocations.length}</p>
            <p>Filtered Locations: {displayLocations.length}</p>
            <p>Active Request Slug: {activeRequestSlugRef.current}</p>
            <p>Current URL Slug: {org_slug}</p>
            <p>Organization Loading: {organizationLoading ? "Yes" : "No"}</p>
            <p>Locations Loading: {locationsLoading ? "Yes" : "No"}</p>
            {orgLocations.length > 0 && displayLocations.length === 0 && (
              <div className="text-orange-500">
                <p>
                  Warning: Locations exist but none match this organization!
                </p>
                <p>First location org_id: {orgLocations[0]?.organization_id}</p>
              </div>
            )}
          </div>
        )}

        <LocationsList
          locations={displayLocations}
          loading={locationsLoading}
          showActions={false}
          organizationId={organization.id}
        />
      </div>
    </div>
  );
};

export default OrganizationPage;
