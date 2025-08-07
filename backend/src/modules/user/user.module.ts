import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { MailModule } from "../mail/mail.module";
import { UserEmailAssembler } from "../mail/user-email-assembler";

@Module({
  imports: [SupabaseModule, MailModule],
  controllers: [UserController],
  providers: [UserService, UserEmailAssembler],
})
export class UserModule {}
