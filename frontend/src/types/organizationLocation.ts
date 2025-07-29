import { Database } from "@common/database.types";

/**
 * Org location types using Supabase Database types.
 */

export type OrgLocationRow =
  Database["public"]["Tables"]["organization_locations"]["Row"];

export type OrgLocationInsert =
  Database["public"]["Tables"]["organization_locations"]["Insert"];

export type OrgLocationUpdate =
  Database["public"]["Tables"]["organization_locations"]["Update"];

// Extended type with joined organization and storage location names
export interface OrgLocationWithNames extends OrgLocationRow {
  organizations: { name: string } | null;
  storage_locations: { name: string } | null;
}

export interface OrgLocationsState {
  orgLocations: OrgLocationWithNames[];
  currentOrgLocation: OrgLocationWithNames | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}
