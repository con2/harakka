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
import { ApiResponse, ApiSingleResponse } from "src/types/response.types";

@Injectable()
export class BookingItemsService {
  async getAll(
    supabase: SupabaseClient,
  ): Promise<ApiResponse<BookingItemsRow>> {
    const result: PostgrestResponse<BookingItemsRow> = await supabase
      .from("order_items")
      .select("*");

    if (result.error)
      throw new BadRequestException("Could not retrieve booking data");

    return result;
  }

  async getBookingItems(
    supabase: SupabaseClient,
    booking_id: string,
    offset: number = 0,
    limit: number = 20,
  ): Promise<ApiResponse<BookingItemsRow>> {
    const result: PostgrestResponse<BookingItemsRow> = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", booking_id)
      .range(offset, offset + limit);

    if (result.error) {
      console.error(result.error);
      throw new Error("Could not retrieve booking-item");
    }

    return result;
  }

  async getUserBookingItems(
    supabase: SupabaseClient,
    user_id: string,
    offset: number = 0,
    limit: number = 20,
  ): Promise<ApiResponse<BookingItemsRow>> {
    const result = await supabase
      .from("order-items")
      .select("*")
      .eq("user_id", user_id)
      .range(offset, offset + limit);

    if (result.error) {
      console.error(result.error);
      throw new Error("Coult not retrieve user bookings");
    }

    return result;
  }

  async createBookingItem(
    supabase: SupabaseClient,
    booking_item: BookingItemsInsert,
  ): Promise<ApiSingleResponse<BookingItemsRow>> {
    const result: PostgrestSingleResponse<BookingItemsRow> = await supabase
      .from("order_items")
      .insert(booking_item)
      .select()
      .single();

    if (result.error)
      throw new BadRequestException("Could not create booking-item");

    return result;
  }

  async removeBookingItem(
    supabase: SupabaseClient,
    booking_id: string,
    booking_item_id: string,
  ) {
    const result: PostgrestSingleResponse<BookingItemsRow> = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", booking_id) // After renaming table + id column: Update column name
      .eq("id", booking_item_id)
      .select()
      .single();

    if (result.error) {
      console.error(result.error);
      if (result.error.code === "PGRST116")
        throw new BadRequestException(
          "Failed to remove booking item. Either it has already been removed or an incorrect ID has been provided",
        );
      throw new BadRequestException("Failed to remove booking item");
    }
    return result;
  }

  async updateBookingItem(
    supabase: SupabaseClient,
    booking_item_id: string,
    updated_booking_item: BookingItemsUpdate,
  ): Promise<ApiSingleResponse<BookingItemsRow>> {
    const result: PostgrestSingleResponse<BookingItemsRow> = await supabase
      .from("order-items")
      .update(updated_booking_item)
      .eq("id", booking_item_id)
      .select()
      .single();

    if (result.error) {
      console.error(result.error);
      throw new BadRequestException("Failed to update booking item");
    }

    return result;
  }
}
