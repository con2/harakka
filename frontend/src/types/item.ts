import { BaseEntity, ErrorContext, Translatable } from "./common";
import { Tag } from "./tag";

/**
 * Item translations content
 */
export interface ItemTranslation {
  item_type: string;
  item_name: string;
  item_description: string;
}

export interface Item extends BaseEntity, Translatable<ItemTranslation> {
  location_id: string;
  compartment_id: string;
  items_number_total: number;
  items_number_available: number;
  price: number;
  is_active: boolean;
  average_rating?: number;
  tagIds?: string[];
  storage_item_tags?: Tag[];
}

/**
 * Item state in Redux store
 */
export interface ItemState {
  items: Item[];
  loading: boolean;
  error: string | null;
  selectedItem: Item | null;
  errorContext: ErrorContext;
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
