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
  getAllOrganizations: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: OrganizationDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const response = await api.get(
      `/organizations?page=${page}&limit=${limit}`,
    );
    console.log("RSPONSE", response);
    console.log("DEBUG getAllOrganizations response:", response.data);
    console.log("DEBUG getAllOrganizations metadata:", response.data.metadata);

    /* const data = response.data.data;
    const metadata = response.data.metadata; */

    const orgs = response.data.data;
    const metadata = response.data.metadata;

    return {
      data: orgs,
      total: metadata.total,
      page: metadata.page,
      totalPages: metadata.totalPages,
    };

    /*
    return {
      data: orgs,
      total: orgs.length,
      page,
      totalPages: 1,
    }; /* return {
      data,
      total: metadata?.total ?? data.length,
      page: metadata?.page ?? page,
      totalPages: metadata?.totalPages ?? 1,
    }; */
  },

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
