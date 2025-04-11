// @ts-nocheck
import { StorageItemsService } from 'src/services/storage-items.service';
export declare class StorageItemsController {
    private readonly storageItemsService;
    constructor(storageItemsService: StorageItemsService);
    getAll(): Promise<any>;
    getById(id: string): Promise<any>;
    create(item: any): Promise<any>;
    update(id: string, item: any): Promise<any>;
    delete(id: string): Promise<any>;
}
