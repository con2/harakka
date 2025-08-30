import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
  Query,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Delete,
} from "@nestjs/common";
import { Request } from "express";
import { StorageItemsService } from "./storage-items.service";
import { SupabaseService } from "../supabase/supabase.service";
import { ValidItemOrder } from "./interfaces/storage-item.interface";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { ApiSingleResponse } from "../../../../common/response.types";
import { StorageItem } from "./interfaces/storage-item.interface";
import { Public, Roles } from "src/decorators/roles.decorator";
import { ItemFormData } from "@common/items/form.types";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdateItem, UpdateResponse } from "@common/items/storage-items.types";
import { ProcessedCSV } from "@common/items/csv.types";
// calls the methods of storage-items.service.ts & handles API req and forwards it to the server

@Controller("storage-items") // api path: /storage-items = Base URL     // = HTTP-Controller
export class StorageItemsController {
  constructor(
    private readonly storageItemsService: StorageItemsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Public()
  @Get()
  async getAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return this.storageItemsService.getAllItems(pageNum, limitNum);
  }

  /**
   * Get ordered and/or filtered items
   * @param page What page number is requested
   * @param limit How many rows to retrieve
   * @param ascending If to sort order smallest-largest (e.g a-z) or descending (z-a). Default true / ascending.
   * @param order_by What column to order the columns by. Default "created_at". See {Valid}
   * @param searchquery Optional. Filter items by a string
   * @returns Matching items
   */
  @Get("ordered")
  getOrderedItems(
    @Query("search") searchquery: string,
    @Query("order") ordered_by: ValidItemOrder,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("ascending") ascending: string = "true",
    @Query("tags") tags: string,
    @Query("active") active_filter: string,
    @Query("location") location_filter: string,
    @Query("category") category: string,
    @Query("availability_min") availability_min?: string,
    @Query("availability_max") availability_max?: string,
    // Optional organization filter (comma-separated list of org IDs or single ID)
    @Query("org") org_filter?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const is_ascending = ascending.toLowerCase() === "true";
    const availMinNum =
      availability_min !== undefined
        ? parseInt(availability_min, 10)
        : undefined;
    const availMaxNum =
      availability_max !== undefined
        ? parseInt(availability_max, 10)
        : undefined;
    // Normalize active filter to boolean if provided (supports "true"/"false" and legacy "active"/"inactive")
    let isActive: boolean | undefined = undefined;
    if (typeof active_filter === "string") {
      const v = active_filter.toLowerCase();
      if (v === "true" || v === "active") isActive = true;
      else if (v === "false" || v === "inactive") isActive = false;
    }

    return this.storageItemsService.getOrderedStorageItems(
      pageNum,
      limitNum,
      is_ascending,
      ordered_by,
      searchquery,
      tags,
      isActive,
      location_filter,
      category,
      availMinNum,
      availMaxNum,
      undefined,
      undefined,
      org_filter,
    );
  }

  /**
   * Get the total item count of unique items in the system
   * @returns number of total items (active and inactive)
   */
  @Get("count")
  async getItemCount(): Promise<ApiSingleResponse<number>> {
    const supabase = this.supabaseService.getAnonClient();
    return this.storageItemsService.getItemCount(supabase);
  }
  // (if we dont find the solution we could use that)
  @Get(":id")
  async getById(@Param("id") id: string): Promise<StorageItem | null> {
    return this.storageItemsService.getItemById(id); // GET /storage-items/:id (get one)
  }
  // /storage-items/by-tag/:tagId
  @Get("by-tag/:tagId")
  async getItemsByTag(@Param("tagId") tagId: string, @Req() req: Request) {
    return this.storageItemsService.getItemsByTag(req, tagId);
  }

  @Post()
  async create(
    @Req() req: AuthRequest,
    @Body()
    formData: ItemFormData,
  ): Promise<{ status: number; error: string | null; item?: StorageItem }> {
    return await this.storageItemsService.createItems(req, formData); // POST /storage-items (new item)
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @Roles(["storage_manager", "tenant_admin"])
  processCsv(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ): ProcessedCSV {
    return this.storageItemsService.parseCSV(file);
  }

  /**
   * Update an item of an organization
   * @param req An authorized request
   * @param item_id ID of the item to update
   * @param org_id ID of the org to update item
   * @body Update item object including tagsIds and location details.
   * @returns The updated item
   */
  @Put(":org_id/:item_id")
  @Roles(["super_admin", "tenant_admin", "storage_manager", "superVera"])
  async update(
    @Req() req: AuthRequest,
    @Param("org_id") org_id: string,
    @Param("item_id") item_id: string,
    @Body()
    item: UpdateItem,
  ): Promise<UpdateResponse> {
    return this.storageItemsService.updateItem(req, item_id, org_id, item);
  }

  // checks availability of items by date range
  @Get("availability/:itemId")
  async getItemAvailability(
    @Param("itemId") itemId: string,
    @Query("start_date") startDate: string,
    @Query("end_date") endDate: string,
    @Req() req: AuthRequest,
  ): Promise<
    ApiSingleResponse<{
      item_id: string;
      alreadyBookedQuantity: number;
      availableQuantity: number;
    }>
  > {
    const supabase = req.supabase || this.supabaseService.getAnonClient();

    if (!itemId || !startDate || !endDate) {
      throw new BadRequestException(
        "Item id, startdate and enddate are required!",
      );
    }
    return await this.storageItemsService.checkAvailability(
      itemId,
      startDate,
      endDate,
      supabase,
    );
  }

  /**
   * Delete an organizations item.
   * This method soft-deletes the item, then relies on a daily CRON job to remove completely inactive and * unreferenced items. (CRON JOB: 'delete_inactive_items')
   * @param req An Authorized request
   * @param item_id The ID of the item to soft-delete
   * @param org_id The organization ID which to soft-delete the item from
   * @returns
   */
  @Delete(":org_id/:item_id")
  async deleteItem(
    @Req() req: AuthRequest,
    @Param("org_id") org_id: string,
    @Param("item_id") item_id: string,
  ) {
    return await this.storageItemsService.deleteItem(req, item_id, org_id);
  }
}
