import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { StorageLocation } from "./interfaces/storage-location";

@Injectable()
export class StorageLocationsService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllLocations(
    req: AuthRequest,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: StorageLocation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const supabase = req.supabase;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("storage_locations")
      .select("*", { count: "exact" }) // enable count!
      .order("name")
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      total,
      page,
      totalPages,
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
