import type { Database } from "src/types/database.types";
import type { TagRow } from "../../tag/interfaces/tag.interface";

/* ── Supabase base rows ──────────────────────────────────────────────── */
export type StorageItemRow =
  Database["public"]["Tables"]["storage_items"]["Row"];
export type LocationRow =
  Database["public"]["Tables"]["storage_locations"]["Row"];

/* ── Flattened item returned by the service ──────────────────────────── */
export type StorageItem = StorageItemRow & {
  /** Tags flattened from the join table */
  storage_item_tags?: TagRow[];
  /** Convenience copy of the joined location row */
  location_details?: LocationRow | null;
};

/* ── Shape returned by raw Supabase join (before flattening) ─────────── */
export type StorageItemWithJoin = StorageItemRow & {
  storage_item_tags?: {
    tag_id: string;
    tags: TagRow;
  }[];

  // Raw Supabase join result for location
  storage_locations?: {
    id: string;
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    is_active: boolean;
  };
};

export type ValidItemOrder =
  | "fi_item_name"
  | "fi_item_type"
  | "item_type"
  | "location_name"
  | "price"
  | "items_number_total"
  | "is_active"
  | "created_at";
