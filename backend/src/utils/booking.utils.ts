import { SupabaseClient } from "@supabase/supabase-js";

export async function calculateAvailableQuantity(
  supabase: SupabaseClient,
  itemId: string,
  startDate: string,
  endDate: string,
): Promise<number> {
  // get overlapping bookings
  const { data: overlapping, error } = await supabase
    .from("order_items")
    .select("quantity")
    .eq("item_id", itemId)
    .in("status", ["pending", "confirmed"])
    .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);
  console.log(overlapping); // buchungen
  if (error) {
    throw new Error("Error checking the bookings");
  }

  const booked =
    overlapping?.reduce((sum, o) => sum + (o.quantity || 0), 0) ?? 0;
  console.log(booked); // schaut wieviele items in den buchungen drin sind

  const { data: item, error: itemError } = await supabase
    .from("storage_items")
    .select("items_number_total")
    .eq("id", itemId)
    .single();
  console.log(item?.items_number_total); // wieviele es gibt- alle items

  if (itemError || !item) {
    throw new Error("Error when retrieving/ calling item.total");
  }

  return item.items_number_total - booked;
}
