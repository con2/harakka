import { api } from "../axios";
import { BookingItem, BookingOrder, CreateOrderDto } from "@/types";

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
    const userId = orderData.user_id;
    return api.post("/bookings", orderData, {
      headers: {
        "x-user-id": userId || "",
      },
    });
  },

  /**
   * Get orders for a specific user
   * @param userId - User ID to fetch orders for
   * @returns Promise with user's orders
   */
  getUserOrders: async (userId: string): Promise<BookingOrder[]> => {
    return api.get(`/bookings/user/${userId}`);
  },

  /**
   * Get all orders (admin only)
   * @param userId - Admin user ID for authorization
   * @returns Promise with all orders
   */
  getAllOrders: async (userId: string): Promise<BookingOrder[]> => {
    return api.get("/bookings", {
      headers: {
        "x-user-id": userId,
      },
    });
  },

  /**
   * Confirm an order (admin only)
   * @param orderId - Order ID to confirm
   * @returns Promise with updated order
   */
  confirmOrder: async (orderId: string): Promise<{ message: string }> => {
    const userId = localStorage.getItem("userId");
    return api.put(
      `/bookings/${orderId}/confirm`,
      {},
      {
        headers: {
          "x-user-id": userId || "",
        },
      },
    );
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
    const userId = localStorage.getItem("userId");
    return api.put(
      `/bookings/${orderId}/update`,
      { items },
      {
        headers: {
          "x-user-id": userId || "",
        },
      },
    );
  },

  /**
   * Reject an order (admin only)
   * @param orderId - Order ID to reject
   * @returns Promise with updated order
   */
  rejectOrder: async (orderId: string): Promise<{ message: string }> => {
    const userId = localStorage.getItem("userId");
    return api.put(
      `/bookings/${orderId}/reject`,
      {},
      {
        headers: {
          "x-user-id": userId || "",
        },
      },
    );
  },

  /**
   * Cancel an order (user cancels own order)
   * @param orderId - Order ID to cancel
   * @returns Promise with updated order
   */
  cancelOrder: async (orderId: string): Promise<{ message: string }> => {
    const userId = localStorage.getItem("userId");
    return api.delete(`/bookings/${orderId}/cancel`, {
      headers: {
        "x-user-id": userId || "",
      },
    });
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
    status: "invoice-sent" | "paid" | "payment-rejected" | "overdue" | "N/A",
  ): Promise<{ orderId: string; status: string }> => {
    const userId = localStorage.getItem("userId");

    await api.patch(
      `/bookings/payment-status`,
      { orderId, status },
      {
        headers: {
          "x-user-id": userId || "",
        },
      },
    );
    return { orderId, status };
  },
};
