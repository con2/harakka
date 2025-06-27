import { Module } from "@nestjs/common";
// import { BookingController } from "./booking.controller";
// import { BookingService } from "./booking.service";
import { InvoiceService } from "./invoice.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { MailModule } from "../mail/mail.module";
import { OrderItemsModule } from "../order-items/order-items.module";
import { UserService } from "../user/user.service";
import { NewBookingController } from "./new.booking.controller";

@Module({
  imports: [SupabaseModule, MailModule, OrderItemsModule],
  controllers: [NewBookingController],
  providers: [InvoiceService, UserService],
})
export class BookingModule {}
