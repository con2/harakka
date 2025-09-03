import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { ExtendedTag, TagRow, TagUpdate } from "@common/items/tag.types";
import { Database } from "@common/database.types";
import { ApiResponse } from "@common/response.types";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";
import { TagLink } from "@common/items/storage-items.types";

@Injectable()
export class TagService {
  private _supabase: SupabaseClient<Database>;

  constructor(private supabaseService: SupabaseService) {
    this._supabase =
      this.supabaseService.getAnonClient() as SupabaseClient<Database>;
  }
  // Fetch all tags
  async getAllTags(
    page: number,
    limit: number,
    searchTerm?: string,
    assignmentFilter?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<ApiResponse<ExtendedTag>> {
    const supabase = this._supabase;

    // Get tag IDs based on assignment filter
    const { from, to } = getPaginationRange(page, limit);

    // Build the base query
    let query = supabase
      .from("view_tag_popularity")
      .select("*", { count: "exact" })
      .range(from, to);

    // Apply search filter if searchTerm exists
    if (searchTerm && searchTerm.trim() !== "") {
      const term = `%${searchTerm.toLowerCase()}%`;
      query = query.or(
        `translations->fi->>name.ilike.${term},translations->en->>name.ilike.${term}`,
      );
    }

    // Apply sorting
    const validSortFields = [
      "created_at",
      "updated_at",
      "assigned_to",
      "total_bookings",
      "popularity_rank",
    ];
    const validSortOrders = ["asc", "desc"];

    const field = validSortFields.includes(sortBy || "")
      ? sortBy
      : "created_at";
    const order = validSortOrders.includes(sortOrder || "")
      ? sortOrder
      : "desc";

    query = query.order(field as "created_at" | "updated_at", {
      ascending: order === "asc",
    });

    // assignment filter
    if (assignmentFilter === "assigned") {
      query = query.gte("assigned_to", 1);
    } else if (assignmentFilter === "unassigned") {
      query = query.lt("assigned_to", 1);
    }

    // Get count
    const result = await query;
    const { error: countError, count, data } = result;
    if (countError) throw new Error(countError.message);

    const meta = getPaginationMeta(count ?? 0, page, limit);

    return {
      data: data as unknown as ExtendedTag[],
      error: result.error,
      count: result.count,
      status: result.status,
      statusText: result.statusText,
      metadata: meta,
    };
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
    const { data, error }: PostgrestSingleResponse<TagRow> = await supabase
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

  async assignTagsToBulk(req: AuthRequest, payload: TagLink[]) {
    try {
      const supabase = req.supabase;
      const { error } = await supabase
        .from("storage_item_tags")
        .insert(payload);
      if (error) throw error;
    } catch (error) {
      return error;
    }
  }

  async updateTag(
    req: AuthRequest,
    id: string,
    tagData: TagUpdate,
  ): Promise<TagRow> {
    const supabase = req.supabase;
    const { data, error }: PostgrestSingleResponse<TagRow> = await supabase
      .from("tags")
      .update(tagData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
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
