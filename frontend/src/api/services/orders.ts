import { api } from "../axios";

export const ordersApi = {
  // Create a new booking/order from cart items
  createOrder: async (orderData: any) => {
    const response = await api.post("/bookings", orderData);
    return response.data;
  },

  // Get orders for the current user
  getUserOrders: async () => {
    const response = await api.get("/bookings/user");
    return response.data;
  },
};
