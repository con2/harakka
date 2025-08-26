import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { BookingItemsController } from "./booking-items.controller";
import { BookingItemsService } from "./booking-items.service";
import { RoleModule } from "../role/role.module";

@Module({
  imports: [SupabaseModule, RoleModule],
  controllers: [BookingItemsController],
  providers: [BookingItemsService],
  exports: [BookingItemsService],
})
export class BookingItemsModule {}
