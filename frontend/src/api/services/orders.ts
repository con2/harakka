import { ApiResponse } from "@/types/response.types";
import { api } from "../axios";
import {
  BookingItem,
  BookingOrder,
  CreateOrderDto,
  ValidBookingOrder,
} from "@/types";
import { BookingStatus, BookingUserView } from "../../types/order";

/**
 * API service for order-related endpoints
 */
export const ordersApi = {
  /**
   * Create a new booking/order from cart items
   * @param orderData - Order data including items
   * @returns Promise with created order
   */
  createOrder: async (orderData: CreateOrderDto): Promise<BookingOrder> => {
    return api.post("/bookings", orderData);
  },

  /**
   * Get orders for a specific user
   * @param userId - User ID to fetch orders for
   * @returns Promise with user's orders
   */
  getUserOrders: async (
    userId: string,
    page: number,
    limit: number,
  ): Promise<ApiResponse<BookingOrder>> => {
    return api.get(`/bookings/user/${userId}?page=${page}&limit=${limit}`);
  },

  /**
   * Get all orders (admin only)
   * @param userId - Admin user ID for authorization
   * @returns Promise with all orders
   */
  getAllOrders: async (
    page: number,
    limit: number,
  ): Promise<ApiResponse<BookingOrder>> => {
    return api.get(`/bookings?page=${page}&limit=${limit}`);
  },

  /**
   * Confirm an order (admin only)
   * @param orderId - Order ID to confirm
   * @returns Promise with updated order
   */
  confirmOrder: async (orderId: string): Promise<{ message: string }> => {
    return api.put(`/bookings/${orderId}/confirm`);
  },

  /**
   * Update an existing order
   * @param orderId - Order ID to update
   * @param items - Updated items data
   * @returns Promise with updated order
   */
  updateOrder: async (
    orderId: string,
    items: BookingItem[],
  ): Promise<BookingOrder> => {
    return api.put(`/bookings/${orderId}/update`, { items });
  },

  /**
   * Reject an order (admin only)
   * @param orderId - Order ID to reject
   * @returns Promise with updated order
   */
  rejectOrder: async (orderId: string): Promise<{ message: string }> => {
    return api.put(`/bookings/${orderId}/reject`);
  },

  /**
   * Cancel an order (user cancels own order)
   * @param orderId - Order ID to cancel
   * @returns Promise with updated order
   */
  cancelOrder: async (orderId: string): Promise<{ message: string }> => {
    return api.delete(`/bookings/${orderId}/cancel`);
  },

  /**
   * Delete an order (admin only)
   * @param orderId - Order ID to delete
   * @returns Promise with the deleted order ID
   */
  deleteOrder: async (orderId: string): Promise<string> => {
    const userId = localStorage.getItem("userId");
    await api.delete(`/bookings/${orderId}/delete`, {
      headers: {
        "x-user-id": userId || "",
      },
    });
    return orderId; // Return the ID for state management
  },

  /**
   * Process item returns (admin only)
   * @param orderId - Order ID to process returns for
   * @returns Promise with updated order
   */
  returnItems: async (orderId: string): Promise<BookingOrder> => {
    const userId = localStorage.getItem("userId");
    return api.post(
      `/bookings/${orderId}/return`,
      {},
      {
        headers: {
          "x-user-id": userId || "",
        },
      },
    );
  },

  /**
   * Check availability of items for a specific date range
   * @param itemId - Item ID to check availability for
   * @param startDate - Start date for the booking
   * @param endDate - End date for the booking
   * @returns Promise with availability details
   */
  checkAvailability: (
    itemId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    item_id: string;
    availableQuantity: number;
    alreadyBookedQuantity: number;
    totalQuantity: number;
  }> => {
    return api.get(
      `/bookings/availability/${itemId}?start_date=${encodeURIComponent(
        startDate,
      )}&end_date=${encodeURIComponent(endDate)}`,
    );
  },

  /**
   * Update payment status of an order (admin only)
   * @param orderId - Order ID to update
   * @param status - New payment status
   * @returns Promise with confirmation message
   */
  updatePaymentStatus: async (
    orderId: string,
    status: "invoice-sent" | "paid" | "payment-rejected" | "overdue" | null,
  ): Promise<{ orderId: string; status: string }> => {
    await api.patch(`/bookings/payment-status`, { orderId, status });
    return { orderId, status: status ?? "" };
  },

  /**
   * Get ordered and filtered bookings.
   * @param order_by What column to order the columns by. Default "order_number"
   * @param ascending If to sort order smallest-largest (e.g a-z) or descending (z-a). Default true / ascending.
   * @param page What page number is requested
   * @param limit How many rows to retrieve
   * @param ascending If to sort order smallest-largest (e.g a-z) or descending (z-a). Default true / ascending.
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
  ): Promise<ApiResponse<BookingUserView>> => {
    let call = `/bookings/ordered?order=${ordered_by}&ascending=${ascending}&page=${page}&limit=${limit}`;
    if (searchquery) call += `&search=${searchquery}`;
    if (status_filter) call += `&status=${status_filter}`;
    return await api.get(call);
  },
};
