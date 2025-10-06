import { z } from "zod";
import { AllowedMimeType, FILE_CONSTRAINTS } from "@/types/storage";
import { t } from "@/translations";
import { SUPPORTED_LANGUAGES_KEYS } from "@/translations/SUPPORTED_LANGUAGES";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

// Converts degrees to radians for rotation calculations
const DEG_TO_RAD = Math.PI / 180;
const getRadianAngle = (angle: number) => angle * DEG_TO_RAD;

// Calculates the bounding box dimensions of an image after rotation
const getRotatedSize = (
  width: number,
  height: number,
  rotationRad: number,
) => ({
  width:
    Math.abs(Math.cos(rotationRad) * width) +
    Math.abs(Math.sin(rotationRad) * height),
  height:
    Math.abs(Math.sin(rotationRad) * width) +
    Math.abs(Math.cos(rotationRad) * height),
});

/**
 * Crops an image based on the provided crop area and rotation.
 * @param imageSrc - Source URL of the image to crop
 * @param _crop - Crop position (x, y)
 * @param _zoom - Zoom level applied to the crop
 * @param _aspect - Aspect ratio of the crop
 * @param croppedAreaPixels - Exact pixel dimensions of the crop area
 * @param rotation - Rotation angle in degrees
 * @param lang - Language for error messages
 * @returns A Promise resolving to the cropped image file
 */
export const getCroppedImg = async (
  imageSrc: string,
  _crop: { x: number; y: number },
  _zoom: number,
  _aspect: number,
  croppedAreaPixels: { width: number; height: number; x: number; y: number },
  rotation: number,
  lang: (typeof SUPPORTED_LANGUAGES_KEYS)[number] = "en",
): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Failed to get canvas context");

  // Calculate rotation in radians and the rotated canvas size
  const rotationRad = getRadianAngle(rotation);
  const { width: canvasWidth, height: canvasHeight } = getRotatedSize(
    image.width,
    image.height,
    rotationRad,
  );

  // Set canvas dimensions to accommodate the rotated image
  canvas.width = Math.ceil(canvasWidth);
  canvas.height = Math.ceil(canvasHeight);

  // Rotate the image around its center
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotationRad);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  // Extract the cropped area from the rotated image
  const cropX = Math.round(croppedAreaPixels.x);
  const cropY = Math.round(croppedAreaPixels.y);
  const cropWidth = Math.round(croppedAreaPixels.width);
  const cropHeight = Math.round(croppedAreaPixels.height);

  const data = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);

  // Create a new canvas for the cropped image
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = cropWidth;
  outputCanvas.height = cropHeight;
  const outputCtx = outputCanvas.getContext("2d");

  if (!outputCtx) throw new Error("Failed to get canvas context");

  // Place the cropped image data onto the new canvas
  outputCtx.putImageData(data, 0, 0);

  // Convert the cropped canvas to a Blob and validate the resulting file
  return new Promise((resolve, reject) => {
    outputCanvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Canvas is empty"));

      const croppedFile = new File([blob], "cropped.jpg", {
        type: "image/jpeg",
      });

      const result = validateImage(undefined, undefined, lang).safeParse(
        croppedFile,
      );
      if (!result.success) {
        reject(new Error(result.error.errors[0]?.message ?? "Invalid file"));
        return;
      }

      resolve(croppedFile);
    }, "image/jpeg");
  });
};

/**
 * Creates an HTMLImageElement from a given URL.
 * @param url - URL of the image
 * @returns A Promise resolving to the loaded image element
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (error) =>
      reject(
        new Error(typeof error === "string" ? error : "Image failed to load"),
      );
  });

/**
 * Validates an image file based on size and type constraints.
 * @param maxSize - Maximum allowed file size in bytes
 * @param acceptedTypes - Array of allowed MIME types
 * @param lang - Language for error messages
 * @returns A Zod schema for validating the image file
 */
export function validateImage(
  maxSize = FILE_CONSTRAINTS.MAX_FILE_SIZE,
  acceptedTypes = FILE_CONSTRAINTS.ALLOWED_FILE_TYPES,
  lang: (typeof SUPPORTED_LANGUAGES_KEYS)[number] = "en",
) {
  return z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message:
        t.itemImageUpload.messages.emptyFile[
          lang as keyof typeof t.itemImageUpload.messages.emptyFile
        ],
    })
    .refine((file) => file.size <= maxSize, {
      message: t.itemImageUpload.messages.fileTooLarge[
        lang as keyof typeof t.itemImageUpload.messages.fileTooLarge
      ].replace("{size}", `${Math.round(maxSize / (1024 * 1024))}`),
    })
    .refine((file) => acceptedTypes.includes(file.type as AllowedMimeType), {
      message:
        t.itemImageUpload.messages.invalidFileType[
          lang as keyof typeof t.itemImageUpload.messages.invalidFileType
        ],
    });
}

/**
 * Hook for validating image files and displaying error messages.
 * @returns An object with a validateFile method
 */
export function useImageValidator() {
  const { lang } = useLanguage();

  return {
    /**
     * Validates an image file and shows toast messages for errors.
     * @param file - File to validate
     * @param maxSize - Maximum allowed file size
     * @param acceptedTypes - Array of allowed MIME types
     * @returns true if valid, false if invalid
     */
    validateFile: (
      file: File,
      maxSize = FILE_CONSTRAINTS.MAX_FILE_SIZE,
      acceptedTypes = FILE_CONSTRAINTS.ALLOWED_FILE_TYPES,
    ): boolean => {
      const result = validateImage(maxSize, acceptedTypes, lang).safeParse(
        file,
      );

      if (!result.success) {
        toast.error(
          result.error.errors[0]?.message ?? t.common.errors.invalidFile[lang],
        );
        return false;
      }

      return true;
    },
  };
}
