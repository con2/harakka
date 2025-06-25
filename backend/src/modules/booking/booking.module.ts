import { Module } from "@nestjs/common";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { InvoiceService } from "./invoice.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { MailModule } from "../mail/mail.module";
import { OrderItemsModule } from '../order-items/order-items.module';

@Module({
  imports: [SupabaseModule, MailModule, OrderItemsModule],
  controllers: [BookingController],
  providers: [BookingService, InvoiceService],
})
export class BookingModule {}
