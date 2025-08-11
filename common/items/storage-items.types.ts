import { Database } from "@common/database.types";

export type StorageItemRow =
  Database["public"]["Tables"]["storage_items"]["Row"];
export type StorageItemInsert =
  Database["public"]["Tables"]["storage_items"]["Insert"];
export type LocationRow =
  Database["public"]["Tables"]["storage_locations"]["Row"];

/**
 * TagLink:
 * Extract the tags from the payload
 */
export type TagLink = { item_id: string; tag_id: string; created_at: string };

/**
 * OrgItem:
 * The required org data.
 */
export type OrgItem = {
  storage_item_id: string;
  organization_id: string;
  storage_location_id: string;
  owned_quantity: number;
  is_active: boolean;
};

export type UpdateItem = StorageItemInsert & {
  tags: string[];
  location_details: LocationRow;
};