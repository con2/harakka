import { GetCategoriesDto } from "@/types/categories";
import { api } from "../axios";
import {
  Category,
  CategoryInsert,
  CategoryUpdate,
} from "@common/items/categories";
import { ApiResponse, ApiSingleResponse } from "@common/response.types";

/**
 * API service for category endpoints
 */
export const categoriesApi = {
  getAllCategories: (
    args: GetCategoriesDto,
  ): Promise<ApiResponse<Category>> => {
    const query = new URLSearchParams();

    Object.entries(args).forEach(([key, value]) => {
      if (key && value) {
        query.append(key, String(value));
      }
    });

    return api.get(`/categories?${query.toString()}`);
  },

  createCategory: (
    newCategory: CategoryInsert,
  ): Promise<ApiSingleResponse<Category>> =>
    api.post("categories", newCategory),

  updateCategory: (
    id: string,
    updatedCategory: CategoryUpdate,
  ): Promise<ApiSingleResponse<Category>> =>
    api.patch(`/categories/${id}`, updatedCategory),

  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};
