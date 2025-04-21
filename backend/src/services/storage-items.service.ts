import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from '@supabase/supabase-js';
import { CreateStorageItemDto, StorageItem, StorageItemWithJoin } from 'src/interfaces/storage-item.interface';
// this is used by the controller

@Injectable()
export class StorageItemsService {
  // handles Database queries
  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService) {
    // For read operations, anon client respects RLS
    // For write operations that need admin access, use service client
    this.supabase = supabaseService.getServiceClient(); // takes the service key to establish connection to the database for handling CRUD
  }

  async getAllItems(): Promise<StorageItem[]> {
    const supabase = this.supabaseService.getServiceClient(); // For reading data, bypasses RLS if is_admin() returns false, and tags will be empty
  
    // Updated query to join storage_item_tags with tags table
    const { data, error }: PostgrestResponse<StorageItemWithJoin> = await supabase
      .from('storage_items')
      .select(`
        *,
        storage_item_tags (
          tag_id,
          tags (
            id,
            translations
          )
        )
      `); // Explicitly select tags and their translations by joining the tags table
  
    if (error) {
      throw new Error(error.message);
    }
  
    // Structure the result to match your backend interface
    return data.map((item) => ({
      ...item,
      storage_item_tags: item.storage_item_tags?.map(
        (tagLink) => tagLink.tags // Flatten out the tags object to just be the tag itself
      ) ?? [], // Fallback to empty array if no tags are available
    }));
  }
  

  async getItemById(id: string): Promise<StorageItem | null> {
    const supabase = this.supabaseService.getAnonClient();
  
    // Query to select item along with its tags
    const { data, error }: PostgrestSingleResponse<StorageItemWithJoin> = await supabase
      .from('storage_items')
      .select(`
        *,
        storage_item_tags (
          tag_id,
          tags (
            id,
            translations
          )
        )
      `) // Join storage_item_tags and tags table to get full tag data
      .eq('id', id)
      .single();
  
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
  
    // Flatten the tags to make them easier to work with
    return {
      ...data,
      storage_item_tags: data?.storage_item_tags
        ? data.storage_item_tags.map((tagLink) => tagLink.tags) // Extract just the tag itself
        : [],
    };
  }
  
  
  //previously createItem commented out
  // async createItem(item: Partial<StorageItem>): Promise<StorageItem[]> {
  //   const supabase = this.supabaseService.getServiceClient(); // Write operation
  //   const { data, error }: PostgrestResponse<StorageItem> = await supabase
  //     .from('storage_items')
  //     .insert([item])
  //     .select();
  //   if (error) throw new Error(error.message);
  //   return data || [];
  // }

  async createItem(createStorageItemDto: any) {
    // extract tagIds and remove them from the actual insert payload
    const { tagIds, ...rest } = createStorageItemDto;
    // clone and strip tagIds at runtime
    const storageItemData = JSON.parse(JSON.stringify(rest));
    delete storageItemData.tagIds;
    // 1. Insert item into storage_items
    const { data: insertedItems, error: itemInsertError } = await this.supabase
      .from('storage_items')
      .insert([storageItemData]) // No tagIds here
      .select();
  
    if (itemInsertError) {
      throw new Error(itemInsertError.message);
    }
    const insertedItem = insertedItems?.[0];
    if (!insertedItem) {
      throw new Error('Failed to insert storage item.');
    }
    // 2. Insert related tags into storage_item_tags
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      const itemTags = tagIds.map((tagId) => ({
        item_id: insertedItem.id,
        tag_id: tagId,
      }));
      const { error: tagInsertError } = await this.supabase
        .from('storage_item_tags')
        .insert(itemTags);
      if (tagInsertError) {
        throw new Error(tagInsertError.message);
      }
    }
    return insertedItem;
  }    

  async updateItem(
    id: string,
    item: Partial<StorageItem>,
  ): Promise<StorageItem[]> {
    const supabase = this.supabaseService.getServiceClient(); // Write operation
    const { data, error }: PostgrestResponse<StorageItem> = await supabase
      .from('storage_items')
      .update(item)
      .eq('id', id)
      .select();
    if (error) throw new Error(error.message);
    return data || [];
  }

  async deleteItem(id: string): Promise<StorageItem[]> {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error }: PostgrestResponse<StorageItem> = await supabase
      .from('storage_items')
      .delete()
      .eq('id', id)
      .select(); // Add this to return deleted data
    if (error) throw new Error(error.message);
    return data || [];
  }
}
