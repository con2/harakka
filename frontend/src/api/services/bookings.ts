import { ApiResponse } from "@/types/response.types";
import { api } from "../axios";
import { BookingItem, Booking, CreateBookingDto, ValidBooking } from "@/types";
import { BookingStatus, BookingUserView } from "../../types/booking";

/**
 * API service for booking-related endpoints
 */
export const bookingsApi = {
  /**
   * Create a new booking from cart items
   * @param bookingData - Booking data including items
   * @returns Promise with created booking
   */
  createBooking: async (bookingData: CreateBookingDto): Promise<Booking> => {
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
  ): Promise<ApiResponse<Booking>> => {
    return api.get(`/bookings/user/${userId}?page=${page}&limit=${limit}`);
  },

  /**
   * Get all bookings (admin only)
   * @param userId - Admin user ID for authorization
   * @returns Promise with all bookings
   */
  getAllBookings: async (
    page: number,
    limit: number,
  ): Promise<ApiResponse<Booking>> => {
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
    items: BookingItem[],
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
   * Update payment status of an booking (admin only)
   * @param bookingId - booking ID to update
   * @param status - New payment status
   * @returns Promise with confirmation message
   */
  updatePaymentStatus: async (
    bookingId: string,
    status: "invoice-sent" | "paid" | "payment-rejected" | "overdue" | null,
  ): Promise<{ bookingId: string; status: string }> => {
    await api.patch(`/bookings/payment-status`, { bookingId, status });
    return { bookingId, status: status ?? "" };
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
    ordered_by: ValidBooking,
    ascending: boolean = true,
    page: number,
    limit: number,
    searchquery?: string,
    status_filter?: BookingStatus,
  ): Promise<ApiResponse<BookingUserView>> => {
    let call = `/bookings/ordered?booking=${ordered_by}&ascending=${ascending}&page=${page}&limit=${limit}`;
    if (searchquery) call += `&search=${searchquery}`;
    if (status_filter) call += `&status=${status_filter}`;
    return await api.get(call);
  },
};
