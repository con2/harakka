import { Database } from "@common/database.types";

/**
 * @description Proper Supabase types for role-related entities.
 * These types change automatically when we update our database schema.
 */

// Core role definition
export type Role = Database["public"]["Tables"]["roles"]["Row"];

// User-organization-role relationship
export type UserOrganizationRole =
  Database["public"]["Tables"]["user_organization_roles"]["Row"];

// Organization definition
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export type ViewUserRolesWithDetails =
  Database["public"]["Views"]["view_user_roles_with_details"]["Row"];
