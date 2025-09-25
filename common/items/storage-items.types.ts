import { Database } from "@common/database.types";

export type StorageItemRow =
  Database["public"]["Tables"]["storage_items"]["Row"];
export type StorageItemInsert =
  Database["public"]["Tables"]["storage_items"]["Insert"];
export type LocationRow =
  Database["public"]["Tables"]["storage_locations"]["Row"];

export type TagRow = Database["public"]["Tables"]["tags"]["Row"];
export type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];
export type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];

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

type Image = {
            id: string,
          url: string,
            full_path: string,
            path: string,
            metadata: {
              image_type: string,
              display_order: number,
              alt_text: string,
              is_active: boolean,
            },
}

export type UpdateItem = StorageItemInsert & {
  tags: string[];
  location_details: LocationRow;
  images: {
    main: Image | null,
    details: Image[]
  }
};

export type StorageItem = StorageItemRow & {
  /** Tags flattened from the join table */
  tags: TagRow[];
  /** Convenience copy of the joined location row */
  location_details: LocationRow | null;
};
export type UpdateResponse = {
  success: boolean;
  item: StorageItem & { location_details: LocationRow };
};
