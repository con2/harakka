import { Item, UpdateItemDto, ValidItemOrder } from "@/types";
import { api } from "../axios";
import { ApiSingleResponse } from "@common/response.types";
import { ItemFormData } from "@common/items/form.types";

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
   * Create a new item or multiple items
   * @param item - Item data to create
   * @returns Promise with the created item
   */
  createItems: (
    payload: ItemFormData,
  ): Promise<{ status: number; error: string | null }> =>
    api.post("/storage-items", payload),

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

  /* commented out this code to test
   * Get items available within a specific date range
   * @param startDate - Start date for availability check
   * @param endDate - End date for availability check
   * @returns Promise with an array of available items
   
  getAvailableItems: (
    startDate?: Date | null,
    endDate?: Date | null,
  ): Promise<Item[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    return api.get(`/storage-items/available?${params.toString()}`);
  },*/

  /**
   * Get availability information for a specific item within a date range
   * @param itemId - ID of the item to check
   * @param startDate - Start of the date range
   * @param endDate - End of the date range
   * @returns Promise with item availability information
   */
  checkAvailability: (
    itemId: string,
    startDate: Date,
    enddate: Date,
  ): Promise<{
    item_id: string;
    alreadyBookedQuantity: number;
    availableQuantity: number;
  }> => {
    const params = new URLSearchParams({
      start_date: startDate.toISOString(),
      end_date: enddate.toISOString(),
    });
    return api
      .get(`/storage-items/availability/${itemId}?${params.toString()}`)
      .then((res) => res.data);
  },

  canDeleteItem: (
    id: string,
  ): Promise<{ deletable: boolean; reason?: string }> =>
    api.post(`/storage-items/${id}/can-delete`),

  getOrderedItems: (
    ordered_by: ValidItemOrder = "created_at",
    ascending: boolean = true,
    page: number,
    limit: number,
    searchquery?: string,
    tag_filters?: string[],
    activity_filter?: "active" | "inactive",
    location_filter?: string[],
    categories?: string[],
    availability_min?: number,
    availability_max?: number,
    org_ids?: string[] | string,
  ) => {
    const activity = activity_filter === "active" ? true : false;
    let call = `/storage-items/ordered?order=${ordered_by}&page=${page}&limit=${limit}&ascending=${ascending}`;
    if (searchquery) call += `&search=${searchquery}`;
    if (tag_filters) call += `&tags=${tag_filters.join(",")}`;
    if (activity_filter) call += `&active=${activity}`;
    if (location_filter) call += `&location=${location_filter.join(",")}`;
    if (categories) call += `&category=${categories.join(",")}`;
    if (availability_min !== undefined)
      call += `&availability_min=${availability_min}`;
    if (availability_max !== undefined)
      call += `&availability_max=${availability_max}`;
    if (org_ids && (Array.isArray(org_ids) ? org_ids.length > 0 : true)) {
      const orgParam = Array.isArray(org_ids) ? org_ids.join(",") : org_ids;
      call += `&org=${orgParam}`;
    }
    return api.get(call);
  },

  /**
   * Get total amount of bookings in the system (active and inactive)
   * @returns number
   */
  getItemCount: async (): Promise<ApiSingleResponse<number>> => {
    return await api.get(`/storage-items/count`);
  },
};
