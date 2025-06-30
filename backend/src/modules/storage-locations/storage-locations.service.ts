import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { StorageLocation } from "./interfaces/storage-location";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";

@Injectable()
export class StorageLocationsService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllLocations(req: AuthRequest, page: number, limit: number) {
    const supabase = req.supabase;

    const { from, to } = getPaginationRange(page, limit);

    const { data, error, count } = await supabase
      .from("storage_locations")
      .select("*", { count: "exact" })
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
    req: AuthRequest,
  ): Promise<StorageLocation | null> {
    const supabase = req.supabase;

    const { data, error } = await supabase
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
}
