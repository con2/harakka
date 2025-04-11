import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { StorageItemsService } from 'src/services/storage-items.service';
// calls the methods of storage-items.service.ts & handles API req and forwards it to the server

@Controller('storage-items') // api path: /storage-items = Base URL     // = HTTP-Controller
export class StorageItemsController {
    constructor(private readonly storageItemsService: StorageItemsService) {}

    @Get()
    async getAll() {
        return this.storageItemsService.getAllItems(); // GET /storage-items
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.storageItemsService.getItemById(id); // GET /storage-items/:id (get one)
    }

    @Post()
    async create(@Body() item: any){
        return this.storageItemsService.createItem(item); // POST /storage-items (new item)
    }

    @Put(':id')
        async update (@Param('id') id: string, @Body() item: any){
            return this.storageItemsService.updateItem(id, item); // PUT /storage-items/:id (update item)
        }
    
    @Delete(':id')
        async delete(@Param('id') id: string){
            return this.storageItemsService.deleteItem(id); // DELETE /storage-items/:id (delete item)
        }
}