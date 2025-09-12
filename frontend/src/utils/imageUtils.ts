import { z } from "zod";
import { AllowedMimeType, FILE_CONSTRAINTS } from "@/types/storage";
import { t } from "@/translations";
import { SUPPORTED_LANGUAGES } from "@/translations/SUPPORTED_LANGUAGES";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

export const getCroppedImg = async (
  imageSrc: string,
  _crop: { x: number; y: number },
  zoom: number,
  _aspect: number,
  croppedAreaPixels: { width: number; height: number; x: number; y: number },
  rotation: number,
  lang: (typeof SUPPORTED_LANGUAGES)[number] = "en",
): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Failed to get canvas context");

  const radians = (rotation * Math.PI) / 180;
  const safeArea = Math.max(image.width, image.height) * 2; // make canvas bigger to fit rotation

  canvas.width = safeArea;
  canvas.height = safeArea;

  // rotation is in the middle of the picture
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(radians);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // ToDo: handle zoom doesn't work properly
  const scaledWidth = image.width * zoom;
  const scaledHeight = image.height * zoom;

  ctx.drawImage(
    image,
    (safeArea - scaledWidth) / 2,
    (safeArea - scaledHeight) / 2,
    scaledWidth,
    scaledHeight,
  );

  // crop the image
  const data = ctx.getImageData(
    (safeArea - scaledWidth) / 2 + croppedAreaPixels.x,
    (safeArea - scaledHeight) / 2 + croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = croppedAreaPixels.width;
  outputCanvas.height = croppedAreaPixels.height;
  const outputCtx = outputCanvas.getContext("2d");

  if (!outputCtx) throw new Error("Failed to get canvas context");

  outputCtx.putImageData(data, 0, 0);

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

export function validateImage(
  maxSize = FILE_CONSTRAINTS.MAX_FILE_SIZE,
  acceptedTypes = FILE_CONSTRAINTS.ALLOWED_FILE_TYPES,
  lang: (typeof SUPPORTED_LANGUAGES)[number] = "en",
) {
  return z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: t.itemImageUpload.messages.emptyFile[lang],
    })
    .refine((file) => file.size <= maxSize, {
      message: t.itemImageUpload.messages.fileTooLarge[lang].replace(
        "{size}",
        `${Math.round(maxSize / (1024 * 1024))}`,
      ),
    })
    .refine((file) => acceptedTypes.includes(file.type as AllowedMimeType), {
      message: t.itemImageUpload.messages.invalidFileType[lang],
    });
}

export function useImageValidator() {
  const { lang } = useLanguage();

  return {
    /**
     * Validates an image file and shows toast messages for errors
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
