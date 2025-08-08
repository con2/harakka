import { BucketUploadResult } from "@/types";
import { api } from "../axios";
import {
  FileWithMetadata,
  ItemImage,
  UploadItemImageDto,
} from "@/types/storage";

export const itemImagesApi = {
  /**
   * Get all images for an item
   */
  getItemImages: (itemId: string): Promise<ItemImage[]> =>
    api.get(`/item-images/${itemId}`),

  uploadItemImageModal: (
    itemId: string,
    file: File,
    metadata: UploadItemImageDto,
  ): Promise<ItemImage> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("image_type", metadata.image_type);
    formData.append("display_order", metadata.display_order.toString());
    if (metadata.alt_text) {
      formData.append("alt_text", metadata.alt_text);
    }

    return api.post(`/item-images/${itemId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Upload an image and create a database record
   */
  uploadItemImages: async (
    itemId: string,
    files: FileWithMetadata[],
  ): Promise<ItemImage[]> => {
    const results: ItemImage[] = [];

    for (const { file, metadata } of files) {
      const formData = new FormData();
      formData.append("image", file);
      if (metadata.alt_text) {
        formData.append("alt_text", metadata.alt_text);
      }

      const response = await api.post<ItemImage>(
        `/item-images/${itemId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      results.push(response.data);
    }

    return results;
  },

  /**
   * Upload to bucket without creating a db record for it.
   * If a file already exists at the path, it will be overwritten.
   * @param files An array with files and metadata
   * @param bucket Name for the bucket to upload to
   * @param path Optional. If to upload the image under a particular UUID
   */
  uploadToBucket: async (
    files: File[],
    bucket: string,
    path?: string,
  ): Promise<BucketUploadResult> => {
    if (files.length > 5) throw new Error("File limit exceeded.");
    const formData = new FormData();
    files.forEach((file) => formData.append("image", file));

    return await api.post(
      `item-images/bucket/${bucket}?path=${path}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },

  /**
   * Remove files from a bucket
   * @param bucket Bucket name to remove from
   * @param path Filepath to remove from bucket
   * @returns a success object (true / false)
   */
  removeFromBucket: async (
    bucket: string,
    paths: string[],
  ): Promise<{ success: boolean }> => {
    return await api.delete(`item-images/bucket/${bucket}`, {
      data: paths,
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  /**
   * Delete an item image
   */
  deleteItemImage: (imageId: string): Promise<void> =>
    api.delete(`/item-images/${imageId}`),
};
