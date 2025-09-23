import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { BookingEmailAssembler } from "./booking-email-assembler";
import { SupabaseService } from "../supabase/supabase.service";
import { UserEmailAssembler } from "./user-email-assembler";

@Module({
  controllers: [],
  providers: [
    MailService,
    BookingEmailAssembler,
    SupabaseService,
    UserEmailAssembler,
  ], // And the providers (services) here
  exports: [MailService, BookingEmailAssembler, UserEmailAssembler], // Export MailService + assemblers for other modules
})
export class MailModule {}
