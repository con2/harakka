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
} from "@nestjs/common";
import { Request } from "express";
import { StorageItemsService } from "./storage-items.service";
import { SupabaseService } from "../supabase/supabase.service";
import { Tables } from "../../types/supabase.types"; // Import the Database type for type safety

@Controller("storage-items") // api path: /storage-items = Base URL     // = HTTP-Controller
export class StorageItemsController {
  constructor(
    private readonly storageItemsService: StorageItemsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  async getAll() {
    return this.storageItemsService.getAllItems(); // GET /storage-items
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.storageItemsService.getItemById(id); // GET /storage-items/:id (get one)
  }
  // /storage-items/by-tag/:tagId
  @Get("by-tag/:tagId")
  async getItemsByTag(@Param("tagId") tagId: string) {
    return this.storageItemsService.getItemsByTag(tagId);
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

  @Post(":id/can-delete")
  async canDelete(
    @Req() req: Request,
    @Param("id") id: string,
  ): Promise<{ success: boolean; reason?: string; id: string }> {
    try {
      return await this.storageItemsService.canDeleteItem(req, id);
    } catch (err: unknown) {
      const { message } = err as { message: string };
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
