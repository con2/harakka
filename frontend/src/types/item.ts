import {
  ErrorContext,
  Tag,
  LocationDetails,
  Translatable,
  BaseEntity,
} from "@/types";
import { TablesInsert, TablesUpdate } from "./supabase.types";
import { Database } from "./supabase.types";

export interface ItemTranslation {
  item_type: string;
  item_name: string;
  item_description: string;
}

// ── raw Supabase row ────────────────────────────────────────────────────────────
type StorageItemRow = Database["public"]["Tables"]["storage_items"]["Row"];

// ── UI-only helpers ────────────────────────────────────────────────────────────
interface ItemHelpers {
  tagIds?: string[];
  storage_item_tags?: Tag[];
  location_details?: LocationDetails | null;
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
  items: Item[];
  loading: boolean;
  error: string | null;
  selectedItem: Item | null;
  errorContext: ErrorContext;
  deletableItems: Record<string, boolean>;
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
