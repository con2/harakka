import { api } from "../axios";
import {
  CreateUserRoleDto,
  RoleCheckResponse,
  RolesRow,
  UpdateUserRoleDto,
  UserOrganization,
} from "@/types/roles";
import { ViewUserRolesWithDetails } from "@common/role.types";
import { supabase } from "@/config/supabase";

// Helper function to check session existance
const noSession = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !data.session;
};

export const roleApi = {
  // Get current user's roles
  async getCurrentUserRoles(): Promise<ViewUserRolesWithDetails[]> {
    if (await noSession()) {
      return []; // No active session = no roles
    }
    return await api.get("/roles/current");
  },

  // Check if user has a specific role
  async hasRole(roleName: string): Promise<RoleCheckResponse> {
    return await api.get(`/roles/check/${roleName}`);
  },

  // Check if user has a specific role in an organization
  async hasRoleInOrganization(
    roleName: string,
    orgId: string,
  ): Promise<RoleCheckResponse> {
    return await api.get(`/roles/check/${roleName}/organization/${orgId}`);
  },

  // Get user's organizations and roles
  async getUserOrganizations(): Promise<UserOrganization[]> {
    if (await noSession()) {
      return []; // // No active session = no user orgs
    }
    return await api.get("/roles/organizations");
  },

  // Get user's roles in a specific organization
  async getUserRolesInOrganization(
    orgId: string,
  ): Promise<ViewUserRolesWithDetails[]> {
    return await api.get(`/roles/organization/${orgId}`);
  },

  // Get all user roles
  async getAllUserRoles(): Promise<
    /* `ViewUserRolesWithDetails` is a type that represents detailed
  information about a user role.  */
    ViewUserRolesWithDetails[]
  > {
    return await api.get("/roles/all");
  },

  // Get all available roles for dropdowns
  async getAvailableRoles(): Promise<RolesRow[]> {
    return await api.get("/roles/list");
  },

  // Assign a role to a user in an organization
  async createUserRole(
    createRoleDto: CreateUserRoleDto,
  ): Promise<ViewUserRolesWithDetails> {
    return await api.post("/roles", createRoleDto);
  },

  // Update a user's role in an organization
  async updateUserRole(
    tableKeyId: string,
    updateRoleDto: UpdateUserRoleDto,
  ): Promise<ViewUserRolesWithDetails> {
    return await api.put(`/roles/${tableKeyId}`, updateRoleDto);
  },

  // Replace a user role (delete old, create new)
  async replaceUserRole(
    oldRoleId: string,
    createRoleDto: CreateUserRoleDto,
  ): Promise<ViewUserRolesWithDetails> {
    return await api.put(`/roles/${oldRoleId}/replace`, createRoleDto);
  },

  //Set the role of a user to inactive (is_active=false), this is not a permanent delete
  async deleteUserRole(
    tableKeyId: string,
  ): Promise<{ success: boolean; message: string }> {
    return await api.delete(`/roles/${tableKeyId}`);
  },

  //USE WITH A GREAT CAUTION: this will permanently delete the role of this user from the database
  async permanentDeleteUserRole(
    tableKeyId: string,
  ): Promise<{ success: boolean; message: string }> {
    return await api.delete(`/roles/${tableKeyId}/permanent`);
  },
};
