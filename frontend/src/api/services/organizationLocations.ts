import { ApiResponse } from "@/types/api";
import {
  OrgLocationInsert,
  OrgLocationUpdate,
  OrgLocationWithNames,
  CreateOrgLocationWithStorage,
  UpdateOrgLocationWithStorage,
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
   * Get a specific org location by location ID
   * @param id - location ID to fetch
   * @returns Promise with the requested org location
   */
  getOrgLocById: (
    id: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<OrgLocationWithNames> =>
    api.get(`/organization-locations/${id}?page=${page}&limit=${limit}`),

  /**
   * Get a specific org location by org ID
   * @param id - Org location ID to fetch
   * @returns Promise with the requested org location
   */
  getOrgLocByOrgId: (
    id: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<OrgLocationWithNames[]> =>
    api.get(
      `/organization-locations/organization/${id}?page=${page}&limit=${limit}`,
    ),

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

  /**
   * Create a new org location with storage location
   * @param data - Combined org location and storage location data
   * @returns Promise with the created org location
   */
  createOrgLocWithStorage: (
    data: CreateOrgLocationWithStorage,
  ): Promise<OrgLocationWithNames> =>
    api.post("/organization-locations/with-storage", data),

  /**
   * Update an existing org location with storage location
   * @param id - Org location ID to update
   * @param data - Updated org location and storage location data
   * @returns Promise with the updated org location
   */
  updateOrgLocWithStorage: (
    id: string,
    data: UpdateOrgLocationWithStorage,
  ): Promise<OrgLocationWithNames> =>
    api.put(`/organization-locations/${id}/with-storage`, data),

  /**
   * Remove an org location (preserves storage location data)
   * @param id - Org location ID to remove
   * @returns Promise that resolves when removal is complete
   */
  deleteOrgLocWithStorage: (id: string): Promise<void> =>
    api.delete(`/organization-locations/${id}/with-storage`),
};
