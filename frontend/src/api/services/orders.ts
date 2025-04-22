import { api } from "../axios";
import { BookingItem } from "../../types/orders";

interface CreateOrderDto {
  user_id: string;
  items: {
    item_id: string;
    quantity: number;
    start_date: string;
    end_date: string;
  }[];
}

export const ordersApi = {
  // Create a new booking/order from cart items
  createOrder: async (orderData: CreateOrderDto) => {
    const response = await api.post("/bookings", orderData);
    return response.data;
  },

  // Get orders for the current user
  getUserOrders: async () => {
    const response = await api.get("/bookings/my");
    return response.data;
  },

  // Get all orders (admin only)
  getAllOrders: async () => {
    const response = await api.get("/bookings");
    return response.data;
  },

  // Confirm an order (admin only)
  confirmOrder: async (orderId: string) => {
    const response = await api.put(`/bookings/${orderId}/confirm`);
    return response.data;
  },

  // Update an existing order
  updateOrder: async (orderId: string, items: BookingItem[]) => {
    const response = await api.put(`/bookings/${orderId}/update`, { items });
    return response.data;
  },

  // Reject an order (admin only)
  rejectOrder: async (orderId: string) => {
    const response = await api.put(`/bookings/${orderId}/reject`);
    return response.data;
  },

  // Cancel an order (user cancels own order)
  cancelOrder: async (orderId: string) => {
    const response = await api.delete(`/bookings/${orderId}/cancel`);
    return response.data;
  },

  // Delete an order (admin only)
  deleteOrder: async (orderId: string) => {
    const response = await api.delete(`/bookings/${orderId}/delete`);
    return response.data;
  },

  // Process item returns (admin only)
  returnItems: async (orderId: string) => {
    const response = await api.post(`/bookings/${orderId}/return`);
    return response.data;
  },
};
