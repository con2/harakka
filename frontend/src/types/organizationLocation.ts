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

// Storage location types from common database types
export type StorageLocationRow =
  Database["public"]["Tables"]["storage_locations"]["Row"];

export type StorageLocationInsert =
  Database["public"]["Tables"]["storage_locations"]["Insert"];

export type StorageLocationUpdate =
  Database["public"]["Tables"]["storage_locations"]["Update"];

// Extended type with joined organization and storage location names
export interface OrgLocationWithNames extends OrgLocationRow {
  organizations: { name: string } | null;
  storage_locations: {
    name: string;
    address?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    image_url?: string;
    is_active?: boolean;
  } | null;
}

export interface OrgLocationsState {
  orgLocations: OrgLocationWithNames[];
  currentOrgLocation: OrgLocationWithNames | null;
  currentOrgLocations: OrgLocationWithNames[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

// Combined interface for creating organization location with storage location
export interface CreateOrgLocationWithStorage {
  organization_id: string;
  is_active?: boolean;
  storage_location: Omit<StorageLocationInsert, "id" | "created_at">;
}

// Combined interface for updating organization location with storage location
export interface UpdateOrgLocationWithStorage {
  organization_location: Partial<OrgLocationUpdate>;
  storage_location?: Partial<StorageLocationUpdate>;
}
