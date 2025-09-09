import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  CreateParamsDto,
  DeleteParamsDto,
  GetParamsDto,
  UpdateParamsDto,
} from "./dto/params.dto";
import { getPaginationMeta, getPaginationRange } from "@src/utils/pagination";
import { handleSupabaseError } from "@src/utils/handleError.utils";

@Injectable()
export class CategoriesService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get All Categories
   * @param params
   * @returns
   */
  async getCategories(params: GetParamsDto) {
    const supabase = this.supabaseService.getAnonClient();
    const { page, limit, search, asc, order } = params;
    const { from, to } = getPaginationRange(page, limit);

    const query = supabase
      .from("view_category_details")
      .select("*", { count: "exact" })
      .range(from, to);

    const VALID_ORDERS = ["created_at", "assigned_to"];
    if (search)
      query.or(
        `translations->>en.ilike.%${search}%,translations->>fi.ilike.%${search}%`,
      );

    query.order(VALID_ORDERS.includes(order) ? order : "created_at", {
      ascending: asc,
    });

    const result = await query;
    const pagination = getPaginationMeta(result.count, page, limit);
    return { ...result, metadata: pagination };
  }

  /**
   * Create A New Category
   * @param params
   * @returns
   */
  async createCategory(params: CreateParamsDto) {
    const { supabase, newCategory } = params;

    const result = await supabase
      .from("categories")
      .insert(newCategory)
      .select()
      .single();
    if (result.error) handleSupabaseError(result.error);

    return result;
  }

  /**
   * Update Category by ID
   * @param params
   * @returns
   */
  async updateCategory(params: UpdateParamsDto) {
    const { supabase, updateCategory, id } = params;

    const result = await supabase
      .from("categories")
      .update(updateCategory)
      .eq("id", id)
      .select()
      .single();
    if (result.error) handleSupabaseError(result.error);

    return result;
  }

  /**
   * Delete A Category by ID
   * @param params
   * @returns
   */
  async deleteCategory(params: DeleteParamsDto) {
    const { supabase, id } = params;

    const result = await supabase.from("categories").delete().eq("id", id);
    return result;
  }
}
