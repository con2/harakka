import { Module } from "@nestjs/common";
import { AvailabilityService } from "./availability.service";
import { AvailabilityController } from "./availability.controller";
import { StorageItemsService } from "../storage-items/storage-items.service";

@Module({
  imports: [StorageItemsService],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
