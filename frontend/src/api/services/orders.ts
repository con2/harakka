import { Order} from "@/types/order";
import { api } from "../axios";

export const ordersApi = {
    getAllOrders: (): Promise<Order[]> => api.get("/bookings"),
    getOrderById: (id: string): Promise<Order> => api.get(`/bookings/${id}`),
    createOrder: (order: Order): Promise<Order> => api.post("/bookings", order),
    updateOrder: (id: string, order: Partial<Order>): Promise<Order> => api.put(`/bookings/${id}`, order),
    deleteOrder: (id: string): Promise<void> => api.delete(`/bookings/${id}`)
 };
 