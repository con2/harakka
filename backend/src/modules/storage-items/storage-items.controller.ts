import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { StorageItemsService } from "./storage-items.service";
import { SupabaseService } from "../supabase/supabase.service";
// calls the methods of storage-items.service.ts & handles API req and forwards it to the server

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

  @Post()
  async create(@Body() item: any) {
    return this.storageItemsService.createItem(item); // POST /storage-items (new item)
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() item: any) {
    return this.storageItemsService.updateItem(id, item); // PUT /storage-items/:id (update item)
  }

  // soft delete
  @Post(":id/soft-delete")
  async softDeleteStorageItem(@Param("id") id: string) {
    return this.storageItemsService.softDeleteItem(id);
  }

  @Get("by-tag/:tagId")
  async getItemsByTag(@Param("tagId") tagId: string) {
    return this.storageItemsService.getItemsByTag(tagId);
  }

  @Get(":id/can-delete")
  async canDelete(@Param("id") id: string): Promise<any> {
    try {
      const result = await this.storageItemsService.canDeleteItem(id);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to check if item can be deleted",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
