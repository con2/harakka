import { Module } from "@nestjs/common";
import { MailService } from "../services/mail.service";

@Module({
  providers: [MailService],
  exports: [MailService], // <-- wichtig, damit du es woanders verwenden kannst
})
export class MailModule {}
