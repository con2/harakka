import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { StorageLocation } from "./interfaces/storage-location";

@Injectable()
export class StorageLocationsService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllLocations(req: AuthRequest): Promise<StorageLocation[]> {
    const supabase = req.supabase;

    const { data, error } = await supabase
      .from("storage_locations")
      .select("*")
      .order("name");

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
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
