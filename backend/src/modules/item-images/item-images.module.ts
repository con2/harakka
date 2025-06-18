import { Module } from "@nestjs/common";
import { ItemImagesController } from "./item-images.controller";
import { ItemImagesService } from "./item-images.service";
import { S3Service } from "../supabase/s3-supabase.service";
import { SupabaseService } from "../supabase/supabase.service";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [SupabaseModule],
  controllers: [ItemImagesController],
  providers: [ItemImagesService],
})
export class ItemImagesModule {}
