import { api } from '../axios';

export interface ItemImage {
  id: string;
  item_id: string;
  image_url: string;
  image_type: 'main' | 'thumbnail' | 'detail';
  display_order: number;
  alt_text?: string;
  is_active: boolean;
  created_at: string;
}

export interface UploadItemImageDto {
  image_type: 'main' | 'thumbnail' | 'detail';
  display_order: number;
  alt_text?: string;
}

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
