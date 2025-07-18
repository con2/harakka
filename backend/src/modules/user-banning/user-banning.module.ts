import { Module } from "@nestjs/common";
import { UserBanningController } from "./user-banning.controller";
import { UserBanningService } from "./user-banning.service";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [SupabaseModule],
  controllers: [UserBanningController],
  providers: [UserBanningService],
  exports: [UserBanningService],
})
export class UserBanningModule {}
