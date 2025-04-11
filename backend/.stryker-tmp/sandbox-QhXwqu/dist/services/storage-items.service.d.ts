// @ts-nocheck
import { SupabaseService } from "./supabase.service";
export declare class StorageItemsService {
    private supabaseService;
    private supabase;
    constructor(supabaseService: SupabaseService);
    getAllItems(): Promise<any>;
    getItemById(id: string): Promise<any>;
    createItem(item: any): Promise<any>;
    updateItem(id: string, item: any): Promise<any>;
    deleteItem(id: string): Promise<any>;
}
