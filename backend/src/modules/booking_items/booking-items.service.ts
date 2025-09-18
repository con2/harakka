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
import { ApiResponse, ApiSingleResponse } from "@common/response.types";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";
import { StorageItemRow } from "../storage-items/interfaces/storage-item.interface";

@Injectable()
export class BookingItemsService {
  async getAll(
    supabase: SupabaseClient,
    page: number,
    limit: number,
  ): Promise<ApiResponse<BookingItemsRow>> {
    const { from, to } = getPaginationRange(page, limit);

    const result: PostgrestResponse<BookingItemsRow> = await supabase
      .from("booking_items")
      .select("*")
      .range(from, to);

    if (result.error)
      throw new BadRequestException("Could not retrieve booking data");

    const metadata = getPaginationMeta(result.count, page, limit);
    return { ...result, metadata };
  }

  /**
   * Get booking-items of a certain booking.
   * Joins with storage_items to get desired data
   * @param supabase The supabase client to use. Should be an authorized client
   * @param booking_id The booking ID of which to retrieve item data for
   * @param page What page to retrieve. Default 1.
   * @param limit How many rows to retrieve. Default 10.
   * @param storage_items_columns Get data about the item itself. Default gets translations
   * @returns booking items with a joined storage_items row
   */
  async getBookingItems(
    supabase: SupabaseClient,
    booking_id: string,
    page: number = 1,
    limit: number = 10,
    storage_items_columns: string = "translations",
    provider_organization_id?: string,
  ): Promise<
    ApiResponse<
      BookingItemsRow & {
        storage_items: Partial<StorageItemRow>;
      }
    >
  > {
    const { from, to } = getPaginationRange(page, limit);

    // Base query
    let query = supabase
      .from("booking_items")
      .select(
        `*, storage_items (${storage_items_columns}), provider_org:organizations(name)` as "*",
        {
          count: "exact",
        },
      )
      .eq("booking_id", booking_id);

    // Optionally filter by provider organization if provided
    if (provider_organization_id) {
      query = query.eq("provider_organization_id", provider_organization_id);
    }

    const result: PostgrestResponse<
      BookingItemsRow & {
        storage_items: Partial<StorageItemRow>;
      }
    > = await query.range(from, to);

    if (result.error) {
      console.error(result.error);
      throw new Error("Could not retrieve booking-items");
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
      .from("booking_items")
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

  async createBookingItems(
    supabase: SupabaseClient,
    booking_items: BookingItemsInsert | BookingItemsInsert[],
  ): Promise<
    ApiResponse<BookingItemsRow> | ApiSingleResponse<BookingItemsRow>
  > {
    const query = supabase.from("booking_items").insert(booking_items).select();
    if (!Array.isArray(booking_items)) query.single();
    const result = await query;
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
      .from("booking_items")
      .delete()
      .eq("booking_id", booking_id) // After renaming table + id column: Update column name
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
      .from("booking_items")
      .delete()
      .eq("booking_id", booking_id)
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
      .from("booking_items")
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
