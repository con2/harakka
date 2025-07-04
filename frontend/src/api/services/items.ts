import { CreateItemDto, Item, UpdateItemDto, ValidItemOrder } from "@/types";
import { api } from "../axios";

/**
 * API service for item-related endpoints
 */
export const itemsApi = {
  /**
   * Get all storage items
   * @returns Promise with an array of items
   */
  getAllItems: (page: number, limit: number) =>
    api.get(`/storage-items?page=${page}&limit=${limit}`),

  /**
   * Get a specific item by ID
   * @param id - Item ID to fetch
   * @returns Promise with the requested item
   */
  getItemById: (id: string): Promise<Item> => api.get(`/storage-items/${id}`),

  /**
   * Create a new item
   * @param item - Item data to create
   * @returns Promise with the created item
   */
  createItem: (item: CreateItemDto): Promise<Item> =>
    api.post("/storage-items", item),

  /**
   * Update an existing item
   * @param id - Item ID to update
   * @param item - Updated item data
   * @returns Promise with the updated item
   */
  updateItem: (id: string, item: UpdateItemDto): Promise<Item> =>
    api.put(`/storage-items/${id}`, item),

  /**
   * Delete an item
   * @param id - Item ID to delete
   */
  deleteItem: (id: string): Promise<void> =>
    api.post(`/storage-items/${id}/soft-delete`),

  /**
   * Get all items with a specific tag
   * @param tagId - Tag ID to filter by
   * @returns Promise with an array of items that have the specified tag
   */
  getItemsByTag: (tagId: string): Promise<Item[]> =>
    api.get(`/storage-items/by-tag/${tagId}`),

  /**
   * Get items available within a specific date range
   * @param startDate - Start date for availability check
   * @param endDate - End date for availability check
   * @returns Promise with an array of available items
   */
  getAvailableItems: (
    startDate?: Date | null,
    endDate?: Date | null,
  ): Promise<Item[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    return api.get(`/storage-items/available?${params.toString()}`);
  },

  canDeleteItem: (
    id: string,
  ): Promise<{ deletable: boolean; reason?: string }> =>
    api.post(`/storage-items/${id}/can-delete`),

  getOrderedItems: (
    ordered_by: ValidItemOrder = "item_name",
    ascending: boolean = true,
    page: number,
    limit: number,
    searchquery?: string,
  ) => {
    let call = `/storage-items/ordered?order=${ordered_by}&page=${page}&limit=${limit}&ascending=${ascending}`;
    if (searchquery) call += `&search=${searchquery}`;
    return api.get(call);
  },
};
