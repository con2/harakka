import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { BucketUploadResult, ItemImageRow } from "./types/item-image.types";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { handleSupabaseError } from "@src/utils/handleError.utils";

@Injectable()
export class ItemImagesService {
  private readonly logger = new Logger(ItemImagesService.name);

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Upload an image to S3 storage and create a database record
   */
  async uploadItemImage(
    req: AuthRequest,
    itemId: string,
    file: Express.Multer.File,
    metadata: {
      alt_text?: string;
      image_type: "main" | "thumbnail" | "detail";
      display_order: number;
    },
  ) {
    const supabase = req.supabase;
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${itemId}/${uuidv4()}.${fileExt}`;
    const contentType = file.mimetype;

    this.logger.log("Uploading to supabase storage:", {
      key: fileName,
      contentType: contentType,
    });

    // 1. Upload to supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(`item-images`)
      .upload(fileName, file.buffer, {
        contentType: "image/jpeg",
      });

    if (uploadError || !uploadData) {
      const message =
        uploadError instanceof Error ? uploadError.message : "Upload failed";
      throw new Error(message);
    }

    const imageUrl = `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/item-images/${uploadData.path}`;

    // 2. Create database record
    try {
      const { data: imageRecord, error: dbError } = await supabase
        .from("storage_item_images")
        .insert({
          item_id: itemId,
          image_url: imageUrl,
          image_type: metadata.image_type,
          display_order: metadata.display_order,
          alt_text: metadata.alt_text || "",
          is_active: true,
          storage_path: uploadData.path,
        })
        .select()
        .single();

      if (dbError) {
        await supabase.storage
          .from("item-images")
          .remove([uploadData.fullPath]);
        throw new Error(`Database record creation failed: ${dbError.message}`);
      }

      return imageRecord;
    } catch (error) {
      await supabase.storage
        .from("public/item-images")
        .remove([uploadData.fullPath]);
      // Handle any other errors
      handleSupabaseError(error);
    }
  }

  /**
   * Upload to bucket without creating a db record for it.
   * If a file already exists at the path, it will be overwritten.
   * @param req An authorized request
   * @param bucket Name of bucket to upload to
   * @param files An array of files to upload
   * @param uuid Optional. A uuid used for the path
   * @returns An array of paths
   */
  async uploadToBucket(
    req: AuthRequest,
    bucket: string,
    files: Express.Multer.File[],
    path?: string,
  ): Promise<BucketUploadResult> {
    const supabase = req.supabase;
    const result: BucketUploadResult = {
      paths: [],
      urls: [],
      full_paths: [],
    };
    console.log("path: ", path);

    try {
      for (let i = 0; i < files.length; i++) {
        const fileExt = files[i].originalname.split(".").pop();
        const fileName = path ? `${path}.${fileExt}` : `${uuidv4()}.${fileExt}`;
        console.log("filename: ", fileName);
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, files[i].buffer, {
            upsert: true,
            contentType: "image/jpeg",
          });
        if (error) {
          throw new Error(`Failed to upload image: ${files[i].originalname}`);
        }
        console.log("Data: ", data);
        if (data?.fullPath) {
          const full_url = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`;
          result.urls.push(full_url);
          result.paths.push(data.path);
          result.full_paths.push(data.fullPath);
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
    return result;
  }

  async moveFromBucket(
    req: AuthRequest,
    from_bucket: string,
    to_bucket: string,
    paths: string[],
  ) {
    const supabase = req.supabase;
    const result: { file: string; status: string }[] = [];
    try {
      for (const path of paths) {
        const { data, error } = await supabase.storage
          .from(from_bucket)
          .move(path, `${to_bucket}/${path}`);
        if (error) throw new Error(`Failed to move image with id ${path}`);
        result.push({ file: path, status: data.message });
      }
    } catch (error) {
      console.error(error);
    }
    return result;
  }

  async removeFromBucket(req: AuthRequest, bucket: string, paths: string[]) {
    const supabase = req.supabase;
    try {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) throw new Error("Failed to remove files.");
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  }

  /**
   * Get all images for an item
   */
  async getItemImages(itemId: string): Promise<ItemImageRow[]> {
    const supabase = this.supabaseService.getAnonClient();

    const { data, error }: PostgrestResponse<ItemImageRow> = await supabase
      .from("storage_item_images")
      .select("*")
      .eq("item_id", itemId)
      .eq("is_active", true)
      .order("display_order");

    if (error) {
      handleSupabaseError(error);
    }

    return data || [];
  }

  /**
   * Delete an item image
   */
  async deleteItemImage(
    req: AuthRequest,
    imageId: string,
  ): Promise<{ success: boolean }> {
    const supabase = req.supabase;

    // 1. Get the image record
    const { data: image, error }: PostgrestSingleResponse<ItemImageRow> =
      await supabase
        .from("storage_item_images")
        .select("*")
        .eq("id", imageId)
        .single();

    if (error) {
      handleSupabaseError(error);
    }

    // 2. Delete from storage
    const { error: removeErr } = await supabase.storage
      .from("item-images")
      .remove([image.storage_path]);
    if (removeErr) throw new Error("Could not remove from storage");

    // 3. Delete database record
    const { error: deleteError } = await supabase
      .from("storage_item_images")
      .delete()
      .eq("id", imageId);

    if (deleteError) {
      handleSupabaseError(deleteError);
    }

    return { success: true };
  }

  /**
   * Helper to extract path from URL if storage_path not available
   */
  private extractPathFromUrl(url: string): string {
    // Extract the path after the bucket name
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    // Find the bucket name index and take everything after it
    const bucketIndex = pathParts.findIndex((part) => part === "item-images");
    if (bucketIndex === -1) {
      throw new Error("Could not extract path from URL");
    }

    return pathParts.slice(bucketIndex + 1).join("/");
  }
}
