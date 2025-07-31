import { Database } from "@common/database.types";

export type OrgLocationRow =
  Database["public"]["Tables"]["organization_locations"]["Row"];

export type OrgLocationInsert =
  Database["public"]["Tables"]["organization_locations"]["Insert"];

export type OrgLocationUpdate =
  Database["public"]["Tables"]["organization_locations"]["Update"];

// Storage location types
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

// Combined interface for creating organization location with storage location
export interface CreateOrgLocationWithStorage {
  organization_id: string;
  is_active?: boolean;
  storage_location: {
    name: string;
    address: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    image_url?: string;
    is_active?: boolean;
  };
}

// Combined interface for updating organization location with storage location
export interface UpdateOrgLocationWithStorage {
  organization_location: Partial<OrgLocationUpdate>;
  storage_location?: Partial<StorageLocationUpdate>;
}
