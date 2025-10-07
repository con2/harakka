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
import { ImagePlus, Info, Trash } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormSetValue,
} from "react-hook-form";
import { toast } from "sonner";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useImageValidator } from "@/utils/imageUtils";
import { FILE_CONSTRAINTS } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const MAX_DETAIL_IMAGES = 5;

type ItemImageUploadProps = {
  item_id: string;
  updateForm: UseFormSetValue<CreateItemType>;
  formImages: CreateItemType["images"];
  errors?: Merge<FieldError, FieldErrorsImpl<CreateItemType["images"]>>;
};

function ItemImageUpload({
  item_id,
  updateForm,
  formImages,
  errors,
}: ItemImageUploadProps) {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const { validateFile } = useImageValidator();
  const uploadedUrls = useAppSelector(selectUploadUrls);

  // Simplified state - only track uploading status and drag states
  const [uploadingStates, setUploadingStates] = useState({
    main: false,
    details: new Set<string>(), // Track uploading detail images by ID
  });

  const [dragStates, setDragStates] = useState({ main: false, detail: false });
  const previewUrls = useRef<Set<string>>(new Set());

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

        // Set loading state for main image
        setUploadingStates((prev) => ({ ...prev, main: true }));
        dispatch(setUploadImageType("main"));

        const promise = dispatch(
          uploadToBucket({
            files: [file],
            bucket: "item-images",
            path: `${item_id}/main`,
          }),
        ).unwrap();

        // Await upload
        await toast
          .promise(promise, {
            loading: t.itemImageUpload.messages.uploadingMain.loading[lang],
            success: t.itemImageUpload.messages.uploadingMain.success[lang],
            error: t.itemImageUpload.messages.uploadingMain.error[lang],
          })
          .unwrap();

        // If upload is successful, update the form
        const { urls, full_paths, paths } = uploadedUrls;
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
            object_fit: formImages.main?.metadata.object_fit || "cover",
          },
        });
      } catch (_error) {
        updateForm("images.main", null); // Clear the image on error
        setUploadingStates((prev) => ({ ...prev, main: false }));
      } finally {
        // Set loading to false
        setUploadingStates((prev) => ({ ...prev, main: false }));
      }
    },
    [
      validateFile,
      updateForm,
      dispatch,
      lang,
      item_id,
      formImages.main?.metadata.object_fit,
      uploadedUrls,
    ],
  );
  const handleDetailImagesUpload = useCallback(
    async (filesList: FileList) => {
      const files = Array.from(filesList);
      const currentDetails = formImages?.details || [];
      const currentCount = currentDetails.length;

      if (currentCount + files.length > MAX_DETAIL_IMAGES) {
        toast.error(
          t.itemImageUpload.messages.tooManyFiles[lang].replace(
            "{max_files}",
            MAX_DETAIL_IMAGES.toString(),
          ),
        );
        return;
      }

      // Validate files
      const allValid = files.every((file) =>
        validateFile(
          file,
          FILE_CONSTRAINTS.MAX_FILE_SIZE,
          FILE_CONSTRAINTS.ALLOWED_FILE_TYPES,
        ),
      );
      if (!allValid) return;

      try {
        dispatch(setUploadImageType("detail"));

        // Set
        setUploadingStates((prev) => ({
          ...prev,
          details: new Set([
            ...prev.details,
            ...files.map(() => crypto.randomUUID()),
          ]),
        }));

        // Create IDs for each file before upload
        const imageData = files.map((_file, idx) => ({
          id: crypto.randomUUID(),
          metadata: {
            image_type: "detail" as const,
            display_order: currentCount + idx,
            alt_text: "",
            is_active: true,
            object_fit: "cover" as const,
          },
        }));

        const uploadPromises = imageData.map((img, idx) =>
          dispatch(
            uploadToBucket({
              files: [files[idx]],
              bucket: "item-images",
              path: `${item_id}/${img.id}`,
            }),
          ).unwrap(),
        );

        // Await upload
        const uploadResults = await toast
          .promise(Promise.all(uploadPromises), {
            loading: t.itemImageUpload.messages.uploadingDetails.loading[lang],
            success: t.itemImageUpload.messages.uploadingDetails.success[lang],
            error: t.itemImageUpload.messages.uploadingDetails.error[lang],
          })
          .unwrap();

        // Update imageData with urls and paths
        const newDetailImages = imageData.map((img, idx) => ({
          ...img,
          url: uploadResults[idx].urls[0],
          full_path: uploadResults[idx].full_paths[0],
          path: uploadResults[idx].paths[0],
        }));

        // Update the form
        updateForm("images.details", [...currentDetails, ...newDetailImages]);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t.itemImageUpload.messages.uploadFailed[lang],
        );
        setUploadingStates((prev) => ({ ...prev, details: new Set() }));
      } finally {
        // Set loading to false
        setUploadingStates((prev) => ({
          ...prev,
          details: new Set(),
        }));
      }
    },
    [formImages?.details, validateFile, updateForm, dispatch, lang, item_id],
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
    <div className="flex flex-col">
      <div className="mb-8">
        <div>
          <p className="scroll-m-20 text-base font-semibold tracking-tight w-full mb-1">
            {t.itemImageUpload.paragraphs.mainImage[lang]}
          </p>
          <p className="text-sm leading-[1.4] font-medium mb-4">
            {t.itemImageUpload.paragraphs.mainImageDescription[lang]}
          </p>
        </div>
        <div className="mb-3">
          <Button
            type="button"
            className={cn(
              `flex flex-1 border-1 border-dashed w-full min-h-[200px] flex-col transition-colors ${
                dragStates.main ? "border-primary bg-primary/5" : ""
              } ${isMainUploading ? "opacity-50 cursor-not-allowed" : ""}`,
              errors?.main && "border-(--descrtuctive)",
            )}
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
                <ImagePlus className="!w-10 !h-10 text-muted-foreground mb-1" />
                {isMainUploading
                  ? t.itemImageUpload.buttons.uploading[lang]
                  : t.itemImageUpload.buttons.mainImageUpload[lang]}
                <p className="text-xs text-muted-foreground">
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
        <div className="flex justify-between items-center">
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
              <div className="flex gap-2 mt-4">
                <Checkbox
                  checked={formImages.main?.metadata.object_fit === "cover"}
                  onCheckedChange={() => {
                    const newValue =
                      formImages.main?.metadata.object_fit === "cover"
                        ? "contain"
                        : "cover";
                    updateForm("images.main.metadata.object_fit", newValue);
                  }}
                />
                <Label>{t.itemImageUpload.labels.imageCover[lang]}</Label>
              </div>
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
            className={cn(
              `flex flex-1 border-1 border-dashed w-full min-h-[200px] flex-col transition-colors ${
                dragStates.detail ? "border-primary bg-primary/5" : ""
              } ${isDetailUploading || formImages?.details?.length >= MAX_DETAIL_IMAGES ? "opacity-50 cursor-not-allowed" : ""}`,
              errors?.details && "border-(--descrtuctive)",
            )}
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
                <ImagePlus className="!w-10 !h-10 text-muted-foreground mb-1" />
                {t.itemImageUpload.buttons.detailImageUpload[lang]}
                <p className="text-xs text-muted-foreground">
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
    </div>
  );
}

export default ItemImageUpload;
