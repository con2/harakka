import { Database } from "@common/supabase.types";

export type BookingItemTable = Database["public"]["Tables"]["booking_items"];
export type BookingItem = BookingItemTable["Row"];
export type BookingItemInsert = BookingItemTable["Insert"];
export type BookingItemUpdate = BookingItemTable["Update"];
