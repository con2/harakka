import { Database } from "@common/database.types";

export type BookingItemsTable = Database["public"]["Tables"]["booking_items"];
export type BookingItemsRow = BookingItemsTable["Row"];
export type BookingItemsInsert = BookingItemsTable["Insert"];
export type BookingItemsUpdate = BookingItemsTable["Update"];
