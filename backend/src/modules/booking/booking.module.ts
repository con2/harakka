import { Module } from "@nestjs/common";
// import { BookingController } from "./booking.controller";
// import { BookingService } from "./booking.service";
import { InvoiceService } from "./invoice.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { MailModule } from "../mail/mail.module";
import { OrderItemsModule } from "../order-items/order-items.module";
import { UserService } from "../user/user.service";
import { NewBookingController } from "./new.booking.controller";
import { NewBookingService } from "./new.booking.service";
import { AvailabilityModule } from "../availability/availability.module";

@Module({
  imports: [SupabaseModule, MailModule, OrderItemsModule, AvailabilityModule],
  controllers: [NewBookingController],
  providers: [InvoiceService, UserService, NewBookingService],
})
export class BookingModule {}
