import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Req,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { Request } from "express";
import { StorageItemsService } from "./storage-items.service";
import { SupabaseService } from "../supabase/supabase.service";
import {
  UpdateItem,
  ValidItemOrder,
} from "./interfaces/storage-item.interface";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { ApiSingleResponse } from "../../../../common/response.types";
import { StorageItem } from "./interfaces/storage-item.interface";
import { Public, Roles } from "src/decorators/roles.decorator";
import { ItemFormData } from "@common/items/form.types";
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
    @Query("active") active_filter: "active" | "inactive",
    @Query("locations") location_filter: string,
    @Query("category") category: string,
    @Query("availability_min") availability_min?: string,
    @Query("availability_max") availability_max?: string,
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

    return this.storageItemsService.getOrderedStorageItems(
      pageNum,
      limitNum,
      is_ascending,
      ordered_by,
      searchquery,
      tags,
      active_filter,
      location_filter,
      category,
      availMinNum,
      availMaxNum,
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
  ): Promise<{ status: number; error: string | null }> {
    return this.storageItemsService.createItems(req, formData); // POST /storage-items (new item)
  }

  /**
   * Update an item of an organization
   * @param req An authorized request
   * @param item_id ID of the item to update
   * @param org_id ID of the org to update item
   * @body Update item object including tagsIds and location details.
   * @returns The updated item
   */
  @Put(":id")
  @Roles(["super_admin", "admin", "main_admin", "storage_manager", "superVera"])
  async update(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Query("org") org_id: string,
    @Body()
    item: UpdateItem,
  ): Promise<StorageItem> {
    return this.storageItemsService.updateItem(req, id, org_id, item);
  }

  @Get(":id/can-delete")
  async canDelete(
    @Req() req: AuthRequest,
    @Param("id") id: string,
  ): Promise<{ success: boolean; reason?: string; id: string }> {
    try {
      const result = await this.storageItemsService.canDeleteItem(req, id);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        "Failed to check if item can be deleted",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
}
