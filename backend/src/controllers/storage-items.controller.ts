import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { StorageItemsService } from "src/services/storage-items.service";
// calls the methods of storage-items.service.ts & handles API req and forwards it to the server

@Controller("storage-items") // api path: /storage-items = Base URL     // = HTTP-Controller
export class StorageItemsController {
  constructor(private readonly storageItemsService: StorageItemsService) {}

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

  // with Query Parameter: DELETE /storage-items/:id?confirm=yes
  @Delete(":id")
  async delete(
    @Param("id") id: string,
    @Query("confirm") confirm?: string,
  ): Promise<any> {
    try {
      const result = await this.storageItemsService.deleteItem(id, confirm);
      return result; // Return the result, which will include the success status and ID
    } catch (error) {
      // Throw an HTTP exception rather than returning an object
      throw new HttpException(
        error.message || "Failed to delete item",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
