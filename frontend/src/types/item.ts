import {
  BaseEntity,
  ErrorContext,
  Translatable,
  Tag,
  LocationDetails,
  TagTranslation,
} from "@/types";
import { Database } from "@common/database.types";

export type ItemRow = Database["public"]["Tables"]["storage_items"]["Row"];
export type ItemInsert =
  Database["public"]["Tables"]["storage_items"]["Insert"];
export type ItemUpdate =
  Database["public"]["Tables"]["storage_items"]["Update"];
export interface Item extends ItemRow {
  // Don't override database properties - let them come from ItemRow
  // Only add frontend-specific properties that aren't in the database
  tagIds?: string[]; // Frontend computed property
  storage_item_tags?: Tag[]; // Frontend populated property
}

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
export interface ManageItemViewRow {
  // Core item fields from ItemRow
  id: string;
  location_name: string | null;
  price: number | null;
  items_number_total: number | null;
  is_active: boolean | null;
  created_at: string | null;
  storage_item_tags: Tag[] | null;
  // Flattened, language‑specific name/type strings for quick sorting
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
