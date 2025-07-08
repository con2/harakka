import { Database } from "src/types/supabase.types";
import { Translations } from "./translations.types";

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
export type BookingsRow = Database["public"]["Tables"]["orders"]["Row"];

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

export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

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

export type BookingTable = Database["public"]["Tables"]["orders"];
export type BookingRow = Database["public"]["Tables"]["orders"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type BookingUpdate = Database["public"]["Tables"]["orders"]["Update"];
export type ValidBookingOrder =
  | "created_at"
  | "order_number"
  | "payment_status"
  | "status"
  | "final_amount"
  | "full_name";

export type BookingStatus =
  | "confirmed"
  | "cancelled by admin"
  | "deleted"
  | "rejected"
  | "completed"
  | "pending"
  | "cancelled by user";
