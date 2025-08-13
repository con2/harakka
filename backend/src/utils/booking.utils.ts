import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@common/supabase.types";
import { UserBooking } from "src/modules/booking/types/booking.interface";
import { handleSupabaseError } from "./handleError.utils";

export async function calculateAvailableQuantity(
  supabase: SupabaseClient<Database>,
  itemId: string,
  startDate: string,
  endDate: string,
  location_id?: string,
): Promise<{
  item_id: string;
  alreadyBookedQuantity: number;
  availableQuantity: number;
}> {
  if (!itemId) {
    throw new Error("calculateAvailableQuantity called with empty itemId");
  }
  // get overlapping bookings
  let overlapQuery = supabase
    .from("booking_items")
    .select("quantity")
    .eq("item_id", itemId)
    // Count pending + confirmed (+ picked_up if within range) as reserving inventory
    .in("status", ["pending", "confirmed", "picked_up"])
    .lte("start_date", endDate)
    .gte("end_date", startDate);
  if (location_id) overlapQuery = overlapQuery.eq("location_id", location_id);
  const { data: overlapping, error } = await overlapQuery;

  if (error) {
    handleSupabaseError(error);
  }

  const alreadyBookedQuantity =
    overlapping?.reduce((sum, o) => sum + (o.quantity || 0), 0) ?? 0;

  // get items total quantity; if location_id provided, use org ownership at that location
  let itemsTotal: number | null = null;
  if (location_id) {
    const { data: orgRows, error: orgErr } = await supabase
      .from("organization_items")
      .select("owned_quantity")
      .eq("storage_item_id", itemId)
      .eq("storage_location_id", location_id)
      .eq("is_active", true);
    if (orgErr) handleSupabaseError(orgErr);
    itemsTotal =
      orgRows?.reduce((sum, r) => sum + (r.owned_quantity ?? 0), 0) ?? 0;
  } else {
    const { data: item, error: itemError } = await supabase
      .from("storage_items")
      .select("items_number_total")
      .eq("id", itemId)
      .maybeSingle();
    if (!itemError && item) {
      itemsTotal = item.items_number_total ?? null;
    }
    if (itemsTotal == null) {
      const { data: orgRows, error: orgErr } = await supabase
        .from("organization_items")
        .select("owned_quantity")
        .eq("storage_item_id", itemId)
        .eq("is_active", true);
      if (orgErr) handleSupabaseError(orgErr);
      itemsTotal =
        orgRows?.reduce((sum, r) => sum + (r.owned_quantity ?? 0), 0) ?? 0;
    }
  }

  const availableQuantity = itemsTotal - alreadyBookedQuantity;

  return {
    item_id: itemId,
    alreadyBookedQuantity,
    availableQuantity,
  };
}

/**
 * Calculate availability for a specific organization that owns the item.
 * available = owned_total(org) - alreadyBooked(org, confirmed, overlapping)
 */
export async function calculateAvailableQuantityForOrg(
  supabase: SupabaseClient<Database>,
  itemId: string,
  startDate: string,
  endDate: string,
  organizationId: string,
  location_id?: string,
): Promise<{
  item_id: string;
  organization_id: string;
  ownedTotal: number;
  alreadyBookedQuantity: number;
  availableQuantity: number;
}> {
  if (!itemId || !organizationId) {
    throw new Error(
      "calculateAvailableQuantityForOrg called with empty itemId or organizationId",
    );
  }

  // Sum of overlapping bookings for this org
  let orgOverlap = supabase
    .from("booking_items")
    .select("quantity")
    .eq("item_id", itemId)
    .eq("provider_organization_id", organizationId)
    .in("status", ["pending", "confirmed", "picked_up"])
    .lte("start_date", endDate)
    .gte("end_date", startDate);
  if (location_id) orgOverlap = orgOverlap.eq("location_id", location_id);
  const { data: overlapping, error: overlapErr } = await orgOverlap;
  if (overlapErr) handleSupabaseError(overlapErr);

  const alreadyBookedQuantity =
    overlapping?.reduce((sum, o) => sum + (o.quantity || 0), 0) ?? 0;

  // Org-owned total capacity for this item
  let ownersQuery = supabase
    .from("organization_items")
    .select("owned_quantity")
    .eq("storage_item_id", itemId)
    .eq("organization_id", organizationId)
    .eq("is_active", true);
  if (location_id)
    ownersQuery = ownersQuery.eq("storage_location_id", location_id);
  const { data: orgRows, error: orgErr } = await ownersQuery;
  if (orgErr) handleSupabaseError(orgErr);

  const ownedTotal =
    orgRows?.reduce((sum, r) => sum + (r.owned_quantity ?? 0), 0) ?? 0;

  const availableQuantity = Math.max(ownedTotal - alreadyBookedQuantity, 0);
  return {
    item_id: itemId,
    organization_id: organizationId,
    ownedTotal,
    alreadyBookedQuantity,
    availableQuantity,
  };
}

/**
 * Calculate availability grouped by organization for an item.
 */
export async function calculateAvailableQuantityGroupedByOrg(
  supabase: SupabaseClient<Database>,
  itemId: string,
  startDate: string,
  endDate: string,
  location_id?: string,
): Promise<
  Array<{
    item_id: string;
    organization_id: string;
    ownedTotal: number;
    alreadyBookedQuantity: number;
    availableQuantity: number;
  }>
> {
  if (!itemId) throw new Error("itemId is required");

  // Get org ownership for this item
  let ownersQuery = supabase
    .from("organization_items")
    .select("organization_id, owned_quantity")
    .eq("storage_item_id", itemId)
    .eq("is_active", true);
  if (location_id)
    ownersQuery = ownersQuery.eq("storage_location_id", location_id);
  const { data: owners, error: ownersErr } = await ownersQuery;
  if (ownersErr) handleSupabaseError(ownersErr);

  const byOrg = new Map<string, number>();
  for (const row of owners ?? []) {
    const key = row.organization_id;
    if (!key) continue;
    byOrg.set(key, (byOrg.get(key) ?? 0) + (row.owned_quantity ?? 0));
  }

  if (byOrg.size === 0) return [];

  // Aggregate bookings per org
  let groupedOverlap = supabase
    .from("booking_items")
    .select("quantity, provider_organization_id, location_id")
    .eq("item_id", itemId)
    .in("status", ["pending", "confirmed", "picked_up"])
    .lte("start_date", endDate)
    .gte("end_date", startDate);
  if (location_id)
    groupedOverlap = groupedOverlap.eq("location_id", location_id);
  const { data: overlapping, error: overlapErr } = await groupedOverlap;
  if (overlapErr) handleSupabaseError(overlapErr);

  const bookedByOrg = new Map<string, number>();
  type OverlapRow = {
    quantity: number | null;
    provider_organization_id: string | null;
  };
  for (const row of (overlapping ?? []) as OverlapRow[]) {
    const org = row.provider_organization_id;
    if (!org) continue;
    bookedByOrg.set(org, (bookedByOrg.get(org) ?? 0) + (row.quantity ?? 0));
  }

  const result: Array<{
    item_id: string;
    organization_id: string;
    ownedTotal: number;
    alreadyBookedQuantity: number;
    availableQuantity: number;
  }> = [];
  for (const [orgId, ownedTotal] of byOrg.entries()) {
    const alreadyBookedQuantity = bookedByOrg.get(orgId) ?? 0;
    const availableQuantity = Math.max(ownedTotal - alreadyBookedQuantity, 0);
    result.push({
      item_id: itemId,
      organization_id: orgId,
      ownedTotal,
      alreadyBookedQuantity,
      availableQuantity,
    });
  }
  return result;
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

export function generateBookingNumber() {
  return `ORD-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;
}
