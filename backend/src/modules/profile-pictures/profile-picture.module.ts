import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { ProfilePictureService } from "./profile-picture.service";
import { ProfilePictureController } from "./profile-picture.controller";

@Module({
  imports: [SupabaseModule],
  controllers: [ProfilePictureController],
  providers: [ProfilePictureService],
})
export class ProfilePictureModule {}
