import { OrganizationDetails } from "@/types/organization";
import { api } from "../axios";
import { ApiResponse } from "@common/response.types";

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
  ): Promise<ApiResponse<OrganizationDetails>> => {
    return await api.get(`/organizations?page=${page}&limit=${limit}`);
  },

  /**
   * Get a specific organization by ID
   */
  getOrganizationById: (id: string): Promise<OrganizationDetails> =>
    api.get(`/organizations/${id}`),

  /**
   * Get a specific organization by slug
   */
  getOrganizationBySlug: (slug: string): Promise<OrganizationDetails> =>
    api.get(`/organizations/slug/${slug}`),

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

  /**
   * Get organizations count (used on admin dashboard)
   */
  getOrganizationsCount: (): Promise<{ count: number }> =>
    api.get(`/organizations/count`),

  /**
   * Upload new logo picture for the current org
   * @param file - The file to upload
   * @returns Promise with the URL of the uploaded picture
   */
  uploadOrganizationLogo: (
    id: string,
    file: File,
  ): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/organizations/${id}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
