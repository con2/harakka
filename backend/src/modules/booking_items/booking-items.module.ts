import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { BookingItemsController } from "./booking-items.controller";
import { BookingItemsService } from "./booking-items.service";

@Module({
  imports: [SupabaseModule],
  controllers: [BookingItemsController],
  providers: [BookingItemsService],
  exports: [BookingItemsService],
})
export class BookingItemsModule {}
