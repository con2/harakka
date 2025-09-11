import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@common/supabase.types";
import { UserBooking } from "src/modules/booking/types/booking.interface";
import { BookingStatus } from "../modules/booking//types/booking.interface";
import { handleSupabaseError } from "./handleError.utils";

export async function calculateAvailableQuantity(
  supabase: SupabaseClient<Database>,
  itemId: string,
  startDate: string,
  endDate: string,
): Promise<{
  item_id: string;
  alreadyBookedQuantity: number;
  availableQuantity: number;
}> {
  console.log(
    `[calculateAvailableQuantity] Checking availability for item ${itemId}`,
    {
      itemId,
      startDate,
      endDate,
    },
  );

  // get overlapping bookings
  const { data: overlapping, error } = await supabase
    .from("booking_items")
    .select("quantity")
    .eq("item_id", itemId)
    .in("status", ["pending", "confirmed", "picked_up"])
    .lte("start_date", endDate)
    .gte("end_date", startDate);

  if (error) {
    console.error(
      `[calculateAvailableQuantity] Error checking overlapping bookings for item ${itemId}:`,
      error,
    );
    handleSupabaseError(error);
  }

  console.log(
    `[calculateAvailableQuantity] Found ${overlapping?.length || 0} overlapping bookings for item ${itemId}:`,
    overlapping,
  );

  const alreadyBookedQuantity =
    overlapping?.reduce((sum, o) => sum + (o.quantity || 0), 0) ?? 0;

  console.log(
    `[calculateAvailableQuantity] Already booked quantity for item ${itemId}: ${alreadyBookedQuantity}`,
  );

  // get items total quantity
  const { data: item, error: itemError } = await supabase
    .from("storage_items")
    .select("quantity")
    .eq("id", itemId)
    .single();

  if (itemError) {
    console.error(
      `[calculateAvailableQuantity] Error retrieving item ${itemId}:`,
      itemError,
    );
    handleSupabaseError(itemError);
  }

  if (!item) {
    console.error(
      `[calculateAvailableQuantity] Item ${itemId} not found in storage_items table`,
    );
    throw new Error(`Item ${itemId} not found`);
  }

  console.log(
    `[calculateAvailableQuantity] Item ${itemId} total quantity: ${item.quantity}`,
  );

  const availableQuantity = item.quantity - alreadyBookedQuantity;

  console.log(
    `[calculateAvailableQuantity] Available quantity for item ${itemId}: ${availableQuantity}`,
  );

  return {
    item_id: itemId,
    alreadyBookedQuantity,
    availableQuantity,
  };
}

export function getUniqueLocationIDs(bookings: UserBooking[]): string[] {
  return Array.from(
    new Set(
      bookings
        .flatMap((booking) => booking.booking_items ?? [])
        .map((item) => item.storage_items?.location_id)
        .filter((id): id is string => !!id),
    ),
  );
}

/**
 * Get the difference in days between a certain date and todays date
 * @param start
 * @returns
 */
export function dayDiffFromToday(start: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to midnight
  start.setHours(0, 0, 0, 0);
  return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Return the total difference in days between two dates
 * @param start Start date of period
 * @param end End date of period
 * @returns
 */
export function calculateDuration(start: Date, end: Date): number {
  end.setHours(0, 0, 0, 0); // normalize to midnight
  start.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// internal helper to create a random booking number candidate
function makeCandidate(): string {
  return `ORD-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;
}

/**
 * Generate a booking number and ensure it's not already present in the bookings table.
 * Retries up to `maxAttempts` times before throwing.
 */
export async function generateBookingNumber(
  supabase: SupabaseClient<Database>,
  maxAttempts = 5,
): Promise<string> {
  console.log(
    `[generateBookingNumber] Starting booking number generation with ${maxAttempts} max attempts`,
  );

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = makeCandidate();

    console.log(
      `[generateBookingNumber] Attempt ${attempt + 1}/${maxAttempts}: checking candidate ${candidate}`,
    );

    const { data, error } = await supabase
      .from("bookings")
      .select("id")
      .eq("booking_number", candidate)
      .maybeSingle();

    if (error) {
      console.error(
        `[generateBookingNumber] Error checking booking number uniqueness for ${candidate}:`,
        error,
      );
      handleSupabaseError(error);
    }

    // if no existing row, candidate is unique
    if (!data) {
      console.log(
        `[generateBookingNumber] Success! Generated unique booking number: ${candidate}`,
      );
      return candidate;
    }

    console.log(
      `[generateBookingNumber] Candidate ${candidate} already exists, trying again...`,
    );
    // otherwise loop and try again
  }

  console.error(
    `[generateBookingNumber] Failed to generate unique booking number after ${maxAttempts} attempts`,
  );
  throw new Error(
    "Could not generate a unique booking number after multiple attempts.",
  );
}

export function deriveOrgStatus(statuses: string[]): BookingStatus {
  if (statuses.length === 0) return "pending";
  if (statuses.every((s) => s === "rejected")) return "rejected";
  if (
    statuses.every(
      (s) => s === "returned" || s === "cancelled" || s === "rejected",
    ) &&
    statuses.some((s) => s === "returned")
  )
    return "completed";
  if (statuses.some((s) => s === "pending")) return "pending";
  if (statuses.some((s) => s === "picked_up")) return "picked_up";
  if (statuses.some((s) => s === "confirmed")) return "confirmed";
  if (statuses.some((s) => s === "cancelled")) return "cancelled";
  return "pending";
}
