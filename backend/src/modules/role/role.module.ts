import { Module } from "@nestjs/common";
import { RoleController } from "./role.controller";
import { RoleService } from "./role.service";
import { JwtModule } from "../jwt/jwt.module";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [JwtModule, SupabaseModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
