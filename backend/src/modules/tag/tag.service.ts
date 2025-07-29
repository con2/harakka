import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { TagRow, TagUpdate } from "./interfaces/tag.interface";
import { Database } from "../../../../common/database.types";
import { ApiResponse } from "../../../../common/response.types";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";

@Injectable()
export class TagService {
  private _supabase: SupabaseClient<Database>;

  constructor(private supabaseService: SupabaseService) {
    this._supabase =
      this.supabaseService.getServiceClient() as SupabaseClient<Database>;
  }
  // Fetch all tags
  async getAllTags(
    page: number,
    limit: number,
    searchTerm?: string,
    assignmentFilter?: string,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<ApiResponse<TagRow>> {
    const supabase = this._supabase;
    let tagIds: string[] = [];
    let shouldFilterByIds = false;

    // Get tag IDs based on assignment filter
    if (assignmentFilter === "assigned") {
      // Get tags that are assigned to at least one item
      const { data: assignedTagsData, error: assignedError } = await supabase
        .from("storage_item_tags")
        .select("tag_id")
        .not("tag_id", "is", null);

      if (assignedError) throw new Error(assignedError.message);

      tagIds = [...new Set(assignedTagsData?.map((item) => item.tag_id) || [])];
      shouldFilterByIds = true;
    } else if (assignmentFilter === "unassigned") {
      // Get all tag IDs first
      const { data: allTagsData, error: allTagsError } = await supabase
        .from("tags")
        .select("id");

      if (allTagsError) throw new Error(allTagsError.message);

      // Get assigned tag IDs
      const { data: assignedTagsData, error: assignedError } = await supabase
        .from("storage_item_tags")
        .select("tag_id")
        .not("tag_id", "is", null);

      if (assignedError) throw new Error(assignedError.message);

      const assignedTagIds = new Set(
        assignedTagsData?.map((item) => item.tag_id) || [],
      );
      tagIds =
        allTagsData
          ?.filter((tag) => !assignedTagIds.has(tag.id))
          .map((tag) => tag.id) || [];
      shouldFilterByIds = true;
    }

    // Build the base query
    let query = supabase.from("tags").select("*", { count: "exact" });

    // Apply assignment filter
    if (shouldFilterByIds) {
      if (tagIds.length === 0) {
        // No tags match the filter, return empty result
        return {
          data: [],
          error: null,
          count: 0,
          status: 200,
          statusText: "OK",
          metadata: {
            total: 0,
            page,
            totalPages: 0,
            limit,
          },
        };
      }
      query = query.in("id", tagIds);
    }

    // Apply search filter if searchTerm exists
    if (searchTerm && searchTerm.trim() !== "") {
      const term = `%${searchTerm.toLowerCase()}%`;
      query = query.or(
        `translations->fi->>name.ilike.${term},translations->en->>name.ilike.${term}`,
      );
    }

    // Apply sorting
    const validSortFields = ["created_at", "updated_at"];
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

    // Get count
    const { count, error: countError } = await query;

    if (countError) throw new Error(countError.message);

    // Fetch paginated data
    const { from, to } = getPaginationRange(page, limit);
    const result = await query.range(from, to);

    if (result.error) throw new Error(result.error.message);

    const meta = getPaginationMeta(count ?? 0, page, limit);

    return {
      data: result.data as TagRow[],
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

  async assignTagsToItems(
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

  async assignTagsToBulk(
    req: AuthRequest,
    payload:
      | { itemId: string; tagIds: string[] }
      | { itemId: string; tagIds: string[] }[],
  ) {
    const supabase = req.supabase;

    const { error } = await supabase.from("storage_item_tags").insert(payload);
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
