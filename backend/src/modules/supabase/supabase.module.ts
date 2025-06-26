import { Module } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import { S3Service } from "./s3-supabase.service";

@Module({
  providers: [SupabaseService, S3Service],
  exports: [SupabaseService, S3Service],
})
export class SupabaseModule {}
