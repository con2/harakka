import { BadRequestException } from "@nestjs/common";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

export interface ImageValidationInput {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  size?: number;
}

export function validateImageFile(input: ImageValidationInput) {
  if (!input || !input.buffer || !input.filename || !input.mimetype) {
    throw new BadRequestException("Incomplete image file data provided");
  }

  const size = input.size ?? input.buffer.length;

  // Validate MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(input.mimetype)) {
    throw new BadRequestException(
      `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    );
  }

  // Validate extension (for feedback/storage, not security)
  const ext = input.filename.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new BadRequestException(
      `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}`,
    );
  }

  // Validate file size
  if (size > MAX_IMAGE_SIZE) {
    throw new BadRequestException(
      `File is too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
    );
  }

  // Optionally: Validate buffer is a real image (advanced)
  // Use 'sharp' or 'image-size' for this if needed
}
