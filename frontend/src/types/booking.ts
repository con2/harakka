import { BookingItem } from "@common/bookings/booking-items.types";
import { Booking } from "@common/bookings/booking.types";
import { BaseEntity, ErrorContext, Translatable } from "./common";
import { ItemTranslation } from "./item";
import { Database } from "@common/database.types";
import { StripNull } from "@common/helper.types";

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
 * Order entity representing a booking in the system
 */
export interface BookingType extends BaseEntity {
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
  bookings: BookingPreview[];
  entities: Record<string, Booking>;
  ids: string[];
  userBookings: BookingPreview[];
  loading: boolean;
  error: string | null; // Change to simple string like tags
  errorContext: ErrorContext;
  currentBooking: BookingWithDetails | null;
  currentBookingLoading: boolean;
  bookings_pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  booking_items_pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  bookingsCount: number;
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

/* Non-nullable type of the BookingUserViewRow */
export type BookingPreview = StripNull<BookingUserViewRow>;

export type BookingWithDetails = BookingPreview & {
  booking_items: BookingItemWithDetails[] | null;
};

export type BookingItemWithDetails = BookingItem & {
  storage_items: Translatable<ItemTranslation>;
};
