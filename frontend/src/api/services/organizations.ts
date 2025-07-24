import { OrganizationDetails } from "@/types/organization";
import { api } from "../axios";

/**
 * API service for organization endpoints
 */
export const organizationApi = {
  /**
   * Get all organizations with optional pagination
   * @param page - Current page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @returns Paginated response with organizations
   */
  getAllOrganizations: (
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: OrganizationDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> => api.get(`/organizations?page=${page}&limit=${limit}`),

  /**
   * Get a specific organization by ID
   */
  getOrganizationById: (id: string): Promise<OrganizationDetails> =>
    api.get(`/organizations/${id}`),

  createOrganization: (
    data: Partial<OrganizationDetails>,
  ): Promise<OrganizationDetails> => api.post("/organizations", data),

  updateOrganization: (
    id: string,
    data: Partial<OrganizationDetails>,
  ): Promise<OrganizationDetails> => api.put(`/organizations/${id}`, data),

  deleteOrganization: (id: string): Promise<{ success: boolean; id: string }> =>
    api.delete(`/organizations/${id}`),

  softDeleteOrganization: (
    id: string,
  ): Promise<{ success: boolean; id: string }> =>
    api.patch(`/organizations/${id}/soft-delete`),
};
