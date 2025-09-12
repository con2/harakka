import { BadRequestException, Logger } from "@nestjs/common";

const logger = new Logger("ImageValidation");

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImageValidationInput {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  size?: number;
}

export function validateImageFile(input: ImageValidationInput) {
  const missingFields: string[] = [];
  if (!input) missingFields.push("input");
  if (!input?.buffer) missingFields.push("buffer");
  if (!input?.filename) missingFields.push("filename");
  if (!input?.mimetype) missingFields.push("mimetype");

  if (missingFields.length > 0) {
    logger.error(
      `Image validation failed: missing ${missingFields.join(", ")}`,
    );
    throw new BadRequestException(
      `Incomplete image file data provided. Missing: ${missingFields.join(", ")}`,
    );
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
