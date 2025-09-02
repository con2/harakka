import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  CreateParamsDto,
  DeleteParamsDto,
  GetParamsDto,
  UpdateParamsDto,
} from "./dto/params.dto";
import { getPaginationRange } from "@src/utils/pagination";
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
    const { page, limit } = params;
    const { from, to } = getPaginationRange(page, limit);

    const result = await supabase
      .from("categories")
      .select("*")
      .range(from, to);
    return result;
  }

  /**
   * Create A New Category
   * @param params
   * @returns
   */
  async createCategory(params: CreateParamsDto) {
    const { supabase, newCategory } = params;

    const result = await supabase.from("categories").insert(newCategory);
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
      .eq("id", id);
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
