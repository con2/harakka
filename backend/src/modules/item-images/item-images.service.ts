import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { BucketUploadResult, ItemImageRow } from "./types/item-image.types";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { handleSupabaseError } from "@src/utils/handleError.utils";
import { Eq } from "@src/types/queryconstructor.types";
import { queryConstructor } from "@src/utils/queryconstructor.utils";
import { validateImageFile } from "@src/utils/validateImage.util";

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

    // 0. Validate the image file
    validateImageFile({
      buffer: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    // 1. Upload to supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(`item-images`)
      .upload(fileName, file.buffer, {
        contentType: "image/jpeg",
      });

    if (uploadError) {
      handleSupabaseError(uploadError);
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
        handleSupabaseError(dbError);
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
   * @param path Optional. Defines where the image will be stored. Use "/" to create folders
   * e.g. path = `${item_id}/${image_id}` where the folder is the item ID.
   * @returns An array of paths
   */
  async uploadToBucket(
    req: AuthRequest,
    bucket: string,
    files: Express.Multer.File[],
    path?: string,
  ): Promise<BucketUploadResult> {
    // Runtime type validation against type confusion through parameter tampering
    if (
      !Array.isArray(files) ||
      files.some(
        (file) =>
          typeof file !== "object" ||
          !file ||
          typeof file.originalname !== "string" ||
          typeof file.buffer === "undefined",
      )
    ) {
      throw new BadRequestException(
        "Invalid files parameter: expected array of files.",
      );
    }
    const supabase = req.supabase;
    const result: BucketUploadResult = {
      paths: [],
      urls: [],
      full_paths: [],
    };

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = file.filename || file.originalname || "cropped.jpg";
        validateImageFile({
          buffer: file.buffer,
          filename,
          mimetype: file.mimetype,
          size: file.size,
        });
        const fileExt = file.originalname.split(".").pop()?.toLowerCase();
        const fileName = path ? `${path}.${fileExt}` : `${uuidv4()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, files[i].buffer, {
            upsert: true,
            contentType: "image/jpeg",
          });
        if (error) {
          error.message = `Failed to upload image: ${files[i].originalname}`;
          handleSupabaseError(error);
        }
        if (data?.fullPath) {
          const full_url = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`;
          result.urls.push(full_url);
          result.paths.push(data.path);
          result.full_paths.push(data.fullPath);
        }
      }
    } catch (error) {
      handleSupabaseError(error);
    }
    return result;
  }

  async removeFromBucket(req: AuthRequest, bucket: string, paths: string[]) {
    const supabase = req.supabase;
    try {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) handleSupabaseError(error);
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
    if (removeErr) handleSupabaseError(removeErr);

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

  constructUrl(path: string) {
    return `${process.env.SUPABASE_URL}/storage/v1/object/public/item-images/${path}`;
  }

  async getImageData(
    supabase: SupabaseClient,
    select: string[],
    eq: Eq[],
  ): Promise<ItemImageRow[]> {
    const query = queryConstructor(
      supabase,
      "storage_item_images",
      select.join(","),
      eq,
    );

    const { data, error } = await query;
    if (error) handleSupabaseError(error);
    return data as ItemImageRow[];
  }

  /** Copy images in storage and insert new metadata records */
  async copyImages(
    supabase: SupabaseClient,
    oldItemId: string,
    newItemId: string,
  ) {
    const { data: images, error } = await supabase
      .from("storage_item_images")
      .select("*")
      .eq("item_id", oldItemId);

    if (error) handleSupabaseError(error);
    if (!images) return [];

    const updatedImages: ItemImageRow[] = [];
    for (const img of images) {
      const parts = img.storage_path.split("/");
      const fileName = parts[parts.length - 1];
      const newPath = `${newItemId}/${fileName}`;
      const newUrl = this.constructUrl(newPath);

      const { error: copyErr } = await supabase.storage
        .from("item-images")
        .copy(img.storage_path, newPath);

      if (copyErr) handleSupabaseError(copyErr);

      const { id, created_at, updated_at, ...rest } = img;
      updatedImages.push({
        ...rest,
        storage_path: newPath,
        image_url: newUrl,
        item_id: newItemId,
      });
    }

    const { error: insertErr } = await supabase
      .from("storage_item_images")
      .insert(updatedImages);

    if (insertErr) handleSupabaseError(insertErr);
    return updatedImages;
  }
}
