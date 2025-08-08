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
  UpdateItem,
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
import Papa from "papaparse";
import { Item, ItemSchema } from "./schema/item-schema";
import { ItemImageRow } from "../item-images/types/item-image.types";

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
        storage_item_tags:
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

    // Flatten the tags to make them easier to work with
    return {
      ...data,
      storage_item_tags: data?.storage_item_tags
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
  async createItems(
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
    const supabase = req["supabase"] as SupabaseClient;

    // Extract properties that shouldn't be sent to the database
    const { tagIds, location_details, ...itemData } = item;

    // Check if item belongs to multiple orgs.
    // If yes, duplicate the item and update it.
    const { data, error: orgItemError } = await supabase
      .from("organization_items")
      .select("storage_item_id")
      .eq("storage_item_id", item_id);
    if (orgItemError) handleSupabaseError(orgItemError);
    if (data.length > 1) return this.copyItem(req, item_id, item);

    // Update the main item
    const {
      data: updatedItemData,
      error: updateError,
    }: PostgrestResponse<StorageItem> = await supabase
      .from("storage_items")
      .update({ ...itemData, location_id: location_details.id })
      .eq("storage_item_id", item_id)
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
    if (tagIds) {
      if (tagIds.length > 0) {
        const tagLinks = tagIds.map((tagId) => ({
          item_id,
          tag_id: tagId,
        }));
        const { error: tagError } = await supabase
          .from("storage_item_tags")
          .upsert(tagLinks);
        if (tagError) throw new Error(tagError.message);
      }
    }

    return updatedItem;
  }

  /**
   * Delete an organizations item.
   * This method soft-deletes the item, then relies on a daily CRON job to remove completely inactive and *unreferenced items.
   * @param req An Authorized request
   * @param item_id The ID of the item to soft-delete
   * @param org_id The organization ID which to soft-delete the item from
   * @param confirm
   * @returns
   */
  async deleteItem(
    req: Request,
    item_id: string,
    org_id: string,
    confirm?: string,
  ): Promise<{ success: boolean; id: string }> {
    const supabase = req["supabase"] as SupabaseClient;
    if (!item_id) {
      throw new Error("No item ID provided for deletion");
    }

    // Safety check: only allow deletion if confirmed
    const check = await this.canDeleteItem(req, item_id, confirm);
    if (!check.success) {
      throw new Error(
        check.reason || "Item cannot be deleted due to unknown restrictions",
      );
    }

    // Get image paths
    const {
      data: images,
      error: imagesError,
    }: PostgrestResponse<{ id: string; storage_path: string }> = await supabase
      .from("storage_item_images")
      .select("id, storage_path")
      .eq("item_id", item_id);

    if (imagesError) {
      throw new Error(`Failed to get images: ${imagesError.message}`);
    }

    // Update the org_items data
    // Set is_deleted to true and is_active to false
    // This way it cannot be booked, and is scheduled to be deleted once
    // there are no future or ongoing bookings with the item (CRON JOB: 'delete_inactive_items')
    const { error: orgError } = await supabase
      .from("organization_items")
      .update({ is_deleted: true, is_active: false })
      .eq("storage_item_id", item_id)
      .eq("organization_id", org_id);
    if (orgError) handleSupabaseError(orgError);

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

  // 8. check if the item can be deleted (if it exists in some bookings)
  async canDeleteItem(
    req: Request,
    id: string,
    confirm?: string,
  ): Promise<{ success: boolean; reason?: string; id: string }> {
    const supabase = req["supabase"] as SupabaseClient;
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

  parseCSV(csv: Express.Multer.File) {
    // Parse the file into a JSON
    const parsedCsv = Papa.parse(csv.buffer.toString(), {
      skipEmptyLines: true,
      header: true,
      dynamicTypic: false,
    });

    const validItems: Item[] = [];
    const errors: Array<{ row: number; errors: string[] }> = [];

    // Validate each row, add them to validItems/errors arrays.
    parsedCsv.data.forEach((row: Item, index: number) => {
      const validation = ItemSchema.safeParse(row);

      if (validation.success) {
        validItems.push(validation.data);
      } else {
        errors.push({
          row: index + 1,
          errors: validation.error.issues.map(
            (issue) => `${issue.path.join(".")}: ${issue.message}`,
          ),
        });
      }
    });

    return {
      processed: validItems.length,
      errors: errors,
      data: validItems,
      total: parsedCsv.data.length,
    };
  }

  /**
   * Copy an item
   * This occurrs when two organizations have the same item, and one organization tries to update the item.
   * If the item belongs to multiple organizations the item is copied (and updated) as another item and the new item is updated accordingly.
   * @param supabase A valid and authorized supabase client
   * @param item_id ID of the item to be "split"
   * @returns the new item
   */
  async copyItem(
    req: AuthRequest,
    item_id: string,
    newItem: UpdateItem,
  ): Promise<StorageItem> {
    const supabase = req.supabase;
    const NEW_ITEM_ID = crypto.randomUUID();
    newItem.id = NEW_ITEM_ID;
    const { tagIds, location_details, ...rest } = newItem;

    // Create the new item
    const { data: itemData, error: itemErr } = await supabase
      .from("storage_items")
      .insert({ ...rest, location_id: location_details.id })
      .select()
      .single();
    if (itemErr) handleSupabaseError(itemErr);

    // Copy item image records
    const { data: imgData, error: imgErr }: PostgrestResponse<ItemImageRow> =
      await supabase
        .from("storage_item_images")
        .select("*")
        .eq("item_id", item_id);
    if (imgErr) handleSupabaseError(imgErr);

    // Duplicate the image files
    for (const [index, img] of imgData.entries()) {
      const parts = img.storage_path.split("/");
      const NEW_FILE_NAME = parts[parts.length - 1];
      const NEW_STORAGE_PATH = `${NEW_ITEM_ID}/${NEW_FILE_NAME}`;
      const NEW_FILE_URL = `https://${process.env.SUPABASE_URL}.supabase.co/storage/v1/object/public/item-images/${NEW_STORAGE_PATH}`;
      const { error: imgCopyErr } = await supabase.storage
        .from("item-images")
        .copy(img.storage_path, NEW_STORAGE_PATH);
      Object.assign(imgData[index], {
        storage_path: NEW_STORAGE_PATH,
        image_url: NEW_FILE_URL,
        item_id: NEW_ITEM_ID,
      });
      if (imgCopyErr) throw new Error("Failed to copy images: ", imgCopyErr);
    }

    // Insert new image records that reference the new item ID.
    const { error: imgInsertErr } = await supabase
      .from("storage_item_images")
      .insert(imgData);
    if (imgInsertErr) handleSupabaseError(imgInsertErr);

    // Update the organization data which references the "old" item
    const { error: orgErr } = await supabase
      .from("organization_items")
      .update({ storage_item_id: NEW_ITEM_ID })
      .eq("storage_item_id", item_id);
    if (orgErr) handleSupabaseError(orgErr);

    // Insert tags
    if (tagIds && tagIds.length > 0) {
      await this.tagService.assignTagsToItem(req, NEW_ITEM_ID, tagIds);
    }

    return itemData as StorageItem;
  }
}
