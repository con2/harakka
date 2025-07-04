import { TagRow } from "../../tag/interfaces/tag.interface";

export interface StorageItem {
  id: string;
  location_id: string;
  compartment_id: string;
  items_number_total: number;
  items_number_currently_in_storage: number;
  items_number_available: number;
  price: number;
  is_active: boolean;
  translations: {
    fi: {
      item_type: string;
      item_name: string;
      item_description: string;
    };
    en: {
      item_type: string;
      item_name: string;
      item_description: string;
    };
  };
  average_rating?: number;
  created_at?: string;
  updated_at?: string;
  storage_item_tags?: TagRow[];

  location_details?: {
    id: string;
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    is_active: boolean;
  } | null;
}

// // separate DTO that includes tagIds
// export interface CreateStorageItemDto extends Partial<StorageItem> {
//   tagIds?: string[];
// }

export interface StorageItemWithJoin {
  id: string;
  location_id: string;
  compartment_id: string;
  items_number_total: number;
  items_number_currently_in_storage: number;
  items_number_available: number;
  price: number;
  is_active: boolean;
  translations: {
    fi: {
      item_type: string;
      item_name: string;
      item_description: string;
    };
    en: {
      item_type: string;
      item_name: string;
      item_description: string;
    };
  };
  average_rating?: number;
  created_at?: string;
  updated_at?: string;

  // Raw Supabase join result
  storage_item_tags?: {
    tag_id: string;
    tags: TagRow;
  }[];

  // Raw Supabase join result for location
  storage_locations?: {
    id: string;
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    is_active: boolean;
  };
}

export type ValidItemOrder =
  | "items_number_total"
  | "price"
  | "location_id"
  | "translations";
