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

export interface OrgLocationsState {
  orgLocations: OrgLocationRow[];
  currentOrgLocation: OrgLocationRow | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}
