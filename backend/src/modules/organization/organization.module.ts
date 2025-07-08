import { Module } from "@nestjs/common";
import { OrganizationsController } from "./organizations.controller";
import { OrganizationsService } from "./organizations.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { MailModule } from "../mail/mail.module";
import { UserEmailAssembler } from "../mail/user-email-assembler";

@Module({
  imports: [SupabaseModule, MailModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, UserEmailAssembler],
})
export class UserModule {}
