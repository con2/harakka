import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Query,
  Req,
} from "@nestjs/common";
import { StorageLocationsService } from "./storage-locations.service";
import { StorageLocationsRow } from "./interfaces/storage-location";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { SupabaseService } from "../supabase/supabase.service";
import { Public } from "src/decorators/roles.decorator";

@Controller("api/storage-locations")
export class StorageLocationsController {
  constructor(
    private readonly storageLocationsService: StorageLocationsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Public()
  @Get()
  async getAllLocations(
    @Req() req: AuthRequest,
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
    const supabase = req.supabase || this.supabaseService.getAnonClient();
    if (!supabase) {
      throw new Error("Supabase client is undefined.");
    }

    return this.storageLocationsService.getAllLocations(
      supabase,
      pageNumber,
      limitNumber,
    );
  }

  @Public()
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
