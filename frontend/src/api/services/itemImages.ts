import { api } from "../axios";
import { FileWithMetadata, ItemImage } from "@/types/storage";

export const itemImagesApi = {
  /**
   * Get all images for an item
   */
  getItemImages: (itemId: string): Promise<ItemImage[]> =>
    api.get(`/item-images/${itemId}`),

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
      formData.append("image_type", metadata.image_type);
      formData.append("display_order", metadata.display_order.toString());
      formData.append("is_active", metadata.is_active.toString());
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
   * @param uuid Optional. If to upload the image under a particular UUID
   */
  uploadToBucket: async (
    files: FileWithMetadata[],
    bucket: string,
    uuid?: string,
  ): Promise<string[]> => {
    if (files.length > 5) throw new Error("File limit exceeded.");
    const formData = new FormData();
    files.forEach(({ file }) => formData.append("image", file));

    const result = await api.post(
      `item-images/bucket/${bucket}?uuid=${uuid}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return result;
  },

  /**
   * Delete an item image
   */
  deleteItemImage: (imageId: string): Promise<void> =>
    api.delete(`/item-images/${imageId}`),
};
