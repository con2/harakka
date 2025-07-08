import { Database } from "src/types/supabase.types";

/**
 * @description Here are the proper Supabase types we should be using accross the backend for
 * clear types that change when we change our tables.
 * Click the "Row" type to see the database schema.
 * This type represents a single row in the Organizations table.
 */
export type OrganizationName =
  Database["public"]["Tables"]["organization_name"]["Row"];
export type OrganizationDescription =
  Database["public"]["Tables"]["organization_adescription"]["Row"];
