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

// export interface Item extends BaseEntity, Translatable<ItemTranslation> {
//   location_id: string;
//   compartment_id: string;
//   items_number_total: number;
//   items_number_currently_in_storage: number;
//   price: number;
//   is_active: boolean;
//   average_rating?: number;
//   tagIds?: string[];
//   storage_item_tags?: Tag[];
//   location_name?: string;
//   location_details?: {
//     name: string;
//     address: string;
//   };
// }

/** Overrides for JSON / joined columns so we avoid the recursive `Json` type */
interface ItemJsonOverrides {
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

/** Final row type — no `Json`, no deep-instantiation error */
export type Item = Override<StorageItemRow, ItemJsonOverrides>;

// export type Item = {
//   id: string;
//   /* ─ Location & compartment ─ */
//   location_id: string;
//   compartment_id?: string | null;

//   /* ─ Inventory & pricing ─ */
//   items_number_total: number;
//   items_number_currently_in_storage: number;
//   price: number;
//   average_rating?: number;

//   /* ─ Status & timestamps ─ */
//   is_active: boolean;
//   is_deleted: boolean;
//   created_at: string; // ISO-8601 string

//   /* ─ i18n text fields ─ */
//   translations: {
//     en: {
//       item_name: string;
//       item_type: string;
//       item_description: string;
//     };
//     fi: {
//       item_name: string;
//       item_type: string;
//       item_description: string;
//     };
//     /** allow future locales without breaking the type */
//     [locale: string]: unknown;
//   };

//   /* ─ Test / metadata ─ */
//   test_priority_score?: number;
//   test_metadata?: {
//     version: number;
//     test_flag: boolean;
//     last_modified: string; // ISO-8601
//     [key: string]: unknown;
//   };

//   /* ─ Joined relations ─ */
//   storage_item_tags: Tag[];
//   // {
//   //   tag_id: string;
//   //   translations?: Record<string, unknown>;
//   // }[];
//   tagIds?: string[];

//   storage_locations?: {
//     id: string;
//     name: string;
//     address: string;
//     latitude: number;
//     longitude: number;
//     is_active: boolean;
//     description?: string;
//   } | null;

//   /** Convenience copy added in the service layer */
//   location_details?: Item["storage_locations"];
// };

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
  /** optionally send a pre‑calculated rating */
  average_rating?: number | null;
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
 * Type used for `/admin/items`
 * Gets the basic, necessary data plus some pre‑flattened translations.
 */
// export interface ManageItemViewRow extends Item {
//   /* Flattened, language‑specific name/type strings for quick sorting */
//   fi_item_name: string;
//   fi_item_type: string;

//   en_item_name: string;
//   en_item_type: string;

//   /** Tag IDs linked to this item */
//   tags: string[];

//   /** Localised tag translation object */
//   tag_translations: TagTranslation;
// }

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
