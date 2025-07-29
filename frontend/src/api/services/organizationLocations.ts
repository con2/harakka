import { ApiResponse } from "@/types/api";
import {
  OrgLocationInsert,
  OrgLocationUpdate,
  OrgLocationWithNames,
} from "@/types/organizationLocation";
import { api } from "../axios";

/**
 * API service for org locations endpoints
 */
export const orgLocationsApi = {
  /**
   * Get all org locations with pagination
   * @param orgId - Org ID to fetch locations for
   * @param pageSize - Number of items per page (default: 10)
   * @param currentPage - Current page number (default: 1)
   * @returns Promise with paginated org locations
   */
  getAllOrgLocs: (
    orgId: string,
    pageSize: number = 10,
    currentPage: number = 1,
  ): Promise<ApiResponse<OrgLocationWithNames[]>> =>
    api.get(
      `/organization-locations/organization/${orgId}?pageSize=${pageSize}&currentPage=${currentPage}`,
    ),

  /**
   * Get a specific org location by ID
   * @param id - Org location ID to fetch
   * @returns Promise with the requested org location
   */
  getOrgLocById: (id: string): Promise<OrgLocationWithNames> =>
    api.get(`/organization-locations/${id}`),

  /**
   * Create a new org location
   * @param orgLocationData - Org location data to create
   * @returns Promise with the created org location
   */
  createOrgLoc: (
    orgLocationData: OrgLocationInsert,
  ): Promise<OrgLocationWithNames> =>
    api.post("/organization-locations", orgLocationData),

  /**
   * Update an existing org location
   * @param id - Org location ID to update
   * @param orgLocationData - Updated org location data
   * @returns Promise with the updated org location
   */
  updateOrgLoc: (
    id: string,
    orgLocationData: OrgLocationUpdate,
  ): Promise<OrgLocationWithNames> =>
    api.put(`/organization-locations/${id}`, orgLocationData),

  /**
   * Delete an org location
   * @param id - Org location ID to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteOrgLoc: (id: string): Promise<void> =>
    api.delete(`/organization-locations/${id}`),
};
