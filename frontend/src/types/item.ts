import { ErrorContext, Tag, TagTranslation } from "@/types";
import { Override } from "./db-helpers";
import { StorageItemRow } from "@common/items/storage-items.types";

/**
 * Item translations content
 */
export interface ItemTranslation {
  item_type: string;
  item_name: string;
  item_description: string;
}

/** Overrides for JSON / joined columns so we avoid the recursive `Json` type */
interface ItemAugmentedFields {
  /** Localised text payload is *always* present in UI logic */
  translations: {
    en: ItemTranslation;
    fi: ItemTranslation;
    /** allow future locales without breaking the type */
    [locale: string]: ItemTranslation;
  };

  /** Normalised metadata object */
  test_metadata: {
    version?: number;
    test_flag?: boolean;
    last_modified?: string;
    [k: string]: unknown;
  } | null;

  /** Random json column */
  test_priority_score?: number | null;

  /** Ratings */
  average_rating?: number; // make non-nullable for UI

  /** Inventory & status (always concrete in UI) */
  items_number_available?: number;
  items_number_currently_in_storage: number;
  is_active: boolean;
  is_deleted?: boolean | null;

  /** Joined tags */
  storage_item_tags?: Tag[];

  /** Convenience props from joins / service layer */
  location_name?: string;
  location_details?: {
    id: string;
    name: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;

  /** Helper for tag selector */
  tagIds?: string[];
}

/** Final row type — no `Json`, no deep-instantiation error
 * taken from the raw row from the database
 */
export type Item = Override<StorageItemRow, ItemAugmentedFields>;

/**
 * Row shape returned by GET /storage-items/ordered
 * (view_manage_storage_items).  This is *not* the same as StorageItem;
 * it contains flattened name/type strings and aggregated tag data.
 */
export type ManageItemViewRow = {
  /* ─ Flattened names for quick display / sorting ─ */
  fi_item_name: string;
  fi_item_type: string;
  en_item_name: string;
  en_item_type: string;

  /* ─ Full i18n payload ─ */
  translations: {
    en: ItemTranslation;
    fi: ItemTranslation;
    /** allow future locales without breaking the type */
    [locale: string]: ItemTranslation;
  };

  /* ─ Core item fields ─ */
  id: string;
  items_number_total: number;
  price: number;
  created_at: string; // ISO‑8601
  is_active: boolean;
  updated_at?: string | null;
  is_deleted?: boolean | null;

  /* ─ Location info ─ */
  location_id: string;
  location_name?: string;
  compartment_id: string | null;

  /* ─ Inventory fields to match Item interface ─ */
  items_number_available?: number;
  items_number_currently_in_storage: number;

  /* ─ Additional fields to match Item interface ─ */
  average_rating?: number;
  test_metadata: {
    version?: number;
    test_flag?: boolean;
    last_modified?: string;
    [k: string]: unknown;
  } | null;
  test_priority_score: number | null;

  /* ─ Location details ─ */
  location_details?: {
    id: string;
    name: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;

  /* ─ Tag arrays aggregated in the view ─ */
  tag_ids: string[];
  tag_translations: TagTranslation[];
  storage_item_tags?: Tag[];
  tagIds?: string[];
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
  item_pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
  itemCount: number;
}

type ItemCreatable = Omit<
  Item,
  | "id"
  | "created_at"
  | "updated_at"
  | "storage_item_tags"
  | "average_rating"
  | "items_number_available"
  | "items_number_currently_in_storage"
  | "is_deleted"
  | "test_metadata"
  | "test_priority_score"
>;

/** Data required to create a new item (sent to POST /items) */
export type CreateItemDto = Partial<ItemCreatable> & {
  /** always required */
  location_id: string;
  items_number_total: number;
  price: number;
  /** tag IDs selected in the form */
  tagIds?: string[];
  average_rating?: number | null; // not used anywhere yet
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
