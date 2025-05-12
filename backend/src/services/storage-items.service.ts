import { Injectable } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import {
  StorageItem,
  StorageItemWithJoin,
} from "src/interfaces/storage-item.interface";
import { S3Service } from "./s3-supabase.service";
// this is used by the controller

@Injectable()
export class StorageItemsService {
  // handles Database queries
  private supabase: SupabaseClient;

  constructor(
    private supabaseService: SupabaseService,
    private s3Service: S3Service, // handles S3 bucket queries
  ) {
    // For read operations, anon client respects RLS
    // For write operations that need admin access, use service client
    this.supabase = supabaseService.getServiceClient(); // takes the service key to establish connection to the database for handling CRUD
  }

  async getAllItems(): Promise<StorageItem[]> {
    const supabase = this.supabaseService.getServiceClient(); // For reading data, bypasses RLS if is_admin() returns false, and tags will be empty

    // Updated query to join storage_item_tags with tags table
    const { data, error }: PostgrestResponse<StorageItemWithJoin> =
      await supabase.from("storage_items").select(`
        *,
        storage_item_tags (
          tag_id,
          tags (
            id,
            translations
          )
        ),
        storage_locations (
          id,
          name, 
          description,
          address,
          latitude,
          longitude,
          is_active
        )
      `); // Explicitly select tags and their translations by joining the tags table

    if (error) {
      throw new Error(error.message);
    }

    // Structure the result to include both tags and location data
    return data.map((item) => ({
      ...item,
      storage_item_tags:
        item.storage_item_tags?.map(
          (tagLink) => tagLink.tags, // Flatten out the tags object to just be the tag itself
        ) ?? [], // Fallback to empty array if no tags are available
      location_details: item.storage_locations || null,
    }));
  }

  async getItemById(id: string): Promise<StorageItem | null> {
    const supabase = this.supabaseService.getAnonClient();

    // Query to select item along with its tags
    const { data, error }: PostgrestSingleResponse<StorageItemWithJoin> =
      await supabase
        .from("storage_items")
        .select(
          `
        *,
        storage_item_tags (
          tag_id,
          tags (
            id,
            translations
          )
        ),
        storage_locations (
          id,
          name, 
          description,
          address,
          latitude,
          longitude,
          is_active
        )
      `,
        ) // Join storage_item_tags and tags table to get full tag data
        .eq("id", id)
        .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }

    // Flatten the tags to make them easier to work with
    return {
      ...data,
      storage_item_tags: data?.storage_item_tags
        ? data.storage_item_tags.map((tagLink) => tagLink.tags) // Extract just the tag itself
        : [],
      location_details: data?.storage_locations || null,
    };
  }

  async createItem(item: Partial<StorageItem> & { tagIds?: string[] }) {
    // Extract tagIds from the item object
    // and keep the rest of the item data in storageItemData
    const { tagIds, ...storageItemData } = item;
    // Insert the item into the storage_items table
    const { data: insertedItems, error } = await this.supabase
      .from("storage_items")
      .insert(storageItemData)
      .select();
    if (error) throw new Error(error.message);

    const insertedItem = insertedItems?.[0];
    if (!insertedItem) throw new Error("Failed to insert storage item");
    // If tagIds are provided, insert them into the storage_item_tags table
    if (tagIds && tagIds.length > 0) {
      const tagLinks = tagIds.map((tagId) => ({
        item_id: insertedItem.id,
        tag_id: tagId,
      }));
      // Insert the tag links into the storage_item_tags table
      const { error: tagError } = await this.supabase
        .from("storage_item_tags")
        .insert(tagLinks);

      if (tagError) throw new Error(tagError.message);
    }

    return insertedItem;
  }

  async updateItem(
    id: string,
    item: Partial<StorageItem> & { tagIds?: string[] },
  ): Promise<StorageItem> {
    // Extract properties that shouldn't be sent to the database
    const { tagIds, location_details, storage_item_tags, ...itemData } = item;

    console.log("Updating item with data:", JSON.stringify(itemData, null, 2));

    // Update the main item
    const { data: updatedItemData, error: updateError } = await this.supabase
      .from("storage_items")
      .update(itemData)
      .eq("id", id)
      .select();

    if (updateError) {
      throw new Error(updateError.message);
    }

    const updatedItem = updatedItemData?.[0];
    if (!updatedItem) throw new Error("Failed to update item");

    // Update tag relationships
    if (tagIds) {
      // Remove all old tags
      await this.supabase.from("storage_item_tags").delete().eq("item_id", id);

      // Insert new tag relationships
      if (tagIds.length > 0) {
        const tagLinks = tagIds.map((tagId) => ({
          item_id: id,
          tag_id: tagId,
        }));
        const { error: tagError } = await this.supabase
          .from("storage_item_tags")
          .insert(tagLinks);
        if (tagError) throw new Error(tagError.message);
      }
    }

    return updatedItem;
  }

  async deleteItem(id: string): Promise<{ success: boolean; id: string }> {
    if (!id) {
      throw new Error("No item ID provided for deletion");
    }

    // Safety check: only allow deletion if confirmed
    const check = await this.canDeleteItem(id, "yes");
    if (!check.success) {
      throw new Error(
        check.reason || "Item cannot be deleted due to unknown restrictions",
      );
    }

    // Step 1: Delete images associated with the item
    const { data: images, error: imagesError } = await this.supabase
      .from("storage_item_images")
      .select("id, storage_path")
      .eq("item_id", id);

    if (imagesError) {
      throw new Error(`Failed to get images: ${imagesError.message}`);
    }

    // Delete any found images
    if (images && images.length > 0) {
      // First delete image files from S3 storage
      for (const image of images) {
        if (image.storage_path) {
          try {
            await this.s3Service.deleteFile(image.storage_path);
          } catch (error) {
            // Log but continue - we still want to delete the database record even if file deletion fails
            console.error(
              `Failed to delete S3 file for image ${image.id}: ${error.message}`,
            );
          }
        }
      }

      // Then delete the image records
      const { error: deleteImagesError } = await this.supabase
        .from("storage_item_images")
        .delete()
        .eq("item_id", id);

      if (deleteImagesError) {
        throw new Error(
          `Failed to delete item images: ${deleteImagesError.message}`,
        );
      }
    }

    // Step 2: Delete related tags from the join table
    const { error: tagDeleteError } = await this.supabase
      .from("storage_item_tags")
      .delete()
      .eq("item_id", id);

    if (tagDeleteError) {
      throw new Error(
        `Failed to delete related tags: ${tagDeleteError.message}`,
      );
    }

    // Step 3: Delete the item itself
    const { error: itemDeleteError } = await this.supabase
      .from("storage_items")
      .delete()
      .eq("id", id);

    if (itemDeleteError) {
      throw new Error(`Failed to delete item: ${itemDeleteError.message}`);
    }

    // Return success response with the deleted item ID
    return { success: true, id };
  }

  // TODO: needs to be fixed and updated
  async getItemsByTag(tagId: string) {
    const { data, error } = await this.supabase
      .from("storage_item_tags")
      .select("item_id, items(*)") // Select foreign table 'items' if it's a relation
      .eq("tag_id", tagId);

    if (error) throw new Error(error.message);

    // The data will now have the related 'items' fetched in the same query
    return data.map((entry) => entry.items); // Extract items from the relation
  }

  //check if the item can be deleted (if it exists in some orders)
  async canDeleteItem(
    id: string,
    confirm?: string,
  ): Promise<{ success: boolean; reason?: string; id: string }> {
    if (!id) {
      throw new Error("No item ID provided for deletion");
    }

    // Check if item exists in any orders
    const { data, error } = await this.supabase
      .from("order_items")
      .select("id")
      .eq("item_id", id)
      .limit(1);

    if (error) {
      throw new Error(
        `Error checking if item can be deleted: ${error.message}`,
      );
    }

    const hasBookings = data?.length > 0;

    if (hasBookings && confirm !== "yes") {
      throw new Error(
        "This item is linked to existing bookings. Pass confirm='yes' to delete anyway.",
      );
    }

    return {
      success: !hasBookings,
      reason: hasBookings
        ? "Item cannot be deleted because it has existing bookings"
        : undefined,
      id,
    };
  }
}
