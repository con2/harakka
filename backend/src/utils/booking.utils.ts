import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@common/supabase.types";
import { UserBooking } from "src/modules/booking/types/booking.interface";
import { handleSupabaseError } from "./handleError.utils";

export type AvailabilityOptions = {
  itemId: string;
  startDate: string; // ISO or parsable string
  endDate: string; // ISO or parsable string
  location_id?: string;
  organizationId?: string; // when provided, scope to a single provider org
  groupBy?: "none" | "organization"; // default 'none'
  includePending?: boolean; // default true
  excludeBookingId?: string; // to ignore a booking while editing
};

export type AvailabilityTotals = {
  item_id: string;
  ownedTotal: number; // sum of owned quantities across matched rows (or org)
  alreadyBookedQuantity: number; // sum of reserved_quantity
  availableQuantity: number; // sum of available
};

export type AvailabilityByOrg = {
  item_id: string;
  organization_id: string;
  ownedTotal: number;
  alreadyBookedQuantity: number;
  availableQuantity: number;
};

type RpcRow = {
  org_item_id: string;
  storage_item_id: string;
  location_id: string | null;
  owned_quantity: number | null;
  reserved_quantity: number | null;
  available: number | null;
};

export async function getAvailability(
  supabase: SupabaseClient<Database>,
  opts: AvailabilityOptions,
): Promise<AvailabilityTotals | AvailabilityByOrg[]> {
  const {
    itemId,
    startDate,
    endDate,
    location_id,
    organizationId,
    groupBy = "none",
    includePending = true,
    excludeBookingId,
  } = opts;

  if (!itemId) throw new Error("itemId is required");

  const rpcArgs: {
    p_start: string;
    p_end: string;
    p_storage_item_ids: string[];
    p_location_id?: string;
    p_provider_organization_id?: string;
    p_include_pending?: boolean;
    p_exclude_booking_id?: string;
  } = {
    p_start: new Date(startDate).toISOString(),
    p_end: new Date(endDate).toISOString(),
    p_storage_item_ids: [itemId],
  };
  if (location_id) rpcArgs.p_location_id = location_id;
  if (organizationId) rpcArgs.p_provider_organization_id = organizationId;
  if (includePending !== undefined) rpcArgs.p_include_pending = includePending;
  if (excludeBookingId) rpcArgs.p_exclude_booking_id = excludeBookingId;

  const { data, error } = await supabase.rpc("get_item_availability", rpcArgs);
  if (error) handleSupabaseError(error);

  const rows: RpcRow[] = (data as RpcRow[]) ?? [];

  // No results
  if (rows.length === 0) {
    if (groupBy === "organization") return [];
    return {
      item_id: itemId,
      ownedTotal: 0,
      alreadyBookedQuantity: 0,
      availableQuantity: 0,
    };
  }

  if (groupBy === "organization") {
    // Map org_item_id -> organization_id
    const orgItemIds = Array.from(new Set(rows.map((r) => r.org_item_id)));
    const { data: orgItems, error: orgErr } = await supabase
      .from("organization_items")
      .select("id, organization_id")
      .in("id", orgItemIds);
    if (orgErr) handleSupabaseError(orgErr);

    const orgByOrgItem = new Map<string, string>();
    for (const row of orgItems ?? []) {
      if (row.id && row.organization_id) {
        orgByOrgItem.set(row.id, row.organization_id);
      }
    }

    const byOrg = new Map<string, AvailabilityTotals>();
    for (const r of rows) {
      const orgId = orgByOrgItem.get(r.org_item_id);
      if (!orgId) continue;
      const acc = byOrg.get(orgId) ?? {
        item_id: itemId,
        ownedTotal: 0,
        alreadyBookedQuantity: 0,
        availableQuantity: 0,
      };
      acc.ownedTotal += r.owned_quantity ?? 0;
      acc.alreadyBookedQuantity += r.reserved_quantity ?? 0;
      acc.availableQuantity += r.available ?? 0;
      byOrg.set(orgId, acc);
    }

    const result: AvailabilityByOrg[] = [];
    for (const [organization_id, acc] of byOrg.entries()) {
      result.push({
        item_id: itemId,
        organization_id,
        ownedTotal: acc.ownedTotal,
        alreadyBookedQuantity: acc.alreadyBookedQuantity,
        availableQuantity: acc.availableQuantity,
      });
    }
    return result;
  }

  // Totals (optionally scoped to a single organization by RPC filter)
  const ownedTotal = rows.reduce((sum, r) => sum + (r.owned_quantity ?? 0), 0);
  const alreadyBookedQuantity = rows.reduce(
    (sum, r) => sum + (r.reserved_quantity ?? 0),
    0,
  );
  const availableQuantity = rows.reduce(
    (sum, r) => sum + (r.available ?? 0),
    0,
  );

  const totals: AvailabilityTotals = {
    item_id: itemId,
    ownedTotal,
    alreadyBookedQuantity,
    availableQuantity,
  };
  return totals;
}

/**
 * @deprecated Use `getAvailability` instead. This is a thin wrapper for backward compatibility.
 */
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
  const totals = (await getAvailability(supabase, {
    itemId,
    startDate,
    endDate,
    location_id,
    groupBy: "none",
    includePending: true,
  })) as AvailabilityTotals;

  return {
    item_id: totals.item_id,
    alreadyBookedQuantity: totals.alreadyBookedQuantity,
    availableQuantity: totals.availableQuantity,
  };
}

/**
 * @deprecated Use `getAvailability` instead. This is a thin wrapper for backward compatibility.
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
  const totals = (await getAvailability(supabase, {
    itemId,
    startDate,
    endDate,
    location_id,
    organizationId,
    groupBy: "none",
    includePending: true,
  })) as AvailabilityTotals;

  return {
    item_id: totals.item_id,
    organization_id: organizationId,
    ownedTotal: totals.ownedTotal,
    alreadyBookedQuantity: totals.alreadyBookedQuantity,
    availableQuantity: totals.availableQuantity,
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

export function generateBookingNumber() {
  return `ORD-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;
}

/**
 * Timezone helpers (DST-aware) for Europe/Helsinki normalization
 */
export function getTimeZoneOffsetMinutes(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const { type, value } of parts) {
    map[type] = value;
  }
  const localAsUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  const utc = date.getTime();
  return Math.round((localAsUTC - utc) / 60000);
}

/**
 * Accepts 'YYYY-MM-DD' and returns the ISO UTC instant for 00:00:00 at Europe/Helsinki
 * on that calendar date (handles DST). If already an ISO datetime, returns unchanged.
 */
export function toIsoMidnightHelsinki(dateStr: string): string {
  const onlyDate = /^\d{4}-\d{2}-\d{2}$/;
  if (!onlyDate.test(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split("-").map((x) => Number(x));
  const utcAtMidnight = Date.UTC(y, m - 1, d, 0, 0, 0);
  const offsetMin = getTimeZoneOffsetMinutes(
    "Europe/Helsinki",
    new Date(utcAtMidnight),
  );
  const helsinkiMidnightInstant = new Date(
    utcAtMidnight - offsetMin * 60 * 1000,
  );
  return helsinkiMidnightInstant.toISOString();
}

/**
 * Normalize CreateBookingDto dates to Helsinki local midnight (ISO UTC instants).
 * Keeps DTO shape intact; only transforms item.start_date/end_date strings.
 */
export function normalizeCreateBookingDtoDates<
  T extends { items?: Array<{ start_date: string; end_date: string }> },
>(dto: T): T {
  if (!dto?.items) return dto;
  const items = dto.items.map((it) => ({
    ...it,
    start_date: toIsoMidnightHelsinki(it.start_date),
    end_date: toIsoMidnightHelsinki(it.end_date),
  }));
  return { ...dto, items };
}

/**
 * Normalize UpdateBookingItemDto[] dates to Helsinki local midnight (ISO UTC instants).
 */
export function normalizeUpdateItemsDates<
  T extends { start_date: string; end_date: string },
>(items: T[]): T[] {
  if (!items) return items;
  return items.map((it) => ({
    ...it,
    start_date: toIsoMidnightHelsinki(it.start_date),
    end_date: toIsoMidnightHelsinki(it.end_date),
  }));
}
