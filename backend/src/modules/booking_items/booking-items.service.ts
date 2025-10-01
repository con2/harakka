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
import { handleSupabaseError } from "@src/utils/handleError.utils";

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
    // If inserting multiple rows, return a PostgrestResponse
    if (Array.isArray(booking_items)) {
      const result: PostgrestResponse<BookingItemsRow> = await supabase
        .from("booking_items")
        .insert(booking_items)
        .select();
      if (process.env.NODE_ENV !== "production") {
        if (result.error) handleSupabaseError(result.error);
      } else {
        if (result.error)
          throw new BadRequestException("Could not create booking-item");
      }
      return result;
    }

    // If inserting a single row, ask PostgREST to return exactly one row
    const singleResult: PostgrestSingleResponse<BookingItemsRow> =
      await supabase
        .from("booking_items")
        .insert(booking_items)
        .select()
        .single();

    if (process.env.NODE_ENV !== "production") {
      if (singleResult.error) handleSupabaseError(singleResult.error);
    } else {
      if (singleResult.error)
        throw new BadRequestException("Could not create booking-item");
    }
    return singleResult;
  }
  // Soft delete by setting status to cancelled
  async removeBookingItem(
    supabase: SupabaseClient,
    booking_id: string,
    booking_item_id: string,
  ): Promise<
    ApiSingleResponse<
      BookingItemsRow & { storage_items: Partial<StorageItemRow> }
    >
  > {
    const result: PostgrestSingleResponse<
      BookingItemsRow & { storage_items: Partial<StorageItemRow> }
    > = await supabase
      .from("booking_items")
      .update({ status: "cancelled" })
      .eq("booking_id", booking_id)
      .eq("id", booking_item_id)
      .select(
        "*, storage_items (translations), provider_org:organizations(name)",
      )
      .single();

    if (result.error) {
      console.error(result.error);
      if (result.error.code === "PGRST116")
        throw new BadRequestException(
          "Failed to remove booking item. Either it has already been removed or an incorrect ID has been provided",
        );
      throw new BadRequestException("Failed to remove booking item");
    }

    // Check if all booking items are now cancelled and update parent booking status
    const { data: allItems, error: allItemsError } = await supabase
      .from("booking_items")
      .select("status")
      .eq("booking_id", booking_id);

    if (!allItemsError && allItems && allItems.length > 0) {
      const allStatuses = allItems.map((item) => item.status);

      // If all items are cancelled, update booking status to cancelled
      if (allStatuses.every((status) => status === "cancelled")) {
        const { error: bookingUpdateError } = await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", booking_id);

        if (bookingUpdateError) {
          console.error(
            "Failed to update booking status to cancelled:",
            bookingUpdateError,
          );
        }
      }
    }

    return result;
  }
  // Hard delete
  async deleteBookingItem(
    supabase: SupabaseClient,
    booking_id: string,
    booking_item_id: string,
  ): Promise<
    ApiSingleResponse<
      BookingItemsRow & { storage_items: Partial<StorageItemRow> }
    >
  > {
    const result: PostgrestSingleResponse<
      BookingItemsRow & { storage_items: Partial<StorageItemRow> }
    > = await supabase
      .from("booking_items")
      .delete()
      .eq("booking_id", booking_id)
      .eq("id", booking_item_id)
      .select(
        "*, storage_items (translations), provider_org:organizations(name)",
      )
      .single();

    if (result.error) {
      console.error(result.error);
      if (result.error.code === "PGRST116")
        throw new BadRequestException(
          "Failed to delete booking item. Either it has already been deleted or an incorrect ID has been provided",
        );
      throw new BadRequestException("Failed to delete booking item");
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
  ): Promise<
    ApiSingleResponse<
      BookingItemsRow & { storage_items: Partial<StorageItemRow> }
    >
  > {
    const result: PostgrestSingleResponse<
      BookingItemsRow & { storage_items: Partial<StorageItemRow> }
    > = await supabase
      .from("booking_items")
      .update(updated_booking_item)
      .eq("id", booking_item_id)
      .select(
        "*, storage_items (translations), provider_org:organizations(name)",
      )
      .single();

    if (result.error) {
      console.error(result.error);
      throw new BadRequestException("Failed to update booking item");
    }

    // If status was updated to cancelled, check if all booking items are now cancelled
    if (
      updated_booking_item.status === "cancelled" &&
      result.data?.booking_id
    ) {
      const { data: allItems, error: allItemsError } = await supabase
        .from("booking_items")
        .select("status")
        .eq("booking_id", result.data.booking_id);

      if (!allItemsError && allItems && allItems.length > 0) {
        const allStatuses = allItems.map((item) => item.status);

        // If all items are cancelled, update booking status to cancelled
        if (allStatuses.every((status) => status === "cancelled")) {
          const { error: bookingUpdateError } = await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", result.data.booking_id);

          if (bookingUpdateError) {
            console.error(
              "Failed to update booking status to cancelled:",
              bookingUpdateError,
            );
          }
        }
      }
    }

    return result;
  }
}
