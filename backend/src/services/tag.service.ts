import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class TagService {
  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getServiceClient();
  }
  // Fetch all tags
  async getAllTags() {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*');
  
    if (error) throw new Error(error.message);
    return data;
  }

  // Create a new tag
  async createTag(tagData: any) {
    const { data, error } = await this.supabase
      .from('tags')
      .insert(tagData)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { data };
  }

  async assignTagsToItem(itemId: string, tagIds: string[]) {
    // Remove all current tags from item
    const { error: deleteError } = await this.supabase
      .from('storage_item_tags')
      .delete()
      .eq('item_id', itemId);

    if (deleteError) throw new Error(deleteError.message);

    // Prepare bulk insert
    const insertData = tagIds.map(tagId => ({
      item_id: itemId,
      tag_id: tagId,
    }));

    const { error: insertError } = await this.supabase
      .from('storage_item_tags')
      .insert(insertData);

    if (insertError) throw new Error(insertError.message);
  }

  async getTagsForItem(itemId: string) {
    const { data, error } = await this.supabase
      .from('storage_item_tags')
      .select('tags(*)')
      .eq('item_id', itemId);

    if (error) throw new Error(error.message);

    return data.map(entry => entry.tags);
  }

  async updateTag(id: string, tagData: any) {
    const { data, error } = await this.supabase
      .from('tags')
      .update(tagData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data };
  }

  async removeTagFromItem(itemId: string, tagId: string) {
    const { error } = await this.supabase
      .from('storage_item_tags')
      .delete()
      .match({ item_id: itemId, tag_id: tagId });

    if (error) throw new Error(error.message);
  }

  async deleteTag(id: string) {
    const { error } = await this.supabase
      .from('tags')
      .delete()
      .eq('id', id);
  
    if (error) throw new Error(error.message);
  }
}