import { ErrorContext, TagTranslation } from "@/types";
import { Database } from "@common/database.types";
/**
 * Item translations content
 */
export interface ItemTranslation {
  item_type: string;
  item_name: string;
  item_description: string;
}
/* export interface Item extends BaseEntity, Translatable<ItemTranslation> {
  location_id: string;
  compartment_id: string;
  items_number_total: number;
  items_number_currently_in_storage: number;
  price: number;
  is_active: boolean;
  average_rating?: number;
  tagIds?: string[];
  storage_item_tags?: Tag[];
  location_details?: LocationDetails | null;
  location_name?: string;
}
 */
/**
 * Storage item row shape coming directly from Supabase.
 */
type StorageItemRow = Database["public"]["Tables"]["storage_items"]["Row"];

/** Basic tag row from Supabase */
type TagRow = Database["public"]["Tables"]["tags"]["Row"];

/** Basic location row from Supabase */
type LocationRow = Database["public"]["Tables"]["storage_locations"]["Row"];

/**
 * Flattened storage item with optional joins – mirrors the backend `StorageItem`.
 */
export type Item = StorageItemRow & {
  /** Tags flattened from the join table */
  storage_item_tags?: TagRow[];
  /** Convenience copy of the joined location row */
  location_details?: LocationRow | null;

  /** Average rating calculated server‑side from reviews (frontend‑only helper) */
  average_rating?: number;

  /** UUIDs of tags attached to this item (frontend helper for forms) */
  tagIds?: string[];

  /** Flattened location name for quick lists & tables */
  location_name?: string;
};

/** Alias kept for parity with backend naming */
export type StorageItem = Item;

/**
 * Raw Supabase join type (mirrors backend `StorageItemWithJoin`)
 */
export type StorageItemWithJoin = StorageItemRow & {
  storage_item_tags?: {
    tag_id: string;
    tags: TagRow;
  }[];
  storage_locations?: LocationRow;
};

/**
 * Item state in Redux store
 */
export interface ItemState {
  items: Array<Item | ManageItemViewRow>;
  loading: boolean;
  error: string | null;
  selectedItem: Item | null;
  errorContext: ErrorContext;
  deletableItems: Record<string, boolean>;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Payload for creating a new item (frontend → backend).
 *
 * We strip away DB‑managed columns and calculated helpers that are never
 * sent from the form.
 */
export type CreateItemDto = Omit<
  Item,
  | "id"
  | "created_at"
  | "updated_at"
  | "storage_item_tags"
  | "average_rating"
  | "location_name"
> & {
  /** Plain tag IDs selected in the form */
  tagIds?: string[];
};

/**
 * Data for updating an existing item
 */
export type UpdateItemDto = Partial<
  Omit<Item, "id" | "created_at" | "updated_at" | "storage_item_tags">
> & {
  tagIds?: string[];
};

/**
 * Valid orders/filters for the manage items page.
 */
export type ValidItemOrder =
  | "fi_item_name"
  | "fi_item_type"
  | "location_name"
  | "price"
  | "items_number_total"
  | "is_active"
  | "created_at";
