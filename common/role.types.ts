import { Database } from "./database.types";
import { Enums, Tables } from "./supabase.types";

/**
 * @description Proper Supabase types for role-related entities.
 * These types change automatically when we update our database schema.
 */

// Core role definition
export type Role = Tables<"roles">;

// User-organization-role relationship
export type UserOrganizationRole = Tables<"user_organization_roles">;

// Organization definition
export type Organization = Tables<"organizations">;

export type ViewUserRolesWithDetails = Tables<"view_user_roles_with_details">;

export type Org_Roles = Enums<"roles_type">