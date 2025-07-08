import { BadRequestException, Injectable } from "@nestjs/common";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import {
  StorageItem,
  StorageItemWithJoin,
  ValidItemOrder,
} from "./interfaces/storage-item.interface";
import { S3Service } from "../supabase/s3-supabase.service";
import { Request } from "express";
import { SupabaseService } from "../supabase/supabase.service";
import { TablesUpdate } from "src/types/supabase.types";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";
import { calculateAvailableQuantity } from "src/utils/booking.utils";
import { ApiSingleResponse } from "src/types/response.types";
// this is used by the controller

@Injectable()
export class StorageItemsService {
  constructor(
    private s3Service: S3Service, // handles S3 bucket queries
    private readonly supabaseClient: SupabaseService, // Supabase client for database queries
  ) {}

  async getAllItems(page: number, limit: number): Promise<StorageItem[]> {
    const supabase = this.supabaseClient.getServiceClient();
    const { from, to } = getPaginationRange(page, limit);

    // Updated query to join storage_item_tags with tags table
    const { data, error }: PostgrestResponse<StorageItemWithJoin> =
      (await supabase
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
          { count: "exact" },
        )
        .range(from, to)
        .eq("is_deleted", false)) as PostgrestSingleResponse<
        StorageItemWithJoin[]
      >; // Explicitly select tags and their translations by joining the tags table - show only undeleted items

    if (error) {
      throw new Error(error.message);
    }

    // Structure the result to include both tags and location data
    return data.map(
      (item: StorageItemWithJoin): StorageItem => ({
        ...item,
        storage_item_tags:
          item.storage_item_tags?.map(
            (tagLink) => tagLink.tags, // Flatten out the tags object to just be the tag itself
          ) ?? [], // Fallback to empty array if no tags are available
        location_details: item.storage_locations || null,
      }),
    );
  }

  // 2. get one item
  async getItemById(id: string): Promise<StorageItem | null> {
    const supabase = this.supabaseClient.getServiceClient();

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
        .eq("is_deleted", false) // Only get undeleted items
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

  // 3. create Item
  async createItem(
    req: Request,
    item: Partial<TablesUpdate<"storage_items">> & { tagIds?: string[] },
  ): Promise<StorageItem> {
    const supabase = req["supabase"] as SupabaseClient;

    // Extract tagIds from the item object
    // and keep the rest of the item data in storageItemData
    const { tagIds, ...storageItemData } = item;
    // Insert the item into the storage_items table
    const { data: insertedItems, error }: PostgrestResponse<StorageItem> =
      await supabase.from("storage_items").insert(storageItemData).select();
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
      const { error: tagError } = await supabase
        .from("storage_item_tags")
        .insert(tagLinks);

      if (tagError) throw new Error(tagError.message);
    }

    return insertedItem;
  }

  // 4 update an item
  async updateItem(
    req: Request,
    id: string,
    item: Partial<TablesUpdate<"storage_items">> & { tagIds?: string[] },
  ): Promise<StorageItem> {
    const supabase = req["supabase"] as SupabaseClient;
    // Extract properties that shouldn't be sent to the database
    const { tagIds, ...itemData } = item;

    console.log("Updating item with data:", JSON.stringify(itemData, null, 2));

    // Update the main item
    const {
      data: updatedItemData,
      error: updateError,
    }: PostgrestResponse<StorageItem> = await supabase
      .from("storage_items")
      .update(itemData)
      .eq("id", id)
      .select();

    console.log(updateError);
    if (updateError) {
      throw new Error(updateError.message);
    }

    const updatedItem = updatedItemData?.[0];
    if (!updatedItem)
      throw new BadRequestException(
        updateError || "Failed to update storage item",
      );

    // Update tag relationships
    if (tagIds) {
      // Remove all old tags
      await supabase.from("storage_item_tags").delete().eq("item_id", id);

      // Insert new tag relationships
      if (tagIds.length > 0) {
        const tagLinks = tagIds.map((tagId) => ({
          item_id: id,
          tag_id: tagId,
        }));
        const { error: tagError } = await supabase
          .from("storage_item_tags")
          .insert(tagLinks);
        if (tagError) throw new Error(tagError.message);
      }
    }

    return updatedItem;
  }

  // 5. delete an item
  async deleteItem(
    req: Request,
    id: string,
    confirm?: string,
  ): Promise<{ success: boolean; id: string }> {
    const supabase = req["supabase"] as SupabaseClient;
    if (!id) {
      throw new Error("No item ID provided for deletion");
    }

    // Safety check: only allow deletion if confirmed
    const check = await this.canDeleteItem(req, id, confirm);
    if (!check.success) {
      throw new Error(
        check.reason || "Item cannot be deleted due to unknown restrictions",
      );
    }

    // Step 1: Delete images associated with the item
    const { data: images, error: imagesError } = await supabase
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
          } catch (error: unknown) {
            // Log but continue - we still want to delete the database record even if file deletion fails
            console.error(
              `Failed to delete S3 file for image ${image.id}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }
      }

      // Then delete the image records
      const { error: deleteImagesError } = await supabase
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
    const { error: tagDeleteError } = await supabase
      .from("storage_item_tags")
      .delete()
      .eq("item_id", id);

    if (tagDeleteError) {
      throw new Error(
        `Failed to delete related tags: ${tagDeleteError.message}`,
      );
    }

    // Step 3: Delete the item itself - soft delete
    const { error: softDeleteError } = await supabase
      .from("storage_items")
      .update({ is_deleted: true })
      .eq("id", id);

    if (softDeleteError) {
      throw new Error(`Failed to soft-delete item: ${softDeleteError.message}`);
    }

    return { success: true, id };
  }

  // 6. get Items by tag
  // TODO: needs to be fixed and updated
  async getItemsByTag(req: Request, tagId: string) {
    const supabase = req["supabase"] as SupabaseClient;
    const {
      data,
      error,
    }: PostgrestResponse<{ item_id: string; items: StorageItem[] }> =
      await supabase
        .from("storage_item_tags")
        .select("item_id, items(*)") // Select foreign table 'items' if it's a relation
        .eq("tag_id", tagId);

    if (error) throw new Error(error.message);

    // The data will now have the related 'items' fetched in the same query
    return data.map((entry) => entry.items); // Extract items from the relation
  }

  // 7. soft-delete item (to keep the data just in case)
  async softDeleteItem(
    req: Request,
    id: string,
  ): Promise<{ success: boolean; id: string }> {
    const supabase = req["supabase"] as SupabaseClient;
    const { error } = await supabase
      .from("storage_items")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) {
      throw new Error(`Soft delete failed: ${error.message}`);
    }

    return { success: true, id };
  }

  // 8. check if the item can be deleted (if it exists in some orders)
  async canDeleteItem(
    req: Request,
    id: string,
    confirm?: string,
  ): Promise<{ success: boolean; reason?: string; id: string }> {
    const supabase = req["supabase"] as SupabaseClient;
    if (!id) {
      throw new Error("No item ID provided for deletion");
    }

    // Check if item exists in any orders
    const { data, error } = await supabase
      .from("booking_items")
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
      return {
        success: false,
        reason:
          "This item is linked to existing bookings. Pass confirm='yes' to delete anyway.",
        id,
      };
    }

    return {
      success: true,
      id,
    };
  }

  /**
   * Get ordered and/or filtered items
   * @param page What page number is requested
   * @param limit How many rows to retrieve
   * @param ascending If to sort order smallest-largest (e.g a-z) or descending (z-a). Default true / ascending.
   * @param order_by What column to order the columns by. Default "created_at". See {Valid}
   * @param searchquery Optional. Filter items by a string. Currently supports search by item name, item type and location name
   * @param tags Optional. Filter by tag IDs
   * @param activity_filter Optional. Filter by active/inactive status
   * @returns Matching items
   */
  async getOrderedStorageItems(
    page: number,
    limit: number,
    ascending: boolean,
    order_by?: ValidItemOrder,
    searchquery?: string,
    tags?: string,
    activity_filter?: "active" | "inactive",
    location_filter?: string,
    category?: string,
  ) {
    const supabase = this.supabaseClient.getAnonClient();
    const { from, to } = getPaginationRange(page, limit);

    const query = supabase
      .from("view_manage_storage_items")
      .select("*", { count: "exact" })
      .range(from, to);

    if (order_by)
      query.order(order_by ?? "created_at", {
        ascending: ascending,
      });

    if (searchquery) {
      query.or(
        `fi_item_name.ilike.%${searchquery}%,` +
          `fi_item_type.ilike.%${searchquery}%,` +
          `en_item_name.ilike.%${searchquery}%,` +
          `en_item_type.ilike.%${searchquery}%,` +
          `location_name.ilike.%${searchquery}%`,
      );
    }

    if (activity_filter) query.eq("is_active", activity_filter);
    if (tags) query.overlaps("tag_ids", tags.split(","));
    if (location_filter)
      query.overlaps("location_id", location_filter.split(","));

    if (category) {
      const categories = category.split(",");
      query.in("en_item_type", categories);
    }

    const result = await query;
    const { error, count } = result;

    if (error) {
      console.log(error);
      throw new Error("Failed to get matching items");
    }

    const pagination_meta = getPaginationMeta(count, page, limit);
    return {
      ...result,
      metadata: pagination_meta,
    };
  }

  // 9. check availability of item by date range - calculateAvailableQuantity
  async checkAvailability(
    itemId: string,
    startDate: string,
    endDate: string,
    supabase: SupabaseClient,
  ): Promise<
    ApiSingleResponse<{
      item_id: string;
      alreadyBookedQuantity: number;
      availableQuantity: number;
    }>
  > {
    try {
      const { item_id, availableQuantity, alreadyBookedQuantity } =
        await calculateAvailableQuantity(supabase, itemId, startDate, endDate);

      return {
        data: {
          item_id,
          alreadyBookedQuantity,
          availableQuantity,
        },
        error: null,
        status: 200,
        statusText: "OK",
        count: null,
      };
    } catch (err) {
      if (err instanceof Error) {
        return {
          data: null,
          error: {
            message: err.message,
            code: "availability-check_error",
            details: "",
            hint: "",
            name: "availability-check_error",
          },
          status: 400,
          statusText: "Error",
          count: null,
        };
      }

      // Fallback
      return {
        data: null,
        error: {
          message: "Unknown error",
          code: "availability-check_error",
          details: "",
          hint: "",
          name: "availability-check_error",
        },
        status: 400,
        statusText: "Error",
        count: null,
      };
    }
  }
}
