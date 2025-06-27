import { Module } from "@nestjs/common";
import { MailController } from "./mail.controller";
import { MailService } from "./mail.service";
import { BookingEmailAssembler } from "./booking-email-assembler";
import { SupabaseService } from "../supabase/supabase.service";

@Module({
  controllers: [MailController], // You put the controllers of this module here
  providers: [MailService, BookingEmailAssembler, SupabaseService], // And the providers (services) here
  exports: [MailService, BookingEmailAssembler], // Export MailService to be used in other modules
})
export class MailModule {}
