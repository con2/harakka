import { Injectable } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

@Injectable()
export class StorageLocationsService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllLocations() {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error }: PostgrestResponse<any> = await supabase
      .from("storage_locations")
      .select("*")
      .order("name");

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getLocationById(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error }: PostgrestSingleResponse<any> = await supabase
      .from("storage_locations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
