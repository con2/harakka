import { Module } from "@nestjs/common";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { InvoiceService } from "./invoice.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { MailModule } from "../mail/mail.module";
import { StorageLocationsModule } from "../storage-locations/storage-locations.module";
import { BookingItemsModule } from "../booking_items/booking-items.module";

@Module({
  imports: [
    SupabaseModule,
    MailModule,
    StorageLocationsModule,
    BookingItemsModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, InvoiceService],
})
export class BookingModule {}
