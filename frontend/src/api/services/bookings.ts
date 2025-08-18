import { ApiResponse, ApiSingleResponse } from "@common/response.types";
import { api } from "../axios";
import { CreateBookingDto, ValidBookingOrder } from "@/types";
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
   * @returns Promise with created booking
   */
  createBooking: async (
    bookingData: CreateBookingDto,
  ): Promise<BookingPreview> => {
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
   * Get bookings for a specific user
   * @param user_id - User ID of booking
   * @param booking_id ID of the booking to fetch
   * @returns Promise with user's bookings
   */
  getBookingByID: async (
    booking_id: string,
  ): Promise<ApiSingleResponse<BookingPreview>> => {
    return api.get(`/booking-items/${booking_id}`);
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
  ): Promise<ApiResponse<BookingItemWithDetails>> => {
    return api.get(
      `/booking-items/${booking_id}?item-details=${item_details.join(",")}`,
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
    const userId = localStorage.getItem("userId");
    await api.delete(`/bookings/${bookingId}/delete`, {
      headers: {
        "x-user-id": userId || "",
      },
    });
    return bookingId; // Return the ID for state management
  },

  /**
   * Process item returns (admin only)
   * @param bookingId - booking ID to process returns for
   * @returns Promise with updated booking
   */
  returnItems: async (bookingId: string): Promise<Booking> => {
    const userId = localStorage.getItem("userId");
    return api.post(
      `/bookings/${bookingId}/return`,
      {},
      {
        headers: {
          "x-user-id": userId || "",
        },
      },
    );
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
    ascending: boolean = true,
    page: number,
    limit: number,
    searchquery?: string,
    status_filter?: BookingStatus,
  ): Promise<ApiResponse<BookingPreview>> => {
    let call = `/bookings/ordered?order=${ordered_by}&ascending=${ascending}&page=${page}&limit=${limit}`;
    if (searchquery) call += `&search=${searchquery}`;
    if (status_filter) call += `&status=${status_filter}`;
    return await api.get(call);
  },

  /**
   * Get total amount of bookings in the system (active and inactive)
   * @returns number
   */
  getBookingsCount: async (): Promise<ApiSingleResponse<number>> => {
    return await api.get(`/bookings/count`);
  },
};
