import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { S3Service } from "../supabase/s3-supabase.service";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { ItemImageRow } from "./types/item-image.types";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

@Injectable()
export class ItemImagesService {
  private readonly logger = new Logger(ItemImagesService.name);

  constructor(
    private supabaseService: SupabaseService,
    private s3Service: S3Service,
  ) {}

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

    this.logger.log("Uploading to S3 Storage:", {
      key: fileName,
      contentType: contentType,
    });

    // 1. Upload to S3 storage
    let imageUrl: string;
    try {
      imageUrl = await this.s3Service.uploadFile(
        fileName,
        file.buffer,
        contentType,
      );
    } catch (error: unknown) {
      this.logger.error("S3 storage upload error:", error);
      if (error instanceof Error) {
        throw new Error(`Storage upload failed: ${error.message}`);
      }
      throw new Error("Storage upload failed");
    }

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
          storage_path: fileName, // Save the S3 path for future reference
        })
        .select()
        .single();

      if (dbError) {
        // Cleanup S3 on database failure
        await this.s3Service.deleteFile(fileName);
        throw new Error(`Database record creation failed: ${dbError.message}`);
      }

      return imageRecord;
    } catch (error) {
      // Cleanup S3 on any exception
      await this.s3Service.deleteFile(fileName);
      throw error;
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

    if (error) throw new Error(error.message);

    return data || [];
  }

  /**
   * Delete an item image
   */
  async deleteItemImage(imageId: string): Promise<{ success: boolean }> {
    const supabase = this.supabaseService.getServiceClient();

    // 1. Get the image record
    const {
      data: image,
      error: fetchError,
    }: PostgrestSingleResponse<ItemImageRow> = await supabase
      .from("storage_item_images")
      .select("*")
      .eq("id", imageId)
      .single();

    if (fetchError || !image) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Image not found";
      throw new Error(message);
    }

    // 2. Extract filepath from database
    const storagePath =
      image.storage_path || this.extractPathFromUrl(image.image_url);

    // 3. Delete from S3
    await this.s3Service.deleteFile(storagePath);

    // 4. Delete database record
    const { error: deleteError } = await supabase
      .from("storage_item_images")
      .delete()
      .eq("id", imageId);

    if (deleteError) throw new Error(deleteError.message);

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
