import { Database } from "../supabase.types"
import { StripNull } from "../helper.types";

export type BookingUserView =
  Database["public"]["Views"]["view_bookings_with_user_info"];
export type BookingUserViewRow = BookingUserView["Row"];

export type BookingPreview = StripNull<BookingUserViewRow>;

export type BookingTable = Database["public"]["Tables"]["bookings"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
