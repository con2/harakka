import { api } from "../axios";
import {
  CreateUserRoleDto,
  RoleCheckResponse,
  UpdateUserRoleDto,
  UserOrganization,
} from "@/types/roles";
import type { Database } from "@common/database.types";
import { ViewUserRolesWithDetails } from "@common/role.types";

export const roleApi = {
  // Get current user's roles
  async getCurrentUserRoles(): Promise<ViewUserRolesWithDetails[]> {
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
    return await api.get("/roles/organizations");
  },

  // Get user's roles in a specific organization
  async getUserRolesInOrganization(
    orgId: string,
  ): Promise<ViewUserRolesWithDetails[]> {
    return await api.get(`/roles/organization/${orgId}`);
  },

  // Check if user is superVera
  async isSuperVera(): Promise<{ isSuperVera: boolean }> {
    return await api.get("/roles/super-vera");
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
  async getAvailableRoles(): Promise<
    Database["public"]["Tables"]["roles"]["Row"][]
  > {
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
