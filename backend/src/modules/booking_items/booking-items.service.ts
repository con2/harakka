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
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";

@Injectable()
export class BookingItemsService {
  async getAll(
    supabase: SupabaseClient,
    page: number,
    limit: number,
  ): Promise<ApiResponse<BookingItemsRow>> {
    const { from, to } = getPaginationRange(page, limit);

    const result: PostgrestResponse<BookingItemsRow> = await supabase
      .from("order_items")
      .select("*")
      .range(from, to);

    if (result.error)
      throw new BadRequestException("Could not retrieve booking data");

    const metadata = getPaginationMeta(result.count, page, limit);
    return { ...result, metadata };
  }

  async getBookingItems(
    supabase: SupabaseClient,
    booking_id: string,
    page: number,
    limit: number,
  ): Promise<ApiResponse<BookingItemsRow>> {
    const { from, to } = getPaginationRange(page, limit);
    const result: PostgrestResponse<BookingItemsRow> = await supabase
      .from("order_items")
      .select("*", { count: "exact" })
      .eq("order_id", booking_id)
      .range(from, to);

    if (result.error) {
      console.error(result.error);
      throw new Error("Could not retrieve booking-item");
    }
    const metadata = getPaginationMeta(result.count, page, limit);
    return { ...result, metadata };
  }

  async getUserBookingItems(
    supabase: SupabaseClient,
    user_id: string,
    page: number,
    limit: number,
  ): Promise<ApiResponse<BookingItemsRow>> {
    const { from, to } = getPaginationRange(page, limit);
    const result = await supabase
      .from("order-items")
      .select("*")
      .eq("user_id", user_id)
      .range(from, to);

    if (result.error) {
      console.error(result.error);
      throw new Error("Coult not retrieve user bookings");
    }
    const metadata = getPaginationMeta(result.count, page, limit);
    return { ...result, metadata };
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
  ): Promise<ApiSingleResponse<BookingItemsRow>> {
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

  async removeAllBookingItems(
    supabase: SupabaseClient,
    booking_id: string,
  ): Promise<ApiResponse<BookingItemsRow>> {
    const result: PostgrestResponse<BookingItemsRow> = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", booking_id) // After renaming table + id column: Update column name
      .select();

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
