import { Database } from "src/types/supabase.types";

export type BookingItemsTable = Database["public"]["Tables"]["order_items"];
export type BookingItemsRow = BookingItemsTable["Row"];
export type BookingItemsInsert = BookingItemsTable["Insert"];
export type BookingItemsUpdate = BookingItemsTable["Update"];
