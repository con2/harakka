import { BadRequestException, Injectable } from "@nestjs/common";
import {
  PostgrestMaybeSingleResponse,
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import {
  StorageItem,
  StorageItemWithJoin,
  ValidItemOrder,
} from "./interfaces/storage-item.interface";
import { Request } from "express";
import { SupabaseService } from "../supabase/supabase.service";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";
import { calculateAvailableQuantity } from "src/utils/booking.utils";
import { ApiResponse, ApiSingleResponse } from "@common/response.types"; // Import ApiSingleResponse for type safety
import { handleSupabaseError } from "@src/utils/handleError.utils";
import { TagService } from "../tag/tag.service";
import { AuthRequest } from "@src/middleware/interfaces/auth-request.interface";
import { ItemFormData } from "@common/items/form.types";
import {
  mapItemImages,
  mapOrgLinks,
  mapStorageItems,
  mapTagLinks,
} from "@src/utils/storage-items.utils";
import { ItemImagesService } from "../item-images/item-images.service";
import { UpdateItem } from "@common/items/storage-items.types";

@Injectable()
export class StorageItemsService {
  constructor(
    private readonly supabaseClient: SupabaseService, // Supabase client for database queries
    private readonly tagService: TagService,
    private readonly imageService: ItemImagesService,
  ) {}

  /**
   * Get all items within a range from storage_items.
   * @param page What page of items to return
   * @param limit How many rows to return
   * @param active Optional. Boolean. Whether to return active or inactive items. Omit this to get both inactive and active items.
   * @returns
   */
  async getAllItems(
    page: number,
    limit: number,
    active?: boolean,
  ): Promise<ApiResponse<StorageItem>> {
    const supabase = this.supabaseClient.getServiceClient();
    const { from, to } = getPaginationRange(page, limit);

    const query = supabase
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
      .eq("is_deleted", false);

    if (active) query.eq("is_active", true);

    const result = await query;
    if (result.error) handleSupabaseError(result.error);

    // Structure the result to include both tags and location data
    const mappedData = result.data.map(
      (item: StorageItemWithJoin): StorageItem => ({
        ...item,
        tags:
          item.storage_item_tags.map(
            (tagLink) => tagLink.tags, // Flatten out the tags object to just be the tag itself
          ) ?? [], // Fallback to empty array if no tags are available
        location_details: item.storage_locations || null,
      }),
    );

    const pagination_meta = getPaginationMeta(result.count, page, limit);

    return {
      ...result,
      data: mappedData,
      metadata: pagination_meta,
    };
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
        .single();

    if (error) handleSupabaseError(error);
    const { storage_item_tags, storage_locations, ...item } = data;
    // Flatten the tags to make them easier to work with
    return {
      ...item,
      tags: data?.storage_item_tags
        ? data.storage_item_tags.map((tagLink) => tagLink.tags) // Extract just the tag itself
        : [],
      location_details: data?.storage_locations || null,
    };
  }

  /**
   * Insert items with org data, image data, tags
   * @param req An authorized request
   * @param payload Can be either one item with an array of tagIds or an array of items of the same structure
   * @returns
   */
  async createItemsFromForm(
    req: AuthRequest,
    payload: ItemFormData,
  ): Promise<{ status: number; error: string | null }> {
    const supabase = req.supabase;
    const mappedItems = mapStorageItems(payload);
    const mappedImageData = mapItemImages(payload);
    const item_ids = mappedItems.map((i) => i.id);
    const orgId = payload.org.id;

    try {
      // Insert item data
      const { error }: PostgrestMaybeSingleResponse<StorageItem> =
        await supabase.from("storage_items").insert(mappedItems);
      if (error) {
        throw new Error(error.message);
      }

      // Insert org data
      const mappedOrg = mapOrgLinks(payload);
      const { error: orgError } = await supabase
        .from("organization_items")
        .insert(mappedOrg);
      if (orgError) {
        throw new Error(orgError.message);
      }

      // Insert item tags
      const mappedTags = mapTagLinks(payload);
      const tagResult = await this.tagService.assignTagsToBulk(req, mappedTags);
      if (tagResult) {
        throw new Error(tagResult.message);
      }

      // Insert item images
      const { error: imageError } = await supabase
        .from("storage_item_images")
        .insert(mappedImageData);
      if (imageError) {
        throw new Error(imageError.message);
      }

      return { status: 201, error: null };
    } catch (error) {
      console.log(error);
      // Rollback: Clean up any partially inserted data
      await Promise.allSettled([
        supabase.from("storage_item_images").delete().in("item_id", item_ids),
        supabase.from("storage_item_tags").delete().in("item_id", item_ids),
        supabase
          .from("organization_items")
          .delete()
          .in("item_id", item_ids)
          .eq("organization_id", orgId),
        supabase.from("storage_items").delete().in("id", item_ids),
      ]);

      return {
        status: error?.code ?? 500,
        error: error?.message ?? "An unexpected error occurred",
      };
    }
  }

  // 4 update an item
  async updateItem(
    req: AuthRequest,
    item_id: string,
    org_id: string,
    item: UpdateItem,
  ): Promise<StorageItem> {
    const supabase = req.supabase;
    console.log("Update item: ", item);
    // Extract properties that shouldn't be sent to the database
    const { tags, location_details, ...itemData } = item;

    // Check if item belongs to multiple orgs.
    // If yes, duplicate the item and update it.
    const { data, error: orgItemError } = await supabase
      .from("organization_items")
      .select("storage_item_id")
      .eq("storage_item_id", item_id);
    if (orgItemError) handleSupabaseError(orgItemError);
    if (data.length > 1) return this.copyItem(req, item_id, org_id, item);

    // Update the main item
    const {
      data: updatedItemData,
      error: updateError,
    }: PostgrestResponse<StorageItem> = await supabase
      .from("storage_items")
      .update(itemData)
      .eq("id", item_id)
      .select();

    if (updateError) {
      throw new Error(updateError.message);
    }

    const updatedItem = updatedItemData?.[0];
    if (!updatedItem)
      throw new BadRequestException(
        updateError || "Failed to update storage item",
      );

    // Update tag relationships
    if (tags) {
      if (tags.length > 0) {
        await this.tagService.assignTagsToItem(req, item_id, tags);
      }
    }

    return updatedItem;
  }

  /**
   * Delete an organizations item.
   * This method soft-deletes the item, then relies on a daily CRON job to remove completely inactive and * unreferenced items. (CRON JOB: 'delete_inactive_items')
   * @param req An Authorized request
   * @param item_id The ID of the item to soft-delete
   * @param org_id The organization ID which to soft-delete the item from
   * @returns
   */
  async deleteItem(
    req: AuthRequest,
    item_id: string,
    org_id: string,
  ): Promise<{ success: boolean; id: string }> {
    const supabase = req.supabase;
    if (!item_id) {
      throw new Error("No item ID provided for deletion");
    }

    try {
      // Get image paths
      const {
        data: images,
        error: imagesError,
      }: PostgrestResponse<{ id: string; storage_path: string }> =
        await supabase
          .from("storage_item_images")
          .select("id, storage_path")
          .eq("item_id", item_id);

      if (imagesError) {
        throw new Error(`Failed to get images: ${imagesError.message}`);
      }

      console.log("org id: ", org_id)
      console.log("item id: ", item_id)

      // Update the org_items data
      // Set is_deleted to true and is_active to false
      // This way it cannot be booked, and is scheduled to be deleted once
      // there are no future or ongoing bookings with the item (CRON JOB: 'delete_inactive_items')
      const { data, error: orgError } = await supabase
        .from("organization_items")
        .update({ is_deleted: true, is_active: false })
        .eq("storage_item_id", item_id)
        .eq("organization_id", org_id)
        .select();
        if (orgError) throw new Error(
          `Failed to update org items: ${orgError.message}`,
        );
        console.log("data: ", data);

      // Delete any found images
      if (images && images.length > 0) {
        const paths = images.map((i) => i.storage_path);
        await supabase.storage.from("item-images").remove(paths);

        // Then delete the image records
        const { error: deleteImagesError } = await supabase
          .from("storage_item_images")
          .delete()
          .eq("item_id", item_id);

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
        .eq("item_id", item_id);

      if (tagDeleteError) {
        throw new Error(
          `Failed to delete related tags: ${tagDeleteError.message}`,
        );
      }
    } catch (error) {
      console.error(error);
      return { success: false, id: item_id };
    }

    return { success: true, id: item_id };
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

  /**
   * See if an item is currently in any bookings.
   */
  async canDeleteItem(
    req: AuthRequest,
    id: string,
    confirm?: string,
  ): Promise<{ success: boolean; reason?: string; id: string }> {
    const supabase = req.supabase;
    if (!id) {
      throw new Error("No item ID provided for deletion");
    }
    const CURRENT_DATE = new Date();

    // Check if item exists in any bookings
    const { data, error } = await supabase
      .from("booking_items")
      .select("id")
      .eq("item_id", id)
      .limit(1)
      .gt("end_date", CURRENT_DATE);

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
    availability_min?: number,
    availability_max?: number,
    from_date?: string,
    to_date?: string,
  ) {
    const supabase = this.supabaseClient.getAnonClient();
    const { from, to } = getPaginationRange(page, limit);

    const query = supabase
      .from("view_manage_storage_items")
      .select("*", { count: "exact" })
      .eq("is_deleted", false)
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

    if (from_date) query.gte("created_at", from_date);
    if (to_date) query.lt("created_at", to_date);
    // Availability range filter (items currently in storage)
    if (availability_min !== undefined)
      query.gte("items_number_currently_in_storage", availability_min);

    if (availability_max !== undefined)
      query.lte("items_number_currently_in_storage", availability_max);

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
  async getItemCount(
    supabase: SupabaseClient,
  ): Promise<ApiSingleResponse<number>> {
    const result: PostgrestResponse<undefined> = await supabase
      .from("storage_items")
      .select(undefined, { count: "exact" });

    if (result.error) handleSupabaseError(result.error);

    return {
      ...result,
      data: result.count ?? 0,
    };
  }

  /**
   * Copy an item from one organization to another.
   * Creates a new record with copied images, tags, and updated org references.
   */
  async copyItem(
    req: AuthRequest,
    item_id: string,
    org_id: string,
    newItem: UpdateItem,
  ): Promise<StorageItem> {
    const supabase = req.supabase;
    const NEW_ITEM_ID = crypto.randomUUID();

    try {
      const itemData = await this.createItem(supabase, NEW_ITEM_ID, newItem);
      await this.imageService.copyImages(supabase, item_id, NEW_ITEM_ID);
      await this.updateOrgReferences(supabase, org_id, item_id, NEW_ITEM_ID);

      if (newItem.tags?.length) {
        await this.tagService.assignTagsToItem(req, NEW_ITEM_ID, newItem.tags);
      }

      return itemData;
    } catch (error) {
      console.error(`Failed to copy item ${item_id} for org ${org_id}:`, error);
      await this.rollbackCopy(req.supabase, NEW_ITEM_ID, org_id);
      throw error;
    }
  }

  /** Create a new storage item record */
  private async createItem(
    supabase: SupabaseClient,
    newId: string,
    newItem: UpdateItem,
  ) {
    const { tags, location_details, ...rest } = newItem;
    const { data, error } = await supabase
      .from("storage_items")
      .insert({ ...rest, id: newId, location_id: location_details.id })
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data as StorageItem;
  }

  /** Update the org-item reference to the new item */
  private async updateOrgReferences(
    supabase: SupabaseClient,
    orgId: string,
    oldItemId: string,
    newItemId: string,
  ) {
    const { error } = await supabase
      .from("organization_items")
      .update({ storage_item_id: newItemId })
      .eq("storage_item_id", oldItemId)
      .eq("organization_id", orgId);

    if (error) handleSupabaseError(error);
  }

  /** Rollback changes if something fails */
  private async rollbackCopy(
    supabase: SupabaseClient,
    newItemId: string,
    orgId: string,
  ) {
    // Get all image paths for cleanup
    const { data: imgData } = await supabase
      .from("storage_item_images")
      .select("storage_path")
      .eq("item_id", newItemId);

    const imgPaths = (imgData ?? []).map((img) => img.storage_path);

    await Promise.allSettled([
      supabase.from("storage_item_images").delete().eq("item_id", newItemId),
      supabase.storage.from("item-images").remove(imgPaths),
      supabase.from("storage_item_tags").delete().eq("item_id", newItemId),
      supabase
        .from("organization_items")
        .delete()
        .eq("storage_item_id", newItemId)
        .eq("organization_id", orgId),
      supabase.from("storage_items").delete().eq("id", newItemId),
    ]);
  }
}
