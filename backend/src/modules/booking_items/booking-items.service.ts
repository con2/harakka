import { BadRequestException, Injectable } from "@nestjs/common";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import {
  BookingItemsInsert,
  BookingItemsRow,
  BookingItemsUpdate,
} from "./interfaces/booking-items.interfaces";

@Injectable()
export class BookingItemsService {
  async getAll(supabase: SupabaseClient) {
    const { data }: PostgrestResponse<BookingItemsRow> = await supabase
      .from("order_items")
      .select("*");

    if (!data) throw new BadRequestException("Could not retrieve booking data");
    return data;
  }

  async getBookingItems(
    supabase: SupabaseClient,
    booking_id: string,
    offset: number = 0,
    limit: number = 20,
  ) {
    const { data, error }: PostgrestResponse<BookingItemsRow> = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", booking_id)
      .range(offset, offset + limit);
    if (error) {
      console.error(error);
      throw new BadRequestException("Failed to get bookingItems");
    }
    if (!data) throw new BadRequestException("Booking not found");
  }

  async getUserBookingItems(
    supabase: SupabaseClient,
    user_id: string,
    offset: number = 0,
    limit: number = 20,
  ) {
    const { data } = await supabase
      .from("order-items")
      .select("*")
      .eq("user_id", user_id)
      .range(offset, offset + limit);

    console.log(data);
    return data;
  }

  async createBookingItem(
    supabase: SupabaseClient,
    booking_item: BookingItemsInsert,
  ) {
    const { data, error }: PostgrestSingleResponse<BookingItemsRow> =
      await supabase.from("order_items").insert(booking_item).select().single();

    if (error) throw new BadRequestException("Could not create booking-item");

    return data;
  }

  async removeBookingItem(
    supabase: SupabaseClient,
    booking_id: string,
    booking_item_id: string,
  ) {
    const { data, error }: PostgrestSingleResponse<BookingItemsRow> =
      await supabase
        .from("order_items")
        .delete()
        .eq("order_id", booking_id) // After renaming table + id column: Update column name
        .eq("id", booking_item_id)
        .select()
        .single();

    if (error) {
      console.error(error);
      if (error.code === "PGRST116")
        throw new BadRequestException(
          "Failed to remove booking item. Either it has already been removed or an incorrect ID has been provided",
        );
      throw new BadRequestException("Failed to remove booking item");
    }
    return data;
  }

  async updateBookingItem(
    supabase: SupabaseClient,
    booking_item_id: string,
    updated_booking_item: BookingItemsUpdate,
  ) {
    const { data, error }: PostgrestSingleResponse<BookingItemsRow> =
      await supabase
        .from("order-items")
        .update(updated_booking_item)
        .eq("id", booking_item_id)
        .select()
        .single();

    if (error) {
      console.error(error);
      throw new BadRequestException("Failed to update booking item");
    }

    return data;
  }
}
