import { api } from "../axios";
import { LocationDetails } from "@/types";

/**
 * API service for location-related endpoints
 */
export const locationsApi = {
  /**
   * Get all storage locations with optional pagination
   * @param page - Current page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @returns Paginated response with locations
   */
  getAllLocations: (
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: LocationDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> => api.get(`/api/storage-locations?page=${page}&limit=${limit}`),

  /**
   * Get a specific location by ID
   */
  getLocationById: (id: string): Promise<LocationDetails> =>
    api.get(`/api/storage-locations/${id}`),
};

