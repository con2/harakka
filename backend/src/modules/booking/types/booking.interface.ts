import { StorageItemRow } from "src/modules/storage-items/interfaces/storage-item.interface";
import { Translation } from "src/types/booking.types";
import { Database } from "src/types/supabase.types";

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

export type Email = {
  name: string;
  email: string;
  pickupDate: string;
  today: string;
  location: string;
  items: Partial<StorageItemRow>[];
  quantity?: number;
  translations?: Translation[];
};

export type OrderRow = Database["public"]["Tables"]["order_items"]["Row"];
