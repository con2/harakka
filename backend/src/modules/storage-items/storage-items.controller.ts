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

@Controller("storage-items")
export class StorageItemsController {
  constructor(
    private readonly storageItemsService: StorageItemsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Get all storage items.
   * This endpoint is public and returns a paginated list of all storage items.
   * @param page The page number to retrieve (default: 1).
   * @param limit The number of items per page (default: 10).
   * @returns A paginated list of storage items.
   */
  @Public()
  @Get()
  async getAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const supabase = this.supabaseService.getAnonClient();
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return this.storageItemsService.getAllItems(supabase, pageNum, limitNum);
  }

  /**
   * Get availability overview for items at a moment or within a window.
   * Protected: tenant_admin or storage_manager within the same organization.
   *
   * Query params (all optional):
   * - start_date, end_date (ISO strings). If omitted, defaults to now.
   * - item_ids, location_ids, category_ids: CSV lists of UUIDs to filter.
   */
  @Get("availability-overview")
  @Roles(["storage_manager", "tenant_admin"], { match: "any", sameOrg: true })
  async getAvailabilityOverview(
    @Req() req: AuthRequest,
    @Query("start_date") startDate?: string,
    @Query("end_date") endDate?: string,
    @Query("item_ids") itemIdsCsv?: string,
    @Query("location_ids") locationIdsCsv?: string,
    @Query("category_ids") categoryIdsCsv?: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const activeOrgId = req.headers["x-org-id"] as string;
    if (!activeOrgId) {
      throw new BadRequestException("Organization context is required");
    }

    const parseCsv = (s?: string) =>
      s
        ? s
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length > 0)
        : undefined;

    const itemIds = parseCsv(itemIdsCsv);
    const locationIds = parseCsv(locationIdsCsv);
    const categoryIds = parseCsv(categoryIdsCsv);

    // If neither date provided, use "now" by omitting params to let RPC defaults apply
    const start = startDate && startDate.trim() !== "" ? startDate : undefined;
    const end = endDate && endDate.trim() !== "" ? endDate : undefined;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return this.storageItemsService.getAvailabilityOverview(req, activeOrgId, {
      startDate: start,
      endDate: end,
      itemIds,
      locationIds,
      categoryIds,
      page: pageNum,
      limit: limitNum,
    });
  }

  /**
   * Get distinct locations where the active organization has items.
   */
  @Get("admin-location-options")
  @Roles(["storage_manager", "tenant_admin"], { match: "any", sameOrg: true })
  async getAdminLocationOptions(@Req() req: AuthRequest) {
    const activeOrgId = req.headers["x-org-id"] as string;
    if (!activeOrgId) {
      throw new BadRequestException("Organization context is required");
    }
    return this.storageItemsService.getAdminLocationOptions(req, activeOrgId);
  }

  /**
   * Get ordered and/or filtered storage items.
   * This endpoint is public and allows filtering, searching, and ordering of storage items.
   * @param searchquery Optional search query to filter items.
   * @param ordered_by Column to order the items by (default: "created_at").
   * @param page The page number to retrieve (default: 1).
   * @param limit The number of items per page (default: 10).
   * @param ascending Whether to sort in ascending order (default: true).
   * @param tags Optional tag IDs to filter items.
   * @param active_filter Filter by active/inactive status.
   * @param location_filter Filter by location.
   * @param category Filter by category.
   * @param availability_min Minimum availability filter.
   * @param availability_max Maximum availability filter.
   * @param org_filter Filter by organization.
   * @returns A list of matching storage items.
   */
  @Public()
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
    @Query("org") org_filter?: string,
  ) {
    const supabase = this.supabaseService.getAnonClient();
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
      supabase,
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
   * Get ordered and/or filtered storage items for administrators.
   *
   * @param req The authenticated request object containing user and organization context.
   * @param searchquery Optional search query to filter items by name or type.
   * @param ordered_by Column to order the items by (default: "created_at").
   * @param page The page number to retrieve (default: 1).
   * @param limit The number of items per page (default: 10).
   * @param ascending Whether to sort the results in ascending order (default: true).
   * @param tags Optional tag IDs to filter items.
   * @param active_filter Filter by active/inactive status (supports "true"/"false" and "active"/"inactive").
   * @param location_filter Filter by location.
   * @param category Filter by category.
   *
   * @returns A paginated list of matching storage items for the administrator.
   */
  @Get("ordered-admin-items")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  getOrdereAdmindItems(
    @Req() req: AuthRequest,
    @Query("search") searchquery: string,
    @Query("order") ordered_by: ValidItemOrder,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("ascending") ascending: string = "true",
    @Query("tags") tags: string,
    @Query("active") active_filter: string,
    @Query("location") location_filter: string,
    @Query("category") category: string,
  ) {
    const activeOrgId = req.headers["x-org-id"] as string;
    if (!activeOrgId) {
      throw new BadRequestException("Organization context is required");
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const is_ascending = ascending.toLowerCase() === "true";
    let isActive: boolean | undefined = undefined;
    if (typeof active_filter === "string") {
      const v = active_filter.toLowerCase();
      if (v === "true" || v === "active") isActive = true;
      else if (v === "false" || v === "inactive") isActive = false;
    }

    return this.storageItemsService.getAllAdminItems(
      req,
      activeOrgId,
      pageNum,
      limitNum,
      is_ascending,
      searchquery,
      ordered_by,
      tags,
      isActive,
      location_filter,
      category,
    );
  }

  /**
   * Get the total count of storage items.
   * Restricted to users with the "storage_manager" or "tenant_admin" roles in the same organization.
   * @param req The authenticated request object.
   * @returns The total count of storage items.
   */
  @Get("count")
  @Roles(["storage_manager", "tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async getItemCount(@Req() req: AuthRequest) {
    const activeRole = req.headers["x-role-name"] as string;
    const activeOrgId = req.headers["x-org-id"] as string;

    return this.storageItemsService.getItemCount(req, activeRole, activeOrgId);
  }

  /**
   * Get a storage item by its ID.
   * This endpoint is public and retrieves a specific storage item by its ID.
   * @param id The ID of the storage item.
   * @returns The storage item, or null if not found.
   */
  @Public()
  @Get("id/:id")
  async getById(@Param("id") id: string): Promise<StorageItem | null> {
    const supabase = this.supabaseService.getAnonClient();
    return this.storageItemsService.getItemById(supabase, id);
  }

  /**
   * Get storage items by tag.
   * This endpoint is public and retrieves storage items associated with a specific tag.
   * @param tagId The ID of the tag.
   * @param req The request object.
   * @returns A list of storage items associated with the tag.
   */
  @Public()
  @Get("by-tag/:tagId")
  async getItemsByTag(@Param("tagId") tagId: string) {
    const supabase = this.supabaseService.getAnonClient();
    return this.storageItemsService.getItemsByTag(supabase, tagId);
  }

  /**
   * Get the availability of a storage item.
   * This endpoint is public and checks the availability of a storage item within a date range.
   * @param itemId The ID of the storage item.
   * @param startDate The start date of the availability check.
   * @param endDate The end date of the availability check.
   * @param req The authenticated request object.
   * @returns The availability details of the storage item.
   */
  @Public()
  @Get("availability/:itemId")
  async getItemAvailability(
    @Param("itemId") itemId: string,
    @Query("start_date") startDate: string,
    @Query("end_date") endDate: string,
  ): Promise<
    ApiSingleResponse<{
      item_id: string;
      alreadyBookedQuantity: number;
      availableQuantity: number;
    }>
  > {
    const supabase = this.supabaseService.getAnonClient();

    if (!itemId || !startDate || !endDate) {
      throw new BadRequestException(
        "Item id, startdate and enddate are required!",
      );
    }
    return await this.storageItemsService.checkAvailability(
      supabase,
      itemId,
      startDate,
      endDate,
    );
  }

  /**
   * Create a new storage item.
   * Restricted to users with the "storage_manager" or "tenant_admin" roles in the same organization.
   * @param req The authenticated request object.
   * @param formData The form data for the new storage item.
   * @returns The status and error (if any) of the creation process.
   */
  @Post()
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async create(
    @Req() req: AuthRequest,
    @Body()
    formData: ItemFormData,
  ): Promise<{ status: number; error: string | null }> {
    return await this.storageItemsService.createItems(req, formData);
  }

  /**
   * Upload and process a CSV file for storage items.
   * Restricted to users with the "storage_manager" or "tenant_admin" roles in the same organization.
   * @param req The authenticated request object.
   * @param file The uploaded CSV file.
   * @returns The processed CSV data.
   */
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  processCsv(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ): ProcessedCSV {
    return this.storageItemsService.parseCSV(file);
  }

  /**
   * Update an item of an organization
   * Restricted to users with the "storage_manager" or "tenant_admin" roles in the same organization.
   * @param req An authorized request
   * @param item_id ID of the item to update
   * @param org_id ID of the org to update item
   * @body Update item object including tagsIds and location details.
   * @returns The updated item
   */
  @Put(":org_id/:item_id")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async update(
    @Req() req: AuthRequest,
    @Param("org_id") org_id: string,
    @Param("item_id") item_id: string,
    @Body()
    item: UpdateItem,
  ): Promise<UpdateResponse> {
    return this.storageItemsService.updateItem(req, item_id, org_id, item);
  }

  /**
   * Delete an organizations item.
   * Restricted to users with the "storage_manager" or "tenant_admin" roles in the same organization.
   * This method soft-deletes the item, then relies on a daily CRON job to remove completely inactive and * unreferenced items. (CRON JOB: 'delete_inactive_items')
   * @param req An Authorized request
   * @param item_id The ID of the item to soft-delete
   * @param org_id The organization ID which to soft-delete the item from
   * @returns The result of the deletion process
   */
  @Delete(":org_id/:item_id")
  @Roles(["storage_manager", "tenant_admin"], {
    match: "any",
    sameOrg: true,
  })
  async deleteItem(
    @Req() req: AuthRequest,
    @Param("org_id") org_id: string,
    @Param("item_id") item_id: string,
  ) {
    return await this.storageItemsService.deleteItem(req, item_id, org_id);
  }
}
