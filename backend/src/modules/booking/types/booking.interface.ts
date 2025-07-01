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

export type UserBookingOrder = {
  order_items?: { storage_items?: { location_id?: string } }[];
};
export type OrdersRow = Database["public"]["Tables"]["orders"]["Row"];

export type UserProfilesRow =
  Database["public"]["Tables"]["user_profiles"]["Row"];

export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export type OrderItemInsert =
  Database["public"]["Tables"]["order_items"]["Insert"];

// Row with only the `quantity` field – handy for lightweight queries
export type OrderItemQuantity = Pick<OrderItemRow, "quantity">;

export type StorageItemsRow =
  Database["public"]["Tables"]["storage_items"]["Row"];

export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

export interface CancelBookingResponse {
  message: string;
  orderId: string;
  cancelledBy: "admin" | "user";
  items: {
    item_id: string;
    quantity: number | null;
    start_date: string;
    end_date: string;
  }[];
}

export type OrderWithItems = OrderRow & {
  order_items: (OrderItemRow & {
    storage_items: {
      translations: Translations | null;
    } | null;
  })[];
};
