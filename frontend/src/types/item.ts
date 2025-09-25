import {
  CreateItemType,
  SelectedOrg,
  SelectedStorage,
} from "@common/items/form.types";
import { ErrorContext, StorageLocationRow, Tag, TagTranslation } from "@/types";
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

  /** Ratings */
  average_rating?: number; // make non-nullable for UI

  /** Inventory & status (always concrete in UI) */
  quantity?: number;
  available_quantity: number;
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
export type Item = Override<StorageItemRow, ItemAugmentedFields> & {
  location_details: StorageLocationRow;
  organization_id?: string;
  org_id?: string;
};

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
  quantity: number;
  created_at: string; // ISO‑8601
  is_active: boolean;
  updated_at?: string | null;
  is_deleted?: boolean | null;

  /* ─ Location info ─ */
  location_id: string;
  location_name?: string;
  compartment_id: string | null;

  /* ─ Inventory fields to match Item interface ─ */
  available_quantity: number;

  /* ─ Additional fields to match Item interface ─ */
  average_rating?: number;

  /* ─ Location details ─ */
  location_details?: {
    id: string;
    name: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  organization_id: string;

  /* ─ Tag arrays aggregated in the view ─ */
  tag_ids: string[];
  tag_translations: TagTranslation[];
  storage_item_tags?: Tag[];
  tagIds?: string[];

  /* ─ Category Names & details ─ */
  category_id: string | null;
  category_en_name: string | null;
  category_fi_name: string | null;
};
/**
 * Item state in Redux store
 */
export interface ItemState {
  items: Array<Item | ManageItemViewRow>;
  loading: boolean;
  error: string | null;
  selectedItem: Item | CreateItemType | null;
  errorContext: ErrorContext;
  deletableItems: Record<string, boolean>;
  item_pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
  itemCount: number;
  itemCreation: {
    org: SelectedOrg | null;
    location: SelectedStorage | null | undefined;
    items: CreateItemType[];
    errors: Record<string, string[]>;
  };
  isEditingItem: boolean;
}

type ItemCreatable = Omit<
  Item,
  | "id"
  | "created_at"
  | "updated_at"
  | "storage_item_tags"
  | "average_rating"
  | "available_quantity"
  | "is_deleted"
>;

/** Data required to create a new item (sent to POST /items) */
export type CreateItemDto = Partial<ItemCreatable> & {
  /** always required */
  location_id: string;
  quantity: number;
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
  | "quantity"
  | "is_active"
  | "created_at"
  | "updated_at";

export type BucketUploadResult = {
  paths: string[];
  urls: string[];
  full_paths: string[];
};
