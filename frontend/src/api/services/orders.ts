import { api } from "../axios";
import { BookingItem, BookingOrder } from "../../types/orders";

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
    const userId = orderData.user_id;
    console.log("Creating order with user ID:", userId);

    const response = await api.post("/bookings", orderData, {
      headers: {
        "x-user-id": userId || "",
      },
    });
    return response;
  },

  getUserOrders: async (userId: string) => {
    const response = await api.get(`/bookings/user/${userId}`);
    return response;
  },

  // Get all orders (admin only)
  getAllOrders: async (userId: string) => {
    const response = await api.get("/bookings", {
      headers: {
        "x-user-id": userId,
      },
    });
    return response;
  },

  // Confirm an order (admin only)
  confirmOrder: async (orderId: string) => {
    const userId = localStorage.getItem("userId");
    const response = await api.put(
      `/bookings/${orderId}/confirm`,
      {},
      {
        headers: {
          "x-user-id": userId || "",
        },
      },
    );
    return response;
  },

  // Update an existing order
  updateOrder: async (orderId: string, items: BookingItem[]) => {
    const userId = localStorage.getItem("userId");
    const response = await api.put(
      `/bookings/${orderId}/update`,
      { items },
      {
        headers: {
          "x-user-id": userId || "",
        },
      },
    );
    return response;
  },

  // Reject an order (admin only)
  rejectOrder: async (orderId: string) => {
    const userId = localStorage.getItem("userId");
    const response = await api.put(
      `/bookings/${orderId}/reject`,
      {},
      {
        headers: {
          "x-user-id": userId || "",
        },
      },
    );
    return response;
  },

  // Cancel an order (user cancels own order)
  cancelOrder: async (orderId: string): Promise<BookingOrder> => {
    const userId = localStorage.getItem("userId");
    const response = await api.delete(`/bookings/${orderId}/cancel`, {
      headers: {
        "x-user-id": userId || "",
      },
    });
    return response.data;
  },

  // Delete an order (admin only)
  deleteOrder: async (orderId: string) => {
    const userId = localStorage.getItem("userId");
    const response = await api.delete(`/bookings/${orderId}/delete`, {
      headers: {
        "x-user-id": userId || "",
      },
    });
    return response;
  },

  // Process item returns (admin only)
  returnItems: async (orderId: string) => {
    const userId = localStorage.getItem("userId");
    const response = await api.post(
      `/bookings/${orderId}/return`,
      {},
      {
        headers: {
          "x-user-id": userId || "",
        },
      },
    );
    return response;
  },
};
