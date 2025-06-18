import { Module } from "@nestjs/common";
import { MailController } from "./mail.controller";
import { MailService } from "./mail.service";

@Module({
  controllers: [MailController], // You put the controllers of this module here
  providers: [MailService], // And the providers (services) here
  exports: [MailService], // Export MailService to be used in other modules
})
export class MailModule {}
