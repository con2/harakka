import { Database } from "src/types/supabase.types";

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

/**
 * Extended interface for user roles with joined data
 * Some fields are optional when created from request context
 */
export interface UserRoleWithDetails {
  id?: string; // Optional when created from request context
  user_id: string;
  organization_id: string;
  role_id: string;
  role_name: string;
  organization_name: string;
  is_active: boolean;
  created_at?: string; // Optional when created from request context
}
