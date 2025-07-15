import {
  BaseEntity,
  ErrorContext,
  Translatable,
  Tag,
  LocationDetails,
  TagTranslation,
} from "@/types";
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

/**
 * Main `Item` type used throughout the app.
 *
 * We merge the raw database row with our shared base/translation helpers
 * and append some frontend‑only convenience properties.
 */
export type Item = StorageItemRow &
  BaseEntity &
  Translatable<ItemTranslation> & {
    /** Average rating calculated server‑side from reviews */
    average_rating?: number;

    /** UUIDs of tags attached to this item */
    tagIds?: string[];

    /** Fully hydrated tag entities when fetched via joins */
    storage_item_tags?: Tag[];

    /** Convenience details from the related location */
    location_details?: LocationDetails | null;

    /** Flattened location name for quick lists & tables */
    location_name?: string;
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
 * Data required to create a new item
 */
export type CreateItemDto = Omit<
  Item,
  "id" | "created_at" | "updated_at" | "storage_item_tags"
> & {
  // Exclude 'id', 'created_at', 'updated_at' and 'storage_item_tags' from the create type
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
