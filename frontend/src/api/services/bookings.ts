import { ApiResponse, ApiSingleResponse } from "@common/response.types";
import { api } from "../axios";
import {
  CreateBookingDto,
  CreateBookingResponse,
  ValidBookingOrder,
} from "@/types";
import {
  BookingItemWithDetails,
  BookingPreview,
  BookingStatus,
} from "../../types/booking";
import { BookingItemUpdate } from "@common/bookings/booking-items.types";
import { Booking } from "@common/bookings/booking.types";

/**
 * API service for booking-related endpoints
 */
export const bookingsApi = {
  /**
   * Create a new booking from cart items
   * @param bookingData - Booking data including items
   * @returns Promise with created booking response
   */
  createBooking: async (
    bookingData: CreateBookingDto,
  ): Promise<CreateBookingResponse> => {
    return api.post("/bookings", bookingData);
  },

  /**
   * Get bookings for a specific user
   * @param userId - User ID to fetch bookings for
   * @returns Promise with user's bookings
   */
  getUserBookings: async (
    userId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<ApiResponse<BookingPreview>> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status) params.append("status", status);
    return api.get(`/bookings/user/${userId}?${params.toString()}`);
  },

  /**
   * Get bookings for the current authenticated user
   * @param activeOrgId - Active organization ID
   * @param activeRole - Active role of the user
   * @param userId - User ID to fetch bookings for
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @returns Promise with the user's bookings
   */
  getOwnBookings: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<BookingPreview>> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    return api.get(`/bookings/my`);
  },

  /**
   * Get bookings for a specific user
   * @param user_id - User ID of booking
   * @param booking_id ID of the booking to fetch
   * @returns Promise with user's bookings
   */
  getBookingByID: async (
    booking_id: string,
    orgId: string,
  ): Promise<ApiSingleResponse<BookingPreview>> => {
    return api.get(
      `/bookings/id/${booking_id}?org_id=${encodeURIComponent(orgId)}`,
    );
  },

  /**
   * Get items for a booking. Does not retrieve the booking itself.
   * Use only if booking data has already been retrieved, or if only the booking-item data is needed.
   * @param booking_id
   * @returns
   */
  getBookingItems: async (
    booking_id: string,
    item_details: string[] = ["translations"],
    orgId?: string,
  ): Promise<ApiResponse<BookingItemWithDetails>> => {
    const base = `/booking-items/${booking_id}?item-details=${item_details.join(",")}`;
    return api.get(
      orgId ? `${base}&org_id=${encodeURIComponent(orgId)}` : base,
    );
  },

  /**
   * Get all bookings (admin only)
   * @returns Promise with all bookings
   */
  getAllBookings: async (
    page: number,
    limit: number,
  ): Promise<ApiResponse<BookingPreview>> => {
    return api.get(`/bookings?page=${page}&limit=${limit}`);
  },

  /**
   * Confirm an booking (admin only)
   * @param bookingId - booking ID to confirm
   * @returns Promise with updated booking
   */
  confirmBooking: async (bookingIdId: string): Promise<{ message: string }> => {
    return api.put(`/bookings/${bookingIdId}/confirm`);
  },

  /**
   * Confirm booking items for the active organization
   */
  confirmBookingForOrg: async (
    bookingId: string,
    orgId: string,
    itemIds?: string[],
  ): Promise<{ message: string }> => {
    return api.put(
      `/bookings/${bookingId}/confirm-for-org?org_id=${encodeURIComponent(
        orgId,
      )}`,
      itemIds && itemIds.length > 0 ? { item_ids: itemIds } : undefined,
    );
  },

  /**
   * Update an existing booking
   * @param bookingIdId - booking ID to update
   * @param items - Updated items data
   * @returns Promise with updated booking
   */
  updateBooking: async (
    bookingId: string,
    items: BookingItemUpdate[],
  ): Promise<Booking> => {
    return api.put(`/bookings/${bookingId}/update`, { items });
  },

  /**
   * Reject an booking (admin only)
   * @param bookingId - booking ID to reject
   * @returns Promise with updated booking
   */
  rejectBooking: async (bookingId: string): Promise<{ message: string }> => {
    return api.put(`/bookings/${bookingId}/reject`);
  },

  /**
   * Reject booking items for the active organization (uses x-org-id header)
   */
  rejectBookingForOrg: async (
    bookingId: string,
    orgId: string,
    itemIds?: string[],
  ): Promise<{ message: string }> => {
    return api.put(
      `/bookings/${bookingId}/reject-for-org?org_id=${encodeURIComponent(
        orgId,
      )}`,
      itemIds && itemIds.length > 0 ? { item_ids: itemIds } : undefined,
    );
  },

  /**
   * Confirm booking items for an org; if itemIds provided, only those are confirmed.
   */
  confirmItemsForOrg: async (
    bookingId: string,
    orgId: string,
    itemIds?: string[],
  ): Promise<{ message: string }> => {
    return api.put(
      `/bookings/${bookingId}/confirm-for-org?org_id=${encodeURIComponent(
        orgId,
      )}`,
      itemIds,
    );
  },

  /**
   * Reject booking items for an org; if itemIds provided, only those are rejected.
   */
  rejectItemsForOrg: async (
    bookingId: string,
    orgId: string,
    itemIds?: string[],
  ): Promise<{ message: string }> => {
    return api.put(
      `/bookings/${bookingId}/reject-for-org?org_id=${encodeURIComponent(
        orgId,
      )}`,
      itemIds,
    );
  },

  /**
   * Cancel an booking (user cancels own booking)
   * @param bookingId - booking ID to cancel
   * @returns Promise with updated booking
   */
  cancelBooking: async (bookingId: string): Promise<{ message: string }> => {
    return api.delete(`/bookings/${bookingId}/cancel`);
  },

  /**
   * Delete an booking (admin only)
   * @param bookingId - booking ID to delete
   * @returns Promise with the deleted booking ID
   */
  deleteBooking: async (bookingId: string): Promise<string> => {
    await api.delete(`/bookings/${bookingId}/delete`);
    return bookingId; // Return the ID for state management
  },

  /**
   * Process item returns (admin only)
   * @param bookingId - booking ID to process returns for
   * @param itemIds - Optional. Item IDs to mark as returned. If omitted, all picked up items are marked as "returned".
   * @returns Promise with updated booking
   */
  returnItems: async (
    bookingId: string,
    itemIds?: string[],
    location_id?: string,
    org_id?: string,
  ): Promise<Booking> => {
    return api.patch(`/bookings/${bookingId}/return`, {
      itemIds,
      location_id,
      org_id,
    });
  },

  /**
   * Process item returns (admin only)
   * @param bookingId - booking ID to process returns for
   * @param itemIds - Optional. Item IDs to mark as picked up. If omitted, all picked up items are marked as "picked_up".
   * @returns Promise with updated booking
   */
  pickUpItems: async (
    bookingId: string,
    location_id?: string,
    org_id?: string,
    itemIds?: string[],
  ): Promise<Booking> => {
    return api.patch(`/bookings/${bookingId}/pickup`, {
      itemIds,
      location_id,
      org_id,
    });
  },

  /**
   * Mark items as cancelled from a booking.
   * Meaning they will not be picked up
   * @param bookingId ID of booking which to cancel items from
   * @param itemIds Items which to cancel from the booking
   */
  cancelBookingItems: async (
    bookingId: string,
    itemIds?: string[],
  ): Promise<Booking> => {
    return api.patch(`/bookings/${bookingId}/cancel`, itemIds);
  },

  /**
   * Get ordered and filtered bookings.
   * @param order_by What column to order the columns by. Default "booking_number"
   * @param ascending If to sort booking smallest-largest (e.g a-z) or descending (z-a). Default true / ascending.
   * @param page What page number is requested
   * @param limit How many rows to retrieve
   * @param ascending If to sort booking smallest-largest (e.g a-z) or descending (z-a). Default true / ascending.
   * @param searchquery Optional. Filter bookings by a string
   * @param status_filter Optional. What status to filter the bookings by
   */
  getOrderedBookings: async (
    ordered_by: ValidBookingOrder,
    ascending: boolean,
    page: number,
    limit: number,
    searchquery?: string,
    status_filter?: BookingStatus,
    orgId?: string,
  ): Promise<ApiResponse<BookingPreview>> => {
    let call = `/bookings/ordered?order=${ordered_by}&ascending=${ascending}&page=${page}&limit=${limit}`;
    if (searchquery) call += `&search=${searchquery}`;
    if (status_filter) call += `&status=${status_filter}`;
    if (orgId) call += `&org_id=${encodeURIComponent(orgId)}`;
    return await api.get(call);
  },

  /**
   * Get total amount of bookings in the system (active and inactive)
   * @returns number
   */
  getBookingsCount: async (): Promise<ApiSingleResponse<number>> => {
    return await api.get(`/bookings/count`);
  },

  /**
   * Get overdue bookings (admin only; scoped by active organization via headers)
   */
  getOverdueBookings: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<OverdueBookingRow>> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    return api.get(`/bookings/overdue?${params.toString()}`);
  },

  /**
   * Update the self-pickup status of a booking
   * Only updates PER org and PER location.
   */
  updateSelfPickup: async (
    bookingId: string,
    location_id: string,
    newStatus: boolean,
  ): Promise<{ message: string }> => {
    return await api.patch(`bookings/${bookingId}/self-pickup`, {
      location_id,
      newStatus,
    });
  },

  /**
   * Update a specific booking item (quantity, dates, status)
   * @param bookingItemId - ID of the booking item to update
   * @param updates - Fields to update
   */
  updateBookingItem: async (
    bookingItemId: string,
    updates: BookingItemUpdate,
  ): Promise<BookingItemWithDetails> => {
    const response = await api.patch(
      `/booking-items/${bookingItemId}`,
      updates,
    );
    return response.data;
  },

  /**
   * Remove a specific booking item from a booking (soft delete)
   * @param bookingId - ID of the booking
   * @param bookingItemId - ID of the booking item to remove
   */
  removeBookingItem: async (
    bookingId: string,
    bookingItemId: string,
  ): Promise<BookingItemWithDetails> => {
    const response = await api.delete(
      `/booking-items/${bookingId}/${bookingItemId}`,
    );
    return response.data;
  },

  /**
   * Permanently delete a specific booking item from a booking (admin only)
   * @param bookingId - ID of the booking
   * @param bookingItemId - ID of the booking item to permanently delete
   */
  deleteBookingItem: async (
    bookingId: string,
    bookingItemId: string,
  ): Promise<BookingItemWithDetails> => {
    const response = await api.delete(
      `/booking-items/${bookingId}/${bookingItemId}/permanent`,
    );
    return response.data;
  },
};

// Types for overdue view rows
export type OverdueBookingRow = {
  booking_id: string;
  booking_number: string;
  user_id: string;
  full_name: string | null;
  user_email: string | null;
  earliest_due_date: string; // ISO or YYYY-MM-DD
  days_overdue: number;
};
