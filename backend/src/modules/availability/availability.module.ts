import { Module } from "@nestjs/common";
import { AvailabilityService } from "./availability.service";
import { AvailabilityController } from "./availability.controller";
import { StorageItemsModule } from "../storage-items/storage-items.module";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [StorageItemsModule, SupabaseModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
