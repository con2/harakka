import {
  CreateItemType,
  SelectedOrg,
  SelectedStorage,
} from "@common/items/form.types";
import {
  BaseEntity,
  ErrorContext,
  Translatable,
  Tag,
  TagTranslation,
} from "@/types";

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
  items_number_currently_in_storage: number;
  price: number;
  is_active: boolean;
  average_rating?: number;
  tagIds?: string[];
  storage_item_tags?: Tag[];
  location_name?: string;
  location_details?: {
    name: string;
    address: string;
  };
}

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
  };
  isEditingItem: boolean;
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

export type BucketUploadResult = {
  paths: string[];
  urls: string[];
  full_paths: string[];
};
