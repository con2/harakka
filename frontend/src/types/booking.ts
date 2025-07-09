import { BaseEntity, ErrorContext } from "./common";
import { ItemTranslation } from "./item";
import { Database } from "./supabase.types";

/**
 * Booking status values
 */
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "paid"
  | "completed"
  | "cancelled"
  | "cancelled by user"
  | "rejected"
  | "refunded"
  | "all";

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
 * Booked item in an booking
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
export interface Booking extends BaseEntity {
  user_id: string;
  booking_number: string;
  status: BookingStatus;
  total_amount?: number | null;
  discount_amount?: number | null;
  final_amount?: number | null;
  payment_status?: PaymentStatus;
  booking_items: BookingItem[];
  user_profile?: {
    name?: string;
    email: string;
  };
}

/**
 * Booking state in Redux store
 */
export interface BookingsState {
  entities: Record<string, Booking>;
  ids: string[];
  userBookings: Array<Booking | BookingUserViewRow>;
  loading: boolean;
  error: string | null; // Change to simple string like tags
  errorContext: ErrorContext;
  currentBooking: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Data required to create a newbBooking
 */
export interface CreateBookingDto {
  user_id: string;
  items: {
    item_id: string;
    quantity: number;
    start_date: string;
    end_date: string;
  }[];
}

export type BookingsTable = Database["public"]["Tables"]["bookings"];
export type BookingsRow = BookingsTable["Row"];

/**
 * Valid values for the /ordered endpoint.
 * Data can be ordered by the following values
 */
export type ValidBooking =
  | "created_at"
  | "booking_number"
  | "payment_status"
  | "status"
  | "total"
  | "full_name";

export type BookingUserView =
  Database["public"]["Views"]["view_bookings_with_user_info"];
export type BookingUserViewRow = BookingUserView["Row"];
