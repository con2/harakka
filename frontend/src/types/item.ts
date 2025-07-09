import {
  ErrorContext,
  Tag,
  LocationDetails,
  Translatable,
  BaseEntity,
  TagTranslation,
} from "@/types";
import { TablesInsert, TablesUpdate } from "./supabase.types";
import { Database } from "./supabase.types";

export interface ItemTranslation {
  item_type: string;
  item_name: string;
  item_description: string;
}

export interface Item extends BaseEntity, Translatable<ItemTranslation> {
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

/**
 * Full item shape used in the front-end:
 *   • every DB column except the untyped `translations`
 *   • the *typed* translations object expected by <Translatable>
 *   • BaseEntity fields + Translatable mix-in
 *   • extra UI conveniences (tagIds, etc.)
 */
export type Item = (Omit<StorageItemRow, "translations"> & {
  translations: {
    fi: ItemTranslation;
    en: ItemTranslation;
  } | null;
}) &
  ItemHelpers &
  BaseEntity &
  Translatable<ItemTranslation>;

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
 * Data required to create a new item
 */
export type CreateItemDto = Omit<
  TablesInsert<"storage_items">,
  "translations"
> & {
  translations: {
    fi: ItemTranslation;
    en: ItemTranslation;
  };
  tagIds?: string[];
};

/**
 * Data for updating an existing item
 */
export type UpdateItemDto = Omit<
  TablesUpdate<"storage_items">,
  "translations"
> & {
  translations?: {
    fi?: ItemTranslation;
    en?: ItemTranslation;
  };
  tagIds?: string[];
};

/**
 * Type used for `/admin/items`
 * Gets the basic, necessary data plus some pre‑flattened translations.
 */
export interface ManageItemViewRow extends Item {
  /* Flattened, language‑specific name/type strings for quick sorting */
  fi_item_name: string;
  fi_item_type: string;

  en_item_name: string;
  en_item_type: string;

  /** Tag IDs linked to this item */
  tags: string[];

  /** Localised tag translation object */
  tag_translations: TagTranslation;
}

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
