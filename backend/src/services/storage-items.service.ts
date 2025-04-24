import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from '@supabase/supabase-js';
import { StorageItem } from 'src/interfaces/storage-item.interface';
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
    const supabase = this.supabaseService.getAnonClient();
    const { data, error }: PostgrestResponse<StorageItem> = await supabase
      .from('storage_items')
      .select('*');
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getItemById(id: string): Promise<StorageItem | null> {
    const supabase = this.supabaseService.getAnonClient(); // Read operation
    const { data, error }: PostgrestSingleResponse<StorageItem> = await supabase
      .from('storage_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  }

  async createItem(item: Partial<StorageItem>): Promise<StorageItem[]> {
    const supabase = this.supabaseService.getServiceClient(); // Write operation
    const { data, error }: PostgrestResponse<StorageItem> = await supabase
      .from('storage_items')
      .insert([item])
      .select();
    if (error) throw new Error(error.message);
    return data || [];
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
