import { BadRequestException, Injectable } from "@nestjs/common";
import {
  PostgrestMaybeSingleResponse,
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import {
  LocationRow,
  StorageItem,
  StorageItemWithJoin,
  ValidItemOrder,
} from "./interfaces/storage-item.interface";
import { SupabaseService } from "../supabase/supabase.service";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";
import { calculateAvailableQuantity } from "src/utils/booking.utils";
import {
  applyItemFilters,
  payloadToStorageItem,
} from "@src/utils/storage-items.utils";
import { ApiResponse, ApiSingleResponse } from "@common/response.types"; // Import ApiSingleResponse for type safety
import { handleSupabaseError } from "@src/utils/handleError.utils";
import { TagService } from "../tag/tag.service";
import { AuthRequest } from "@src/middleware/interfaces/auth-request.interface";
import { ItemFormData } from "@common/items/form.types";
import { mapItemImages, mapTagLinks } from "@src/utils/storage-items.utils";
import { ItemImagesService } from "../item-images/item-images.service";
import { parse, ParseResult } from "papaparse";
import { Item, ItemSchema } from "./schema/item-schema";
import { UpdateItem, UpdateResponse } from "@common/items/storage-items.types";
import { ZodError } from "zod";
import { CSVItem, ProcessedCSV } from "@common/items/csv.types";

@Injectable()
export class StorageItemsService {
  constructor(
    private readonly supabaseClient: SupabaseService,
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
    supabase: SupabaseClient,
    page: number,
    limit: number,
    active?: boolean,
  ): Promise<ApiResponse<StorageItem>> {
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

  /**
   * Get ordered and/or filtered items
   * @param supabase The Supabase client instance used for querying.
   * @param page The page number to retrieve (1-based index).
   * @param limit The number of items per page.
   * @param ascending Whether to sort in ascending order (true) or descending order (false). Default is true.
   * @param order_by The column to order the results by. Default is "created_at".
   * @param searchquery Optional. A search string to filter items by name, type, or location.
   * @param tags Optional. A comma-separated list of tag IDs to filter items by.
   * @param isActive Optional. Filter items by their active status (true for active, false for inactive).
   * @param location_filter Optional. Filter items by location.
   * @param category Optional. Filter items by category.
   * @param availability_min Optional. The minimum availability threshold to filter items.
   * @param availability_max Optional. The maximum availability threshold to filter items.
   * @param from_date Optional. The start date for filtering items by availability.
   * @param to_date Optional. The end date for filtering items by availability.
   * @param org_filter Optional. Filter items by organization.
   * @returns An object containing the filtered and ordered storage items, along with pagination metadata.
   */
  async getOrderedStorageItems(
    supabase: SupabaseClient,
    page: number,
    limit: number,
    ascending: boolean,
    order_by?: ValidItemOrder,
    searchquery?: string,
    tags?: string,
    isActive?: boolean,
    location_filter?: string,
    category?: string,
    availability_min?: number,
    availability_max?: number,
    from_date?: string,
    to_date?: string,
    org_filter?: string,
  ) {
    // Build a base query without range for counting and apply all filters

    // Get nested categories of X category ID.
    // Support comma-separated list of category IDs; union all descendants
    const matchingCategories: string[] | null = category ? [] : null;
    if (category) {
      const ids = category
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const acc = new Set<string>();
      for (const id of ids) {
        const { data: cats } = await supabase.rpc("get_category_descendants", {
          category_uuid: id,
        });
        if (Array.isArray(cats)) {
          (cats as { id: string }[]).forEach((c) => acc.add(c.id));
        }
      }
      matchingCategories!.push(...Array.from(acc));
    }
    const base = applyItemFilters(
      supabase
        .from("view_manage_storage_items")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false),
      {
        searchquery,
        isActive,
        tags,
        location_filter,
        categories: matchingCategories,
        from_date,
        to_date,
        availability_min,
        availability_max,
        org_filter,
      },
    );
    const countResult = await base;
    if (countResult.error) {
      handleSupabaseError(countResult.error);
    }
    const total = countResult.count ?? 0;
    const meta = getPaginationMeta(total, page, limit);

    // If requested page is out of range, return empty response instead of querying with invalid range
    if (meta.total === 0 || page > meta.totalPages) {
      return {
        data: [],
        error: null,
        status: 200,
        statusText: "OK",
        count: total,
        metadata: meta,
      };
    }

    // Now fetch the actual page data with range
    const { from, to } = getPaginationRange(page, limit);
    let query = supabase
      .from("view_manage_storage_items")
      .select("*", { count: "exact" })
      .eq("is_deleted", false)
      .range(from, to);

    query = applyItemFilters(query, {
      searchquery,
      isActive,
      tags,
      location_filter,
      categories: matchingCategories,
      from_date,
      to_date,
      availability_min,
      availability_max,
      org_filter,
    });

    if (order_by) query.order(order_by ?? "created_at", { ascending });
    const result = await query;

    if (result.error) {
      handleSupabaseError(result.error);
    }

    const pagination_meta = getPaginationMeta(result.count, page, limit);
    return {
      ...result,
      metadata: pagination_meta,
    };
  }

  /**
   * Get all storage items for an admin's organization.
   * This method retrieves storage items based on filters, sorting, and pagination, scoped to the admin's organization.
   *
   * @param req The authenticated request object, which includes the Supabase client instance.
   * @param searchquery Optional. A search string to filter items by name, type, or location.
   * @param ordered_by The column to order the results by. Default is "created_at".
   * @param page The page number to retrieve (1-based index).
   * @param limit The number of items per page.
   * @param ascending Whether to sort in ascending order (true) or descending order (false). Default is true.
   * @param tags Optional. A comma-separated list of tag IDs to filter items by.
   * @param active_filter Optional. Filter items by their active status (true for active, false for inactive).
   * @param location_filter Optional. Filter items by location.
   * @param category Optional. Filter items by category.
   * @param activeOrgId The organization ID of the authenticated user.
   * @returns An object containing the filtered and ordered storage items, along with pagination metadata.
   */
  async getAllAdminItems(
    req: AuthRequest,
    activeOrgId: string,
    page: number,
    limit: number,
    ascending: boolean,
    searchquery?: string,
    order_by?: ValidItemOrder,
    tags?: string,
    isActive?: boolean,
    location_filter?: string,
    category?: string,
  ) {
    const supabase = req.supabase;
    if (!supabase) {
      throw new BadRequestException("Supabase client is not initialized.");
    }
    // Get nested categories of X category ID.
    // Support comma-separated list of category IDs; union all descendants
    const matchingCategories: string[] = [];
    if (category) {
      const ids = category
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const acc = new Set<string>();
      for (const id of ids) {
        const { data: cats } = await supabase.rpc("get_category_descendants", {
          category_uuid: id,
        });
        if (Array.isArray(cats)) {
          (cats as { id: string }[]).forEach((c) => acc.add(c.id));
        }
      }
      matchingCategories.push(...Array.from(acc));
    }
    // Build a base query with organization filtering
    const base = applyItemFilters(
      supabase
        .from("view_manage_storage_items")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false)
        .eq("organization_id", activeOrgId), // Prefilter by organization
      {
        searchquery,
        isActive,
        tags,
        location_filter,
        categories: matchingCategories,
      },
    );
    const countResult = await base;
    if (countResult.error) {
      handleSupabaseError(countResult.error);
    }
    const total = countResult.count ?? 0;
    const meta = getPaginationMeta(total, page, limit);

    // If requested page is out of range, return an empty response
    if (meta.total === 0 || page > meta.totalPages) {
      return {
        data: [],
        error: null,
        status: 200,
        statusText: "OK",
        count: total,
        metadata: meta,
      };
    }

    // Now fetch the actual page data with range
    const { from, to } = getPaginationRange(page, limit);
    let query = supabase
      .from("view_manage_storage_items")
      .select("*", { count: "exact" })
      .eq("is_deleted", false)
      .eq("organization_id", activeOrgId) // Prefilter by organization
      .range(from, to);

    query = applyItemFilters(query, {
      searchquery,
      isActive,
      tags,
      location_filter,
      categories: matchingCategories,
    });

    if (order_by) query.order(order_by ?? "created_at", { ascending });

    const result = await query;

    if (result.error) {
      handleSupabaseError(result.error);
    }

    const pagination_meta = getPaginationMeta(result.count, page, limit);

    return {
      ...result,
      metadata: pagination_meta,
    };
  }
  /**
   * Get the total count of storage items.
   *
   * @param req The authenticated request object, which includes the Supabase client instance.
   * @returns An object containing the total count of storage items.
   */
  async getItemCount(req: AuthRequest, role: string, orgId?: string) {
    const supabase = req.supabase;

    // Super admin should receive global count
    if (role === "super_admin") {
      const result = await supabase
        .from("storage_items")
        .select(undefined, { count: "exact" })
        .eq("is_deleted", false);
      if (result.error) handleSupabaseError(result.error);

      return {
        ...result,
        data: result.count ?? 0,
      };
    }

    // Tenant admins and storage managers should get org-scoped counts
    if (!orgId) {
      throw new BadRequestException("Organization context is required");
    }

    const result = await supabase
      .from("storage_items")
      .select(undefined, { count: "exact" })
      .eq("org_id", orgId)
      .eq("is_deleted", false);
    if (result.error) handleSupabaseError(result.error);

    return {
      ...result,
      data: result.count ?? 0,
    };
  }

  /**
   * Get a storage item by its ID.
   * @param supabase The Supabase client instance.
   * @param id The ID of the storage item.
   * @returns The storage item, or null if not found.
   */
  async getItemById(
    supabase: SupabaseClient,
    id: string,
  ): Promise<StorageItem | null> {
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
   * Get storage items by tag.
   * @param supabase The Supabase client instance.
   * @param tagId The ID of the tag.
   * @returns A list of storage items associated with the tag.
   */
  async getItemsByTag(supabase: SupabaseClient, tagId: string) {
    const {
      data,
      error,
    }: PostgrestResponse<{ item_id: string; items: StorageItem[] }> =
      await supabase
        .from("storage_item_tags")
        .select("item_id, items(*)") // Select foreign table 'items' if it's a relation
        .eq("tag_id", tagId);

    if (error) handleSupabaseError(error);

    // The data will now have the related 'items' fetched in the same query
    return data.map((entry) => entry.items); // Extract items from the relation
  }

  /**
   * Check the availability of a storage item within a date range.
   * @param supabase The Supabase client instance.
   * @param itemId The ID of the storage item.
   * @param startDate The start date of the availability check.
   * @param endDate The end date of the availability check.
   * @returns The availability details of the storage item.
   */
  async checkAvailability(
    supabase: SupabaseClient,
    itemId: string,
    startDate: string,
    endDate: string,
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

  /**
   * Insert items with org data, image data, tags
   * @param req An authorized request
   * @param payload Can be either one item with an array of tagIds or an array of items of the same structure
   * @returns
   */
  async createItems(
    req: AuthRequest,
    payload: ItemFormData,
  ): Promise<{ status: number; error: string | null; items?: StorageItem[] }> {
    const supabase = req.supabase;
    const itemsToInsert = payloadToStorageItem(payload);
    const mappedImageData = mapItemImages(payload);
    const item_ids = itemsToInsert.map((i) => i.id);

    try {
      // Insert item data
      const { error }: PostgrestMaybeSingleResponse<StorageItem> =
        await supabase.from("storage_items").insert(itemsToInsert);
      if (error) {
        throw new Error(error.message);
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

      // return status and item details
      return { status: 201, error: null, items: itemsToInsert };
    } catch (error) {
      console.log(error);
      // Rollback: Clean up any partially inserted data
      await Promise.allSettled([
        supabase.from("storage_item_images").delete().in("item_id", item_ids),
        supabase.from("storage_item_tags").delete().in("item_id", item_ids),
        supabase.from("storage_items").delete().in("id", item_ids),
      ]);

      return {
        status: error?.code ?? 500,
        error: error?.message ?? "An unexpected error occurred",
      };
    }
  }

  /**
   * Update an item in the system.
   * If the item exists within more than one organization, a copy is made, which is updated and returned.
   * @param req An authenticated request
   * @param item_id The ID of the item which to update
   * @param org_id The org the item belongs to
   * @param item The updated item properties
   * @returns {UpdateResponse}
   */
  async updateItem(
    req: AuthRequest,
    item_id: string,
    org_id: string,
    item: UpdateItem,
  ): Promise<UpdateResponse> {
    const supabase = req.supabase;
    // Extract properties that shouldn't be sent to the database
    const { tags, location_details, ...itemData } = item;

    // Update the main item
    const {
      data: updatedItem,
      error: updateError,
    }: PostgrestSingleResponse<
      StorageItem & { storage_locations: LocationRow }
    > = await supabase
      .from(`storage_items`)
      .update(itemData)
      .eq("id", item_id)
      .eq("org_id", org_id)
      .select(`*, storage_locations(*)`)
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (!updatedItem)
      throw new BadRequestException(
        updateError || "Failed to update storage item",
      );

    // Update tag relationships
    if (tags && tags.length > 0)
      await this.tagService.assignTagsToItem(req, item_id, tags);

    const { storage_locations, ...rest } = updatedItem;
    const formattedItem = { ...rest, location_details: storage_locations };

    return {
      success: true,
      item: formattedItem,
    };
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

      // Update the storage_items data
      // Set is_deleted to true and is_active to false
      // This way it cannot be booked, and is scheduled to be deleted once
      // there are no future or ongoing bookings with the item (CRON JOB: 'delete_inactive_items')
      const { error: itemUpdateError } = await supabase
        .from("storage_items")
        .update({ is_deleted: true, is_active: false })
        .eq("id", item_id)
        .eq("org_id", org_id);
      if (itemUpdateError)
        throw new Error(
          `Failed to update org items: ${itemUpdateError.message}`,
        );

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

  parseCSV(csv: Express.Multer.File): ProcessedCSV {
    // Parse the file into a JSON
    const csvString = csv.buffer.toString("utf8");
    const result: ParseResult<Record<string, unknown>> = parse<
      Record<string, unknown>
    >(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    const processedItems: Item[] = [];
    const errors: Array<{ row: number; errors: string[] }> = [];

    // Validate each row, add them to validItems/errors arrays.
    result.data.forEach((row: Item, index: number) => {
      const validation = ItemSchema.safeParse(row);

      if (validation.success) {
        processedItems.push(validation.data);
      } else {
        const { processedRow, error } = this.clearInvalidRowData(
          row,
          index,
          validation.error.issues,
        );
        processedItems.push(processedRow);
        errors.push(error);
      }
    });

    return {
      processed: processedItems.length,
      errors: errors,
      data: processedItems,
    };
  }

  clearInvalidRowData(row: CSVItem, index: number, issues: ZodError["issues"]) {
    // shallow copy is enough for your flat CSVItem
    const processed = { ...row } as Record<string, any>; //eslint-disable-line

    // Walk issues and blank the first path segment (flat structure)
    issues.forEach((issue) => {
      const path = issue.path && issue.path.length ? issue.path[0] : undefined;

      if (path === undefined || path === null || path === "") {
        // whole-row error -> blank all top-level keys
        Object.keys(processed).forEach((k) => {
          processed[k] = "";
        });
      } else {
        const key = String(path);
        processed[key] = "";
      }
    });

    return {
      processedRow: processed as CSVItem,
      error: {
        row: index + 1,
        errors: issues.map((issue) => `${issue.path.join(",")}:${issue.code}`),
      },
    };
  }
}
