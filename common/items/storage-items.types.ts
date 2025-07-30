import { Database } from "@common/database.types";

export type StorageItemRow =
  Database["public"]["Tables"]["storage_items"]["Row"];


export type CreateItemPayload = StorageItemRow & {
  tagIds?: string[];
  org_id: string;
  storage_location_id: string;
};

/*
 * InsertItem:
 * Does not require tags or org data attached with payload
 */
export type InsertItem = Omit<
  CreateItemPayload,
  "org_id" | "storage_location_id" | "tagIds"
>;

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
