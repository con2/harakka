import { Injectable } from "@nestjs/common";
import { PostgrestResponse, SupabaseClient } from "@supabase/supabase-js";
import { StorageItemsService } from "../storage-items/storage-items.service";

@Injectable()
export class AvailabilityService {
  constructor(private readonly itemService: StorageItemsService) {}

  async getItemAvailability(
    supabase: SupabaseClient,
    item_id: string,
    start_date: string,
    end_date: string,
  ): Promise<number> {
    const {
      data: overlapping_bookings,
      error,
    }: PostgrestResponse<{ quantity: number }> = await supabase
      .from("order_items")
      .select("quantity")
      .eq("item_id", item_id)
      .in("status", ["pending", "confirmed"])
      .or(`and(start_date.lte.${end_date},end_date.gte.${start_date})`);

    if (error || !overlapping_bookings) {
      console.log("Error when checking the bookings: ", error);
      throw new Error("Error checking the bookings");
    }

    const quantities = overlapping_bookings?.map((row) => row.quantity) ?? [];
    const bookedItemCount: number =
      quantities.reduce((sum, quantity) => sum + quantity, 0) ?? 0;
    const totalItemCount = await this.itemService.getItemCount(item_id);

    return totalItemCount - bookedItemCount;
  }
}
