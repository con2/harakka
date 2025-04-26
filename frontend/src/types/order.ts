import { BaseEntity, ErrorContext } from "./common";

/**
 * Order status values
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "paid"
  | "completed"
  | "cancelled"
  | "cancelled by user"
  | "rejected"
  | "refunded";

/**
 * Payment status values
 */
export type PaymentStatus = "pending" | "partial" | "paid" | "refunded";

/**
 * Booked item in an order
 */
export interface BookingItem {
  id?: string;
  item_id: string;
  quantity: number;
  start_date: string;
  end_date: string;
  unit_price?: number;
  total_days?: number;
  subtotal?: number;
  status?: "pending" | "confirmed" | "cancelled";
  location_id?: string;
  item_name?: string;
}

/**
 * Order entity representing a booking in the system
 */
export interface BookingOrder extends BaseEntity {
  user_id: string;
  order_number: string;
  status: OrderStatus;
  total_amount?: number | null;
  discount_amount?: number | null;
  final_amount?: number | null;
  payment_status?: PaymentStatus;
  order_items: BookingItem[];
  user_profile?: {
    name?: string;
    email: string;
  };
}

/**
 * Order state in Redux store
 */
export interface OrdersState {
  entities: Record<string, BookingOrder>;
  ids: string[];
  userOrders: BookingOrder[];
  loading: boolean;
  error: string | null; // Change to simple string like tags
  errorContext: ErrorContext;
  currentOrder: string | null;
}

/**
 * Data required to create a new order
 */
export interface CreateOrderDto {
  user_id: string;
  items: {
    item_id: string;
    quantity: number;
    start_date: string;
    end_date: string;
  }[];
}
