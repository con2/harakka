import { api } from '../axios';
import { ItemImage, UploadItemImageDto } from '@/types/storage';

export const itemImagesApi = {
  /**
   * Get all images for an item
   */
  getItemImages: (itemId: string): Promise<ItemImage[]> =>
    api.get(`/item-images/${itemId}`),

  /**
   * Upload an image for an item
   */
  uploadItemImage: (
    itemId: string,
    file: File,
    metadata: UploadItemImageDto,
  ): Promise<ItemImage> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('image_type', metadata.image_type);
    formData.append('display_order', metadata.display_order.toString());
    if (metadata.alt_text) {
      formData.append('alt_text', metadata.alt_text);
    }

    return api.post(`/item-images/${itemId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete an item image
   */
  deleteItemImage: (imageId: string): Promise<void> =>
    api.delete(`/item-images/${imageId}`),
};
