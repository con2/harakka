import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class ProfilePictureService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async uploadProfilePicture(
    fileBuffer: Buffer,
    fileName: string,
    userId: string,
  ): Promise<string> {
    const fileExtension = fileName.split(".").pop();
    const newFileName = `${userId}-${uuidv4()}.${fileExtension}`;
    const filePath = `${userId}/${newFileName}`;

    const { error } = await this.supabaseService.storage
      .from("profile-pictures")
      .upload(filePath, fileBuffer, {
        contentType: "image/" + fileExtension,
        upsert: true,
      });

    if (error) {
      throw new Error("Upload failed: " + error.message);
    }

    const { data } = this.supabaseService.storage
      .from("profile-pictures")
      .getPublicUrl(filePath);
    return data.publicUrl;
  }
}
