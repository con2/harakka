import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserSetupController } from "./user-setup.controller";
import { UserSetupService } from "./user-setup.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { MailModule } from "../mail/mail.module";
import { RoleModule } from "../role/role.module";
import { UserEmailAssembler } from "../mail/user-email-assembler";
import { JwtModule } from "../jwt/jwt.module";

@Module({
  imports: [SupabaseModule, MailModule, RoleModule, JwtModule],
  controllers: [UserController, UserSetupController],
  providers: [UserService, UserSetupService, UserEmailAssembler],
  exports: [UserSetupService], // Export for use in other modules
})
export class UserModule {}
