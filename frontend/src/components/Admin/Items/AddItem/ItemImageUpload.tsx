import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  removeFromBucket,
  selectUploadUrls,
  setUploadImageType,
  uploadToBucket,
} from "@/store/slices/itemImagesSlice";
import { CreateItemType } from "@common/items/form.types";
import { Info, Trash } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

const MAX_DETAIL_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;

type ImageData = {
  id: string;
  preview: string | null;
  path: string;
  alt_text: string;
  uploading: boolean;
};

type ItemImageUploadProps = {
  item_id: string;
  updateForm: UseFormSetValue<CreateItemType>;
  formImages: CreateItemType["images"];
};

function ItemImageUpload({
  item_id,
  updateForm,
  formImages,
}: ItemImageUploadProps) {
  const dispatch = useAppDispatch();
  const uploadedImages = useAppSelector(selectUploadUrls);
  const { lang } = useLanguage();

  const [images, setImages] = useState<{
    main: ImageData | null;
    details: ImageData[];
  }>({
    main: formImages
      ? {
          id: formImages?.main?.id ?? crypto.randomUUID(),
          preview: formImages?.main?.url ?? null,
          path: formImages?.main?.path ?? "",
          alt_text: formImages?.main?.metadata.alt_text ?? "",
          uploading: false,
        }
      : null,
    details: formImages?.details?.map((img) => ({
      id: img.id ?? crypto.randomUUID(),
      preview: img.url ?? "",
      path: img.path ?? "",
      alt_text: img.metadata.alt_text ?? "",
      uploading: false,
    })),
  });

  const [dragStates, setDragStates] = useState({
    main: false,
    detail: false,
  });

  const previewUrls = useRef<Set<string>>(new Set());

  const validateFile = useCallback((file: File): void => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      throw new Error(`${file.name} is too large (max ${MAX_FILE_SIZE_MB}MB)`);
    }
    if (!file.type.startsWith("image/")) {
      throw new Error(`${file.name} is not an image`);
    }
  }, []);

  const createImageData = useCallback((file: File): ImageData => {
    const preview = URL.createObjectURL(file);
    previewUrls.current.add(preview);

    return {
      id: crypto.randomUUID(),
      preview,
      path: "",
      alt_text: "",
      uploading: false,
    };
  }, []);

  const uploadImage = useCallback(
    async (file: File, imageType: "main" | "detail", path: string) => {
      dispatch(setUploadImageType(imageType));
      return dispatch(
        uploadToBucket({
          files: [file],
          bucket: "item-images",
          path: `${item_id}/${path}`,
        }),
      ).unwrap();
    },
    [dispatch, item_id],
  );

  const handleMainImageUpload = useCallback(
    async (file: File) => {
      try {
        validateFile(file);
        const imageData = createImageData(file);

        setImages((prev) => ({
          ...prev,
          main: { ...imageData, uploading: true },
        }));

        await uploadImage(file, "main", imageData.id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        toast.error(message);
        setImages((prev) => ({
          ...prev,
          main: prev.main ? { ...prev.main, uploading: false } : null,
        }));
      }
    },
    [validateFile, createImageData, uploadImage],
  );

  const handleDetailImagesUpload = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);
      const currentCount = images.details.length;

      if (currentCount + fileArray.length > MAX_DETAIL_IMAGES) {
        toast.error(`Only ${MAX_DETAIL_IMAGES} images allowed`);
        return;
      }

      try {
        // Validate all files first
        fileArray.forEach(validateFile);

        const newImages = fileArray.map(createImageData);

        setImages((prev) => ({
          ...prev,
          details: [
            ...prev.details,
            ...newImages.map((img) => ({ ...img, uploading: true })),
          ],
        }));

        // Upload all files
        await Promise.all(
          fileArray.map((file, index) =>
            uploadImage(file, "detail", `detail-${currentCount + index + 1}`),
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        toast.error(message);

        // Remove failed uploads
        setImages((prev) => ({
          ...prev,
          details: prev.details.slice(0, currentCount),
        }));
      }
    },
    [images.details.length, validateFile, createImageData, uploadImage],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, type: "main" | "detail") => {
      const files = event.target.files;
      if (!files) return;

      if (type === "main") {
        if (files.length > 1) {
          toast.error("Only one main image allowed");
          return;
        }
        void handleMainImageUpload(files[0]);
      } else {
        void handleDetailImagesUpload(files);
      }

      // Reset input
      event.target.value = "";
    },
    [handleMainImageUpload, handleDetailImagesUpload],
  );

  // Drag and drop handlers
  const handleDragEnter = useCallback(
    (e: React.DragEvent, type: "main" | "detail") => {
      e.preventDefault();
      e.stopPropagation();
      setDragStates((prev) => ({ ...prev, [type]: true }));
    },
    [],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent, type: "main" | "detail") => {
      e.preventDefault();
      e.stopPropagation();
      // Only set to false if we're leaving the drop zone entirely
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setDragStates((prev) => ({ ...prev, [type]: false }));
      }
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "main" | "detail") => {
      e.preventDefault();
      e.stopPropagation();
      setDragStates((prev) => ({ ...prev, [type]: false }));

      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      if (type === "main") {
        if (files.length > 1) {
          toast.error("Only one main image allowed");
          return;
        }
        void handleMainImageUpload(files[0]);
      } else {
        void handleDetailImagesUpload(files);
      }
    },
    [handleMainImageUpload, handleDetailImagesUpload],
  );

  const updateImageAltText = useCallback(
    (type: "main" | "detail", index: number | null, altText: string) => {
      setImages((prev) => {
        if (type === "main" && prev.main) {
          return {
            ...prev,
            main: { ...prev.main, alt_text: altText },
          };
        } else if (type === "detail" && index !== null && prev.details[index]) {
          const newDetails = [...prev.details];
          newDetails[index] = { ...newDetails[index], alt_text: altText };
          return { ...prev, details: newDetails };
        }
        return prev;
      });
    },
    [],
  );

  const removeDetailImage = useCallback(
    (index: number) => {
      const imageToRemove = images.details[index];
      if (!imageToRemove) return;

      if (imageToRemove.path) {
        void dispatch(
          removeFromBucket({
            bucket: "item-images-drafts",
            paths: [imageToRemove.path],
          }),
        );
      }

      setImages((prev) => ({
        ...prev,
        details: prev.details.filter((_, idx) => idx !== index),
      }));
    },
    [images.details, dispatch],
  );

  const removeMainImage = useCallback(() => {
    if (!images.main) return;

    if (images.main.path) {
      void dispatch(
        removeFromBucket({
          bucket: "item-images-drafts",
          paths: [images.main.path],
        }),
      );
    }

    // Clear from form
    updateForm("images.main", null);

    setImages((prev) => ({
      ...prev,
      main: null,
    }));
  }, [images.main, dispatch, updateForm]);

  // Update form when upload completes
  useEffect(() => {
    if (!uploadedImages) return;

    const { imageType, urls, paths, full_paths } = uploadedImages;

    if (imageType === "main" && images.main) {
      setImages((prev) => ({
        ...prev,
        main: prev.main
          ? { ...prev.main, path: paths[0], uploading: false }
          : null,
      }));

      updateForm("images.main", {
        id: images.main.id,
        url: urls[0],
        full_path: full_paths[0],
        path: paths[0],
        metadata: {
          image_type: "main",
          display_order: 0,
          alt_text: images.main.alt_text,
          is_active: false,
        },
      });
    } else if (imageType === "detail") {
      setImages((prev) => ({
        ...prev,
        details: prev.details.map((img, i) => ({
          ...img,
          path: paths[i] || img.path,
          uploading: false,
        })),
      }));

      updateForm(
        "images.details",
        images.details.map((img, i) => ({
          id: img.id ?? crypto.randomUUID(),
          url: urls[i],
          full_path: full_paths[i],
          path: paths[i],
          metadata: {
            image_type: "detail",
            display_order: i,
            alt_text: img.alt_text,
            is_active: false,
          },
        })),
      );
    }
  }, [uploadedImages, updateForm, images.main, images.details]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
    };
  }, []);

  const isMainUploading = images.main?.uploading ?? false;
  const isDetailUploading = images.details.some((img) => img.uploading);

  return (
    <>
      <div className="mb-8">
        <div>
          <p className="scroll-m-20 text-base font-semibold tracking-tight w-full mb-1">
            {t.addItemForm.paragraphs.mainImage[lang]}
          </p>
          <p className="text-sm leading-none font-medium mb-4">
            {t.addItemForm.paragraphs.mainImageDescription[lang]}
          </p>
        </div>
        <div className="mb-3">
          <Button
            type="button"
            className={`flex flex-1 border-1 border-dashed w-full min-h-[200px] flex-col transition-colors ${
              dragStates.main ? "border-primary bg-primary/5" : ""
            } ${isMainUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isMainUploading}
            onClick={(e) => {
              e.preventDefault();
              if (!isMainUploading) {
                document.getElementById("main-image")?.click();
              }
            }}
            onDragEnter={(e) => handleDragEnter(e, "main")}
            onDragLeave={(e) => handleDragLeave(e, "main")}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "main")}
          >
            {images.main?.preview ? (
              <img
                src={images.main.preview}
                className="w-30 h-30 rounded"
                alt="Main image preview"
              />
            ) : (
              <>
                {isMainUploading
                  ? t.addItemForm.buttons.uploading[lang]
                  : t.addItemForm.buttons.mainImageUpload[lang]}
                <p className="text-xs mt-1 text-muted-foreground">
                  {t.addItemForm.buttons.uploadSubtext[lang]}
                </p>
              </>
            )}
          </Button>
          <input
            id="main-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, "main")}
          />
        </div>
        <div className="flex justify-between items-end">
          {images?.main?.preview && (
            <div className="max-w-[400px]">
              <div className="flex gap-2 w-fit items-center mb-2">
                <Label className="mb-0">Alt text</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p>{t.addItemForm.tooltips.altText[lang]}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Input
                placeholder={t.addItemForm.placeholders.describeImage[lang]}
                className="w-[280px] border shadow-none border-grey"
                value={images.main?.alt_text || ""}
                onChange={(e) =>
                  updateImageAltText("main", null, e.target.value)
                }
                disabled={!images.main}
              />
            </div>
          )}
          {images.main?.preview && (
            <Button
              variant="destructive"
              className="self-center"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                removeMainImage();
              }}
              disabled={isMainUploading}
            >
              <Trash />
            </Button>
          )}
        </div>
      </div>

      {/* Detail images */}
      <div>
        <div>
          <p className="scroll-m-20 text-base font-semibold tracking-tight w-full mb-1">
            {t.addItemForm.paragraphs.detailImage[lang]}
          </p>
          <p className="text-sm leading-none font-medium mb-4">
            {t.addItemForm.paragraphs.detailImageDescription[lang]}
          </p>
        </div>
        <div className="mb-6">
          <Button
            type="button"
            className={`flex flex-1 border-1 border-dashed w-full min-h-[200px] flex-col transition-colors ${
              dragStates.detail ? "border-primary bg-primary/5" : ""
            } ${isDetailUploading || images.details.length >= MAX_DETAIL_IMAGES ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={
              isDetailUploading || images.details.length >= MAX_DETAIL_IMAGES
            }
            onClick={(e) => {
              e.preventDefault();
              if (
                !isDetailUploading &&
                images.details.length < MAX_DETAIL_IMAGES
              ) {
                document.getElementById("detail-image")?.click();
              }
            }}
            onDragEnter={(e) => handleDragEnter(e, "detail")}
            onDragLeave={(e) => handleDragLeave(e, "detail")}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "detail")}
          >
            {isDetailUploading ? (
              t.addItemForm.buttons.uploading[lang]
            ) : dragStates.detail ? (
              t.addItemForm.buttons.dropImages[lang]
            ) : images.details.length >= MAX_DETAIL_IMAGES ? (
              t.addItemForm.buttons.maxReached[lang]
            ) : (
              <>
                {t.addItemForm.buttons.detailImageUpload[lang]}
                <p className="text-xs mt-1 text-muted-foreground">
                  {t.addItemForm.buttons.uploadSubtext[lang]}
                </p>
              </>
            )}
          </Button>
          <input
            id="detail-image"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, "detail")}
          />
        </div>
        {images.details.length > 0 && (
          <div className="flex flex-col gap-4">
            {images.details.map((image, idx) => (
              <div key={image.id} className="flex gap-4">
                <img
                  src={image.preview || ""}
                  className="w-20 rounded"
                  alt={`Detail image ${idx + 1}`}
                />
                <div className="flex justify-between w-full">
                  <div>
                    <div className="flex gap-2 w-fit items-center mb-2">
                      <Label className="mb-0">Alt text</Label>
                    </div>

                    <Input
                      type="text"
                      placeholder={
                        t.addItemForm.placeholders.describeImage[lang]
                      }
                      className="w-[250px] border shadow-none border-grey"
                      value={image.alt_text}
                      onChange={(e) =>
                        updateImageAltText("detail", idx, e.target.value)
                      }
                      disabled={image.uploading}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    className="self-center"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeDetailImage(idx);
                    }}
                    disabled={image.uploading}
                  >
                    <Trash />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ItemImageUpload;
