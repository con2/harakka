import { Module } from "@nestjs/common";
import { StorageLocationsController } from "./storage-locations.controller";
import { StorageLocationsService } from "./storage-locations.service";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [SupabaseModule],
  controllers: [StorageLocationsController],
  providers: [StorageLocationsService],
})
export class StorageLocationsModule {}
