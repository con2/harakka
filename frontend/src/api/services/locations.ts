import { api } from "../axios";
import { LocationDetails } from "@/types";

/**
 * API service for location-related endpoints
 */
export const locationsApi = {
  /**
   * Get all storage locations
   * @returns Promise with an array of locations
   */
  getAllLocations: (): Promise<LocationDetails[]> =>
    api.get("/api/storage-locations"),

  /**
   * Get a specific location by ID
   * @param id - Location ID to fetch
   * @returns Promise with the requested location
   */
  getLocationById: (id: string): Promise<LocationDetails> =>
    api.get(`/api/storage-locations/${id}`),
};
