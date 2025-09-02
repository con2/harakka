import { api } from "../axios";
import { CategoryInsert, CategoryUpdate } from "@common/items/categories";

/**
 * API service for category endpoints
 */
export const categoriesApi = {
  getAllCategories: (page: number, limit: number) =>
    api.get(`categories?page=${page}&limit=${limit}`),

  createCategory: (newCategory: CategoryInsert) =>
    api.post("categories", newCategory),

  updateCategory: (id: string, updatedCategory: CategoryUpdate) =>
    api.patch(`/categories/${id}`, updatedCategory),

  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};
