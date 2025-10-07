import { BaseEntity } from "./common";

/**
 * Supported image types for uploads
 */
export type ImageType = "main" | "detail";

/**
 * Allowed MIME types for file uploads
 */
export type AllowedMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif";

/**
 * Image file upload size and type constraints
 */
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ] as readonly AllowedMimeType[],
  // Add specific subsets if needed in the future
  // PRODUCT_TYPES: ["image/jpeg", "image/png"] as const,
};

/**
 * Item image entity
 */
export interface ItemImage extends BaseEntity {
  item_id: string;
  image_url: string;
  image_type: ImageType;
  display_order: number;
  alt_text?: string;
  is_active: boolean;
  storage_path?: string;
  object_fit: "cover" | "contain";
}

/**
 * Data required to upload a new item image
 */
export interface UploadItemImageDto {
  image_type: ImageType;
  display_order: number;
  alt_text?: string;
  is_active: boolean;
  object_fit: "contain" | "cover";
}

export type FileWithMetadata = {
  file: File;
  metadata: UploadItemImageDto;
};

export type MainImageData = {
  image: {
    file: File | null;
    metadata: UploadItemImageDto;
    id: string;
  };
  preview: string | null;
  loading: boolean;
};

export type DetailImageData = {
  images: (FileWithMetadata & { path: string; id: string })[];
  previews: string[];
  loading: boolean;
};

/**
 * Image availability info for client-side display
 */
export interface ItemImageAvailabilityInfo {
  availableQuantity: number;
  isChecking: boolean;
  error: string | null;
}
