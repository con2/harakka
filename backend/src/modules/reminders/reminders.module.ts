import { Module } from "@nestjs/common";
import { RemindersService } from "./reminders.service";
import { RemindersController } from "./reminders.controller";
import { SupabaseModule } from "../supabase/supabase.module";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [SupabaseModule, MailModule],
  controllers: [RemindersController],
  providers: [RemindersService],
})
export class RemindersModule {}
