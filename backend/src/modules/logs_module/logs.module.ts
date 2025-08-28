import { Module } from "@nestjs/common";
import { LogsController } from "./logs.controller";
import { LogsService } from "./logs.service";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [SupabaseModule],
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule {}
