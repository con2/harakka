import { Controller, Get, Param } from "@nestjs/common";
import { StorageLocationsService } from "./storage-locations.service";

@Controller("api/storage-locations")
export class StorageLocationsController {
  constructor(
    private readonly storageLocationsService: StorageLocationsService,
  ) {}

  @Get()
  async getAllLocations() {
    return await this.storageLocationsService.getAllLocations();
  }

  @Get(":id")
  async getLocationById(@Param("id") id: string) {
    return await this.storageLocationsService.getLocationById(id);
  }
}
