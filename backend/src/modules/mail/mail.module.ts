import { Module } from "@nestjs/common";
import { MailController } from "./mail.controller";
import { MailService } from "./mail.service";
import { BookingEmailAssembler } from "./booking-email-assembler";

@Module({
  controllers: [MailController], // You put the controllers of this module here
  providers: [MailService, BookingEmailAssembler], // And the providers (services) here
  exports: [MailService, BookingEmailAssembler], // Export MailService to be used in other modules
})
export class MailModule {}
