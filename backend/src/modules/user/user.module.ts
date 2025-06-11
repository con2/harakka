import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [SupabaseModule, MailModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
