import { Injectable } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import {
  CreateStorageItemDto,
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
        )
      `); // Explicitly select tags and their translations by joining the tags table

    if (error) {
      throw new Error(error.message);
    }

    // Structure the result to match your backend interface
    return data.map((item) => ({
      ...item,
      storage_item_tags:
        item.storage_item_tags?.map(
          (tagLink) => tagLink.tags, // Flatten out the tags object to just be the tag itself
        ) ?? [], // Fallback to empty array if no tags are available
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
    };
  }

  //previously createItem commented out
  // async createItem(item: Partial<StorageItem>): Promise<StorageItem[]> {
  //   const supabase = this.supabaseService.getServiceClient(); // Write operation
  //   const { data, error }: PostgrestResponse<StorageItem> = await supabase
  //     .from('storage_items')
  //     .insert([item])
  //     .select();
  //   if (error) throw new Error(error.message);
  //   return data || [];
  // }

  async createItem(createStorageItemDto: any) {
    // extract tagIds and remove them from the actual insert payload
    const { tagIds, ...rest } = createStorageItemDto;
    // clone and strip tagIds at runtime
    const storageItemData = JSON.parse(JSON.stringify(rest));
    delete storageItemData.tagIds;
    // 1. Insert item into storage_items
    const { data: insertedItems, error: itemInsertError } = await this.supabase
      .from("storage_items")
      .insert([storageItemData]) // No tagIds here
      .select();

    if (itemInsertError) {
      throw new Error(itemInsertError.message);
    }
    const insertedItem = insertedItems?.[0];
    if (!insertedItem) {
      throw new Error("Failed to insert storage item.");
    }
    // 2. Insert related tags into storage_item_tags
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      const itemTags = tagIds.map((tagId) => ({
        item_id: insertedItem.id,
        tag_id: tagId,
      }));
      const { error: tagInsertError } = await this.supabase
        .from("storage_item_tags")
        .insert(itemTags);
      if (tagInsertError) {
        throw new Error(tagInsertError.message);
      }
    }
    return insertedItem;
  }

  // async updateItem(
  //   id: string,
  //   item: Partial<StorageItem>,
  // ): Promise<StorageItem[]> {
  //   const supabase = this.supabaseService.getServiceClient(); // Write operation
  //   const { data, error }: PostgrestResponse<StorageItem> = await supabase
  //     .from('storage_items')
  //     .update(item)
  //     .eq('id', id)
  //     .select();
  //   if (error) throw new Error(error.message);
  //   return data || [];
  // }

  async updateItem(
    id: string,
    item: Partial<StorageItem> & { tagIds?: string[] },
  ): Promise<StorageItem> {
    const { tagIds, ...itemData } = item;

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

  // async deleteItem(id: string): Promise<StorageItem[]> {
  //   const supabase = this.supabaseService.getServiceClient();
  //   const { data, error }: PostgrestResponse<StorageItem> = await supabase
  //     .from('storage_items')
  //     .delete()
  //     .eq('id', id)
  //     .select(); // Add this to return deleted data
  //   if (error) throw new Error(error.message);
  //   return data || [];
  // }

  async deleteItem(id: string): Promise<{ success: boolean; id: string }> {
    if (!id) {
      throw new Error("No item ID provided for deletion");
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
}
