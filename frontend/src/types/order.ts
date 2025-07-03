import { BaseEntity, ErrorContext } from "./common";
import { ItemTranslation } from "./item";
import { Database } from "./supabase.types";

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
export type PaymentStatus =
  | "invoice-sent"
  | "paid"
  | "payment-rejected"
  | "overdue"
  | null;

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
  storage_items?: {
    location_id?: string;
    translations?: {
      fi: ItemTranslation;
      en: ItemTranslation;
    };
  };
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
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

export type BookingsTable = Database["public"]["Tables"]["orders"];
export type BookingsRow = BookingsTable["Row"];

/**
 * Valid values for the /ordered endpoint.
 * Data can be ordered by the following values
 */
export type ValidBookingOrder =
  | "created_at"
  | "order_number"
  | "payment_status"
  | "status"
  | "total"
  | "full_name";

export type BookingStatus =
  | "confirmed"
  | "cancelled by admin"
  | "deleted"
  | "rejected"
  | "completed"
  | "pending"
  | "cancelled by user"
  | "all"

  export type BookingUserView =
  Database["public"]["Views"]["view_bookings_with_user_info"]
  export type BookingUserViewRow = BookingUserView["Row"]