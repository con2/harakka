import { Module } from "@nestjs/common";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { MailModule } from "../mail/mail.module";
import { StorageLocationsModule } from "../storage-locations/storage-locations.module";
import { BookingItemsModule } from "../booking_items/booking-items.module";
import { RoleModule } from "../role/role.module";

@Module({
  imports: [
    SupabaseModule,
    MailModule,
    StorageLocationsModule,
    BookingItemsModule,
    RoleModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
