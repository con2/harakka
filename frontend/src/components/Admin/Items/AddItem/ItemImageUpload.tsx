import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch } from "@/store/hooks";
import {
  removeFromBucket,
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
import { useImageValidator } from "@/utils/imageUtils";
import { FILE_CONSTRAINTS } from "@/types";

const MAX_DETAIL_IMAGES = 5;

type UUID = `${string}-${string}-${string}-${string}-${string}`;

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
  const { lang } = useLanguage();
  const { validateFile } = useImageValidator();

  // Simplified state - only track uploading status and drag states
  const [uploadingStates, setUploadingStates] = useState({
    main: false,
    details: new Set<string>(), // Track uploading detail images by ID
  });

  const [dragStates, setDragStates] = useState({ main: false, detail: false });
  const previewUrls = useRef<Set<string>>(new Set());

  const createPreviewUrl = useCallback((file: File): string => {
    const preview = URL.createObjectURL(file);
    previewUrls.current.add(preview);
    return preview;
  }, []);

  const uploadImage = useCallback(
    (files: File[], image_id: string) => {
      return dispatch(
        uploadToBucket({
          files,
          bucket: "item-images",
          path: `${item_id}/${image_id}`,
        }),
      ).unwrap();
    },
    [dispatch],
  );

  // MAIN IMAGE HANDLERS
  const handleMainImageUpload = useCallback(
    async (file: File) => {
      if (
        !validateFile(
          file,
          FILE_CONSTRAINTS.MAX_FILE_SIZE,
          FILE_CONSTRAINTS.ALLOWED_FILE_TYPES,
        )
      ) {
        return;
      }

      try {
        const id = crypto.randomUUID();
        const preview = createPreviewUrl(file);

        // Set uploading state and update form with preview
        setUploadingStates((prev) => ({ ...prev, main: true }));
        dispatch(setUploadImageType("main"));

        updateForm("images.main", {
          id,
          url: preview, // Use preview URL initially
          full_path: "",
          path: "",
          metadata: {
            image_type: "main",
            display_order: 0,
            alt_text: "",
            is_active: true,
          },
        });

        // Upload and update with real URLs
        const { urls, paths, full_paths } = await uploadImage([file], id);

        updateForm("images.main", {
          id,
          url: urls[0],
          full_path: full_paths[0],
          path: paths[0],
          metadata: {
            image_type: "main",
            display_order: 0,
            alt_text: "",
            is_active: true,
          },
        });

        setUploadingStates((prev) => ({ ...prev, main: false }));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t.itemImageUpload.messages.uploadFailed[lang],
        );
        setUploadingStates((prev) => ({ ...prev, main: false }));
      }
    },
    [validateFile, createPreviewUrl, uploadImage, updateForm, dispatch, lang],
  );

  const handleDetailImagesUpload = useCallback(
    async (filesList: FileList) => {
      const files = Array.from(filesList);
      const currentDetailsCount = formImages?.details?.length || 0;

      if (currentDetailsCount + files.length > MAX_DETAIL_IMAGES) {
        toast.error(`Only ${MAX_DETAIL_IMAGES} images allowed`);
        return;
      }

      // Validate all files before proceeding
      const allValid = files.every((file) =>
        validateFile(
          file,
          FILE_CONSTRAINTS.MAX_FILE_SIZE,
          FILE_CONSTRAINTS.ALLOWED_FILE_TYPES,
        ),
      );

      if (!allValid) return;

      try {
        // Create image data with previews
        const newImageData = files.map((file, idx) => {
          const id = crypto.randomUUID();
          const preview = createPreviewUrl(file);
          return {
            id,
            url: preview, // Use preview URL initially
            full_path: "",
            path: "",
            metadata: {
              image_type: "detail" as const,
              display_order: currentDetailsCount + idx,
              alt_text: "",
              is_active: true,
            },
          };
        });

        // Track uploading states
        const newUploadingIds = new Set(newImageData.map((img) => img.id));
        setUploadingStates((prev) => ({
          ...prev,
          details: new Set([...prev.details, ...newUploadingIds]),
        }));

        // Update form with preview data immediately
        const currentDetails = formImages?.details || [];
        updateForm("images.details", [...currentDetails, ...newImageData]);

        dispatch(setUploadImageType("detail"));

        // Upload files - need to upload each file with its corresponding ID
        const uploadPromises = files.map((file, idx) =>
          uploadImage([file], newImageData[idx].id),
        );
        const uploadResults = await Promise.all(uploadPromises);

        // Update form with real URLs
        const updatedImageData = newImageData.map((img, idx) => ({
          ...img,
          url: uploadResults[idx].urls[0],
          full_path: uploadResults[idx].full_paths[0],
          path: uploadResults[idx].paths[0],
        }));

        updateForm("images.details", [...currentDetails, ...updatedImageData]);

        // Clear uploading states
        setUploadingStates((prev) => ({
          ...prev,
          details: new Set(
            [...prev.details].filter((id) => !newUploadingIds.has(id as UUID)),
          ),
        }));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t.itemImageUpload.messages.uploadFailed[lang],
        );
        // Clear uploading states on error
        setUploadingStates((prev) => ({
          ...prev,
          details: new Set(
            [...prev.details].filter(
              (id) =>
                !files.map(() => crypto.randomUUID()).includes(id as UUID),
            ),
          ),
        }));
      }
    },
    [
      formImages?.details,
      validateFile,
      createPreviewUrl,
      uploadImage,
      updateForm,
      dispatch,
      lang,
    ],
  );

  // FILE SELECT HANDLER
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, type: "main" | "detail") => {
      const files = e.target.files;
      if (!files) return;
      if (type === "main") {
        if (files.length > 1) return toast.error("Only one main image allowed");
        void handleMainImageUpload(files[0]);
      } else {
        void handleDetailImagesUpload(files);
      }
      e.target.value = "";
    },
    [handleMainImageUpload, handleDetailImagesUpload],
  );

  // DRAG & DROP
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
      if (!files.length) return;
      if (type === "main") void handleMainImageUpload(files[0]);
      else void handleDetailImagesUpload(files);
    },
    [handleMainImageUpload, handleDetailImagesUpload],
  );

  const updateImageAltText = useCallback(
    (type: "main" | "detail", idx: number, text: string) => {
      if (type === "main" && formImages?.main) {
        updateForm("images.main", {
          ...formImages.main,
          metadata: { ...formImages.main.metadata, alt_text: text },
        });
      } else if (type === "detail" && formImages?.details) {
        const details = [...formImages.details];
        details[idx] = {
          ...details[idx],
          metadata: { ...details[idx].metadata, alt_text: text },
        };
        updateForm("images.details", details);
      }
    },
    [formImages, updateForm],
  );

  const removeMainImage = useCallback(() => {
    if (!formImages?.main) return;
    if (formImages.main.path) {
      void dispatch(
        removeFromBucket({
          bucket: "item-images-drafts",
          paths: [formImages.main.path],
        }),
      );
    }
    updateForm("images.main", null);
  }, [formImages?.main, dispatch, updateForm]);

  const removeDetailImage = useCallback(
    (idx: number) => {
      if (!formImages?.details) return;
      const img = formImages.details[idx];
      if (!img) return;

      if (img.path) {
        void dispatch(
          removeFromBucket({ bucket: "item-images-drafts", paths: [img.path] }),
        );
      }

      const newDetails = formImages.details.filter((_, i) => i !== idx);
      updateForm("images.details", newDetails);
    },
    [formImages?.details, dispatch, updateForm],
  );

  // CLEANUP previews
  useEffect(
    () => () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
    },
    [],
  );

  const isMainUploading = uploadingStates?.main;
  const isDetailUploading = uploadingStates.details.size > 0;

  return (
    <>
      <div className="mb-8">
        <div>
          <p className="scroll-m-20 text-base font-semibold tracking-tight w-full mb-1">
            {t.itemImageUpload.paragraphs.mainImage[lang]}
          </p>
          <p className="text-sm leading-none font-medium mb-4">
            {t.itemImageUpload.paragraphs.mainImageDescription[lang]}
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
            {formImages?.main?.url ? (
              <img
                src={formImages.main.url}
                className="w-30 h-30 rounded"
                alt="Main image preview"
              />
            ) : (
              <>
                {isMainUploading
                  ? t.itemImageUpload.buttons.uploading[lang]
                  : t.itemImageUpload.buttons.mainImageUpload[lang]}
                <p className="text-xs mt-1 text-muted-foreground">
                  {t.itemImageUpload.buttons.uploadSubtext[lang]}
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
          {formImages?.main?.url && (
            <div className="max-w-[400px]">
              <div className="flex gap-2 w-fit items-center mb-2">
                <Label className="mb-0">
                  {t.itemImageUpload.labels.altText[lang]}
                </Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p>{t.itemImageUpload.tooltips.altText[lang]}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Input
                placeholder={t.itemImageUpload.placeholders.describeImage[lang]}
                className="w-[280px] border shadow-none border-grey"
                value={formImages.main?.metadata.alt_text || ""}
                onChange={(e) => updateImageAltText("main", 0, e.target.value)}
                disabled={!formImages.main}
              />
            </div>
          )}
          {formImages?.main?.url && (
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
            {t.itemImageUpload.paragraphs.detailImage[lang]}
          </p>
          <p className="text-sm leading-none font-medium mb-4">
            {t.itemImageUpload.paragraphs.detailImageDescription[lang]}
          </p>
        </div>
        <div className="mb-6">
          <Button
            type="button"
            className={`flex flex-1 border-1 border-dashed w-full min-h-[200px] flex-col transition-colors ${
              dragStates.detail ? "border-primary bg-primary/5" : ""
            } ${isDetailUploading || formImages?.details?.length >= MAX_DETAIL_IMAGES ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={
              isDetailUploading ||
              formImages?.details?.length >= MAX_DETAIL_IMAGES
            }
            onClick={(e) => {
              e.preventDefault();
              if (
                !isDetailUploading &&
                formImages.details.length < MAX_DETAIL_IMAGES
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
              t.itemImageUpload.buttons.uploading[lang]
            ) : dragStates.detail ? (
              t.itemImageUpload.buttons.dropImages[lang]
            ) : formImages?.details?.length >= MAX_DETAIL_IMAGES ? (
              t.itemImageUpload.buttons.maxReached[lang]
            ) : (
              <>
                {t.itemImageUpload.buttons.detailImageUpload[lang]}
                <p className="text-xs mt-1 text-muted-foreground">
                  {t.itemImageUpload.buttons.uploadSubtext[lang]}
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
        {formImages?.details?.length > 0 && (
          <div className="flex flex-col gap-4">
            {formImages.details.map((image, idx) => (
              <div key={image.id} className="flex gap-4">
                <img
                  src={image.url || ""}
                  className="w-20 rounded"
                  alt={`Detail image ${idx + 1}`}
                />
                <div className="flex justify-between w-full">
                  <div>
                    <div className="flex gap-2 w-fit items-center mb-2">
                      <Label className="mb-0">
                        {t.itemImageUpload.labels.altText[lang]}
                      </Label>
                    </div>

                    <Input
                      type="text"
                      placeholder={
                        t.itemImageUpload.placeholders.describeImage[lang]
                      }
                      className="w-[250px] border shadow-none border-grey"
                      value={image.metadata.alt_text}
                      onChange={(e) =>
                        updateImageAltText("detail", idx, e.target.value)
                      }
                      disabled={uploadingStates.details.has(image.id)}
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
                    disabled={uploadingStates.details.has(image.id)}
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
