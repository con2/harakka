import { Database } from "@common/database.types";
import { TagRow } from "@common/items/tag.types";

/* ── Supabase base rows ──────────────────────────────────────────────── */
export type StorageItemRow =
  Database["public"]["Tables"]["storage_items"]["Row"];
export type StorageItemInsert =
  Database["public"]["Tables"]["storage_items"]["Insert"];
export type LocationRow =
  Database["public"]["Tables"]["storage_locations"]["Row"];
export type StorageItem = StorageItemRow & {
  /** Tags flattened from the join table */
  tags: TagRow[];
  /** Convenience copy of the joined location row */
  location_details: LocationRow | null;
};

/* ── Supabase RPC Rows ──────────────────────────────────────────────── */
export type AvailabilityOverviewRow =
  Database["public"]["Functions"]["availability_overview"]["Returns"][number];

/* ── Shape returned by raw Supabase join (before flattening) ─────────── */
export type StorageItemWithJoin = StorageItemRow & {
  storage_item_tags: {
    tag_id: string;
    tags: TagRow;
  }[];
  storage_locations: LocationRow;
};

export type ValidItemOrder =
  | "fi_item_name"
  | "fi_item_type"
  | "item_type"
  | "location_name"
  | "quantity"
  | "is_active"
  | "created_at";
