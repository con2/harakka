import { Database } from "@common/supabase.types";
import { Translations } from "./translations.types";
import { BookingPreview } from "@common/bookings/booking.types";

export interface BookingItem {
  item_id: string;
  quantity: number;
  start_date: string;
  end_date: string;
}

export interface BookingRequest {
  user_email?: string; // optional because for ddmin-booking
  items: BookingItem[];
}
export interface EnrichedItem {
  item_id: string;
  quantity: number;
  start_date?: string;
  end_date?: string;
  translations?: {
    fi: { item_name: string };
    en: { item_name: string };
  };
  location_id?: string;
}

export type UserBooking = {
  booking_items?: { storage_items?: { location_id?: string } }[];
};
export type BookingsRow = Database["public"]["Tables"]["bookings"]["Row"];

export type UserProfilesRow =
  Database["public"]["Tables"]["user_profiles"]["Row"];

export type BookingItemRow =
  Database["public"]["Tables"]["booking_items"]["Row"];

export type BookingItemInsert =
  Database["public"]["Tables"]["booking_items"]["Insert"];

// Row with only the `quantity` field – handy for lightweight queries
export type BookingItemQuantity = Pick<BookingItemRow, "quantity">;

export type StorageItemsRow =
  Database["public"]["Tables"]["storage_items"]["Row"];

export interface CancelBookingResponse {
  message: string;
  bookingId: string;
  cancelledBy: "admin" | "user";
  items: {
    item_id: string;
    quantity: number | null;
    start_date: string;
    end_date: string;
  }[];
}

export type BookingWithItems = BookingRow & {
  booking_items: (BookingItemRow & {
    storage_items: {
      translations: Translations | null;
    } | null;
  })[];
};

export type BookingTable = Database["public"]["Tables"]["bookings"];
export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];
export type ValidBookingOrder =
  | "created_at"
  | "booking_number"
  | "status"
  | "final_amount"
  | "full_name"
  | "start_date";

export type BookingWithOrgStatus = BookingPreview & {
  org_status_for_active_org: BookingStatus;
};
export type BookingStatus = Database["public"]["Enums"]["booking_status"];

export type OverdueRow =
  Database["public"]["Views"]["view_bookings_overdue"]["Row"];
