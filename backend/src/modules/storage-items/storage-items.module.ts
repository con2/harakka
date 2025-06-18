import { Module } from "@nestjs/common";
import { StorageItemsController } from "./storage-items.controller";
import { StorageItemsService } from "./storage-items.service";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [SupabaseModule],
  controllers: [StorageItemsController],
  providers: [StorageItemsService],
})
export class StorageItemsModule {}
