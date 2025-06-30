import {
  Controller,
  Get,
  Param,
  Req,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { StorageLocationsService } from "./storage-locations.service";
import { StorageLocation } from "./interfaces/storage-location";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";

@Controller("api/storage-locations")
export class StorageLocationsController {
  constructor(
    private readonly storageLocationsService: StorageLocationsService,
  ) {}

  @Get()
  async getAllLocations(
    @Req() req: AuthRequest,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ): Promise<{
    data: StorageLocation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.storageLocationsService.getAllLocations(
      req,
      pageNumber,
      limitNumber,
    );
  }

  @Get(":id")
  async getLocationById(
    @Param("id") id: string,
    @Req() req: AuthRequest,
  ): Promise<StorageLocation> {
    const location = await this.storageLocationsService.getLocationById(
      id,
      req,
    );
    if (!location) {
      throw new NotFoundException(
        `Location with ID ${id} not found or you do not have access to it`,
      );
    }
    return location;
  }
}
