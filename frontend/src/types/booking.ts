import { BookingItem } from "@common/bookings/booking-items.types";
import { BaseEntity, ErrorContext, Translatable } from "./common";
import { ItemTranslation } from "./item";
import { Database } from "@common/supabase.types";
import { StripNull } from "@common/helper.types";

/**
 * Booking status values
 */
export type BookingStatus =
  | Database["public"]["Enums"]["booking_status"]
  | "all";

/**
 * Order entity representing a booking in the system
 */
export interface BookingType extends BaseEntity {
  user_id: string;
  booking_number: string;
  status: BookingStatus;
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
  userBookings: ExtendedBookingPreview[];
  loading: boolean;
  error: string | null;
  errorContext: ErrorContext;
  currentBooking: Partial<BookingWithDetails> | null;
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
    location_id: string;
    provider_organization_id: string;
  }[];
}

/**
 * Response from creating a booking - includes full booking details
 */
export interface CreateBookingResponse {
  message: string;
  booking: BookingWithDetails;
  warning?: string;
}

/**
 * Booking details from view_bookings_with_details database view
 */
export type BookingDetailsView =
  Database["public"]["Views"]["view_bookings_with_details"]["Row"];

export type BookingsTable = Database["public"]["Tables"]["bookings"];
export type BookingsRow = BookingsTable["Row"];

/**
 * Valid values for the /ordered endpoint.
 * Data can be ordered by the following values
 */
export type ValidBookingOrder =
  | "created_at"
  | "booking_number"
  | "status"
  | "full_name"
  | "start_date";

export type BookingUserView =
  Database["public"]["Views"]["view_bookings_with_user_info"];
export type BookingUserViewRow = BookingUserView["Row"];

/* Non-nullable type of the BookingUserViewRow */
export type BookingPreview = StripNull<BookingUserViewRow>;
export type ExtendedBookingPreview = BookingPreview & {
  orgs: {
    name: string;
    id: string;
    org_booking_status: BookingStatus;
    locations: {
      name: string;
      id: string;
      self_pickup: boolean;
      pickup_status: BookingStatus;
    }[];
  }[];
};

export type BookingWithDetails = BookingPreview & {
  booking_items: BookingItemWithDetails[] | null;
  notes?: string | null; // Add notes property
  org_status_for_active_org?: string;
  booked_by_org?: string | null;
  has_items_from_multiple_orgs?: boolean;
};

export type BookingItemWithDetails = BookingItem & {
  storage_items: Translatable<ItemTranslation>;
  org_name: string;
};
