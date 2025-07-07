import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  StorageLocationsFilter,
  StorageLocationsRow,
} from "./interfaces/storage-location";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";
import { PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js";
import { ApiResponse } from "src/types/response.types";

@Injectable()
export class StorageLocationsService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllLocations(
    supabase: SupabaseClient,
    page: number,
    limit: number,
    columns?: string[],
  ) {
    const { from, to } = getPaginationRange(page, limit);
    const requestedData = columns ? columns.join(", ") : "*";

    const { data, error, count } = await supabase
      .from("storage_locations")
      .select(requestedData as "*", { count: "exact" })
      .order("name")
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const meta = getPaginationMeta(count, page, limit);
    return {
      data: data || [],
      ...meta,
    };
  }

  async getLocationById(
    id: string,
    supabase: SupabaseClient,
  ): Promise<StorageLocationsRow | null> {
    const { data, error }: PostgrestSingleResponse<StorageLocationsRow> =
      await supabase
        .from("storage_locations")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(error.message);
    }

    return data ?? null;
  }

  /**
   * Get the locations matching desired filters.
   * @param filters Object with key-value pairs of the column and value you would like to filter by
   * @param columns Specify what columns of the table you would like to return
   * @returns matching storage locations
   */
  async getMatchingLocations(
    filters: Partial<Record<StorageLocationsFilter, string[]>>,
    columns?: string[],
  ): Promise<ApiResponse<StorageLocationsRow>> {
    const supabase = this.supabaseService.getAnonClient();
    const requestedData = columns ? columns.join(", ") : "*";

    let query = supabase
      .from("storage_locations")
      .select(requestedData as "*", { count: "exact" })
      .order("name");

    for (const [field, values] of Object.entries(filters)) {
      query = query.in(field, values);
    }

    const result = await query;

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result;
  }
}
