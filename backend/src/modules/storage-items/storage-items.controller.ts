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
} from "@nestjs/common";
import { Request } from "express";
import { StorageItemsService } from "./storage-items.service";
import { SupabaseService } from "../supabase/supabase.service";
import { Tables, TablesInsert, TablesUpdate } from "../../types/supabase.types"; // Import the Database type for type safety
// calls the methods of storage-items.service.ts & handles API req and forwards it to the server

@Controller("storage-items") // api path: /storage-items = Base URL     // = HTTP-Controller
export class StorageItemsController {
  constructor(
    private readonly storageItemsService: StorageItemsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  async getAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return this.storageItemsService.getAllItems(pageNum, limitNum);
  }

  @Get("ordered")
  getOrderedBookings(
    @Query("search") searchquery: string,
    @Query("order") ordered_by: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("ascending") ascending: string = "true",
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const is_ascending = ascending.toLowerCase() === "true";
    return this.storageItemsService.getOrderedStorageItems(
      pageNum,
      limitNum,
      is_ascending,
      ordered_by,
      searchquery,
    );
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.storageItemsService.getItemById(id); // GET /storage-items/:id (get one)
  }

  @Post()
  async create(@Req() req, @Body() item) {
    return this.storageItemsService.createItem(req, item); // POST /storage-items (new item)
  }

  @Put(":id")
  async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() item: Partial<Tables<"storage_items">>, // Use the type from your Supabase types
  ) {
    return this.storageItemsService.updateItem(req, id, item); // PUT /storage-items/:id (update item)
  }

  // soft delete
  @Post(":id/soft-delete")
  async softDeleteStorageItem(@Req() req: Request, @Param("id") id: string) {
    return this.storageItemsService.softDeleteItem(req, id);
  }

  @Get("by-tag/:tagId")
  async getItemsByTag(@Req() req: Request, @Param("tagId") tagId: string) {
    return this.storageItemsService.getItemsByTag(req, tagId);
  }

  @Post(":id/can-delete")
  async canDelete(@Req() req: Request, @Param("id") id: string): Promise<any> {
    try {
      const result = await this.storageItemsService.canDeleteItem(req, id);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to check if item can be deleted",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
