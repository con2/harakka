import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { SupabaseClient } from "@supabase/supabase-js";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { TagRow, TagUpdate } from "./interfaces/tag.interface";
import { Database } from "src/types/supabase.types";
import { ApiResponse } from "src/types/response.types";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";

@Injectable()
export class TagService {
  private _supabase: SupabaseClient<Database>;

  constructor(private supabaseService: SupabaseService) {
    this._supabase =
      this.supabaseService.getServiceClient() as SupabaseClient<Database>;
  }
  // Fetch all tags
  async getAllTags(page: number, limit: number): Promise<ApiResponse<TagRow>> {
    const supabase = this._supabase;
    const { from, to } = getPaginationRange(page, limit);

    // Get total count
    const { count, error: countError } = await supabase
      .from("tags")
      .select("*", { count: "exact" });

    if (countError) throw new Error(countError.message);

    // Fetch paginated tags
    const result = await supabase.from("tags").select("*").range(from, to);

    if (result.error) throw new Error(result.error.message);

    const meta = getPaginationMeta(count ?? 0, page, limit);

    // Return in the expected format for frontend
    return {
      data: result.data as TagRow[],
      error: result.error,
      count: result.count,
      status: result.status,
      statusText: result.statusText,
      metadata: meta,
    } as ApiResponse<TagRow>;
  }

  async getTagsForItem(itemId: string): Promise<TagRow[]> {
    const { data, error } = await this.supabaseService
      .getAnonClient()
      .from("storage_item_tags")
      .select("tags(*)")
      .eq("item_id", itemId);

    if (error) throw new Error(error.message);

    return data.map((entry) => entry.tags as unknown as TagRow);
  }

  // Create a new tag
  async createTag(req: AuthRequest, tagData: TagRow): Promise<TagRow> {
    const supabase = req.supabase;
    const { data, error } = await supabase
      .from("tags")
      .insert(tagData)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async assignTagsToItem(
    req: AuthRequest,
    itemId: string,
    tagIds: string[],
  ): Promise<void> {
    const supabase = req.supabase;
    // Remove all current tags from item
    const { error: deleteError } = await supabase
      .from("storage_item_tags")
      .delete()
      .eq("item_id", itemId);

    if (deleteError) throw new Error(deleteError.message);

    // Prepare bulk insert
    const insertData = tagIds.map((tagId) => ({
      item_id: itemId,
      tag_id: tagId,
    }));

    const { error: insertError } = await supabase
      .from("storage_item_tags")
      .insert(insertData);

    if (insertError) throw new Error(insertError.message);
  }

  async updateTag(
    req: AuthRequest,
    id: string,
    tagData: TagUpdate,
  ): Promise<TagRow> {
    const supabase = req.supabase;
    const { data, error } = await supabase
      .from("tags")
      .update(tagData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    console.log("Updated tag:", data);
    console.log("error:", error);
    return data;
  }

  async removeTagFromItem(
    req: AuthRequest,
    itemId: string,
    tagId: string,
  ): Promise<void> {
    const supabase = req.supabase;
    const { error } = await supabase
      .from("storage_item_tags")
      .delete()
      .match({ item_id: itemId, tag_id: tagId });

    if (error) throw new Error(error.message);
  }

  async deleteTag(req: AuthRequest, id: string): Promise<void> {
    const supabase = req.supabase;
    // Remove tag from all items
    const { error: deleteRefsError } = await supabase
      .from("storage_item_tags")
      .delete()
      .eq("tag_id", id);

    if (deleteRefsError) throw new Error(deleteRefsError.message);

    // Delete the tag itself
    const { error: deleteTagError } = await supabase
      .from("tags")
      .delete()
      .eq("id", id);

    if (deleteTagError) throw new Error(deleteTagError.message);
  }
}
