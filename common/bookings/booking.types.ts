import { Database } from "../supabase.types";
import { StripNull } from "../helper.types";

export type BookingUserView =
  Database["public"]["Views"]["view_bookings_with_user_info"];
export type BookingUserViewRow = BookingUserView["Row"];

export type BookingPreview = StripNull<BookingUserViewRow>;

/* Extended BookingPreview with additional org-specific fields from backend */
export type BookingPreviewWithOrgData = BookingPreview & {
  org_status_for_active_org?: string;
  start_date?: string;
};

export type BookingTable = Database["public"]["Tables"]["bookings"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
