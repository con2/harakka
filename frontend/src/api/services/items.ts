import { CreateItemDto, Item, UpdateItemDto } from "@/types";
import { api } from "../axios";

/**
 * API service for item-related endpoints
 */
export const itemsApi = {
  /**
   * Get all storage items
   * @returns Promise with an array of items
   */
  getAllItems: (): Promise<Item[]> => api.get("/storage-items"),

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
  deleteItem: (id: string): Promise<void> => api.delete(`/storage-items/${id}`),

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
};
