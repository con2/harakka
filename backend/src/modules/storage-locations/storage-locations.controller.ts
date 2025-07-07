import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { StorageLocationsService } from "./storage-locations.service";
import { StorageLocationsRow } from "./interfaces/storage-location";
import { SupabaseService } from "../supabase/supabase.service";

@Controller("api/storage-locations")
export class StorageLocationsController {
  constructor(
    private readonly storageLocationsService: StorageLocationsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  async getAllLocations(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ): Promise<{
    data: StorageLocationsRow[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const supabase = this.supabaseService.getAnonClient();
    return this.storageLocationsService.getAllLocations(
      supabase,
      pageNumber,
      limitNumber,
    );
  }

  @Get(":id")
  async getLocationById(@Param("id") id: string): Promise<StorageLocationsRow> {
    const supabase = this.supabaseService.getAnonClient();
    const location = await this.storageLocationsService.getLocationById(
      id,
      supabase,
    );
    if (!location) {
      throw new NotFoundException(
        `Location with ID ${id} not found or you do not have access to it`,
      );
    }
    return location;
  }
}
