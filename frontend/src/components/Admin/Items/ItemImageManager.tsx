import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getItemImages,
  deleteItemImage,
  selectItemImagesById,
  selectItemImagesLoading,
  uploadItemImageModal,
} from "@/store/slices/itemImagesSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { FILE_CONSTRAINTS, ImageType, ItemImage } from "@/types/storage";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useImageValidator } from "@/utils/imageUtils";

interface ItemImageManagerProps {
  itemId: string;
  setAvailabilityInfo?: (info: {
    availableQuantity: number;
    isChecking: boolean;
    error: string | null;
  }) => void;
}

const ItemImageManager = ({ itemId }: ItemImageManagerProps) => {
  const dispatch = useAppDispatch();
  const images = useAppSelector((state) => selectItemImagesById(state, itemId));
  const loading = useAppSelector(selectItemImagesLoading);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageType, setImageType] = useState<ImageType>("main");
  const [sortedImages, setSortedImages] = useState<ItemImage[]>([]);
  // Translation
  const { lang } = useLanguage();
  const { validateFile } = useImageValidator();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sort images by type and display order
  useEffect(() => {
    const sorted = [...images].sort((a: ItemImage, b: ItemImage) => {
      if (a.image_type !== b.image_type) {
        // Order by type: main, detail
        const typeOrder: Record<ImageType, number> = {
          main: 0,
          detail: 1,
        };
        return typeOrder[a.image_type] - typeOrder[b.image_type];
      }
      // If same type, order by display_order
      return a.display_order - b.display_order;
    });

    setSortedImages(sorted);
  }, [images]);

  useEffect(() => {
    if (itemId) {
      try {
        dispatch(getItemImages(itemId))
          .unwrap()
          .catch((error) => {
            console.error("Error fetching images:", error);
            toast.error(t.itemImageManager.messages.toast.loadError[lang]);
          });
      } catch (err) {
        console.error("Error dispatching action:", err);
      }
    }
  }, [dispatch, itemId, lang]);

  // Create preview when file is selected
  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  }, [selectedFile]);

  // Simulate upload progress
  useEffect(() => {
    if (loading && uploadProgress < 90) {
      // Quicker initial progress for small files, slower approach to 90%
      const increment = uploadProgress < 30 ? 15 : uploadProgress < 60 ? 8 : 3;
      const timer = setTimeout(() => {
        setUploadProgress((prev) => Math.min(prev + increment, 90));
      }, 300);
      return () => clearTimeout(timer);
    }
    if (!loading) {
      setUploadProgress(100);
      const timer = setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, uploadProgress]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (
        !validateFile(
          file,
          FILE_CONSTRAINTS.MAX_FILE_SIZE,
          FILE_CONSTRAINTS.ALLOWED_FILE_TYPES,
        )
      ) {
        return; // Early return if validation fails
      }

      setSelectedFile(file);

      // Auto-generate alt text from filename
      const nameWithoutExt = file.name.split(".").slice(0, -1).join(".");
      const formattedName = nameWithoutExt
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      setAltText(formattedName);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      if (
        !validateFile(
          file,
          FILE_CONSTRAINTS.MAX_FILE_SIZE,
          FILE_CONSTRAINTS.ALLOWED_FILE_TYPES,
        )
      ) {
        return; // Early return if validation fails
      }

      setSelectedFile(file);

      // Auto-generate alt text from filename
      const nameWithoutExt = file.name.split(".").slice(0, -1).join(".");
      const formattedName = nameWithoutExt
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      setAltText(formattedName);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAltText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error(t.itemImageManager.messages.validation.noFile[lang]);
      return;
    }

    // Find the highest display order for the current type
    const highestOrder = images
      .filter((img) => img.image_type === imageType)
      .reduce((max, img) => Math.max(max, img.display_order), 0);

    const metadata = {
      image_type: imageType,
      display_order: highestOrder + 1,
      alt_text: altText,
      is_active: true,
    };

    setUploadProgress(10); // Start progress

    try {
      toast.promise(
        dispatch(
          uploadItemImageModal({ itemId, file: selectedFile, metadata }),
        ).unwrap(),
        {
          loading: t.itemImageManager.messages.toast.upload.loading[lang],
          success: t.itemImageManager.messages.toast.upload.success[lang],
          error: t.itemImageManager.messages.toast.upload.error[lang],
        },
      );

      // Reset form after successful upload
      resetUploadForm();
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  const handleDeleteClick = (imageId: string) => {
    setImageToDelete(imageId);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (!imageToDelete) return;

    try {
      toast.promise(dispatch(deleteItemImage(imageToDelete)).unwrap(), {
        loading: t.itemImageManager.messages.toast.delete.loading[lang],
        success: t.itemImageManager.messages.toast.delete.success[lang],
        error: t.itemImageManager.messages.toast.delete.error[lang],
      });
    } catch (err) {
      console.error("Image deletion failed:", err);
    } finally {
      setImageToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white p-4 rounded-md border">
        <h3 className="text-lg font-medium mb-4">
          {t.itemImageManager.title.uploadNew[lang]}
        </h3>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-md p-6 mb-4 text-center transition-colors ${
            isDragging
              ? "border-secondary bg-secondary/5"
              : "border-gray-300 hover:border-secondary"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="mx-auto max-h-40 object-contain mb-2"
              />
              <button
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  resetUploadForm();
                }}
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-sm text-gray-500">{selectedFile?.name}</p>
            </div>
          ) : (
            <div>
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                {t.itemImageManager.dropzone.instructions[lang]}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t.itemImageManager.dropzone.fileInfo[lang]}
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="imageType">
                {t.itemImageManager.labels.imageType[lang]}
              </Label>
              <Select
                value={imageType}
                onValueChange={(val: "main" | "detail") =>
                  setImageType(val)
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t.itemImageManager.options.select[lang]}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">
                    {t.itemImageManager.options.main[lang]}
                  </SelectItem>
                  <SelectItem value="detail">
                    {t.itemImageManager.options.detail[lang]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="altText">
                {t.itemImageManager.labels.altText[lang]}
              </Label>
              <Input
                id="altText"
                placeholder={t.itemImageManager.placeholders.altText[lang]}
                className="placeholder:text-xs"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2" />
              <div className="text-xs text-right text-gray-500">
                {uploadProgress === 100
                  ? t.itemImageManager.messages.uploadComplete[lang]
                  : `${uploadProgress}%`}
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            className="addBtn"
            size={"sm"}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {t.itemImageManager.buttons.uploading[lang]}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />{" "}
                {t.itemImageManager.buttons.upload[lang]}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Images Gallery Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">
          {t.itemImageManager.title.gallery[lang].replace(
            "{count}",
            sortedImages.length.toString(),
          )}
        </h3>

        {loading && images.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">
              {t.itemImageManager.messages.noImages[lang]}
            </p>
          </div>
        )}

        {/* Grouped by image type */}
        {["main", "detail"].map((type) => {
          const typeImages = sortedImages.filter(
            (img) => img.image_type === type,
          );
          if (typeImages.length === 0) return null;

          return (
            <div key={type} className="mb-6">
              <h4 className="text-md font-medium capitalize mb-2">
                {t.itemImageManager.title.sections[type as ImageType][
                  lang
                ].replace("{count}", typeImages.length.toString())}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeImages.map((image) => (
                  <Card
                    key={image.id}
                    className="overflow-hidden border-secondary/20 hover:border-secondary transition-colors"
                  >
                    <CardHeader className="p-2">
                      <CardTitle className="text-sm flex justify-between items-center">
                        <span className="capitalize">
                          {t.itemImageManager.options[image.image_type][lang]}
                        </span>
                        <span className="text-xs text-gray-500">
                          #{image.display_order}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || "Item image"}
                        className="w-full h-40 object-cover rounded-md"
                        loading="lazy"
                      />
                    </CardContent>
                    <CardFooter className="p-2 bg-slate-50 flex justify-between items-center">
                      <div
                        className="text-xs truncate max-w-[70%]"
                        title={image.alt_text}
                      >
                        {image.alt_text ||
                          t.itemImageManager.messages.noDescription[lang]}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.itemImageManager.messages.deleteConfirm.title[lang]}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.itemImageManager.messages.deleteConfirm.description[lang]}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t.itemImageManager.buttons.cancel[lang]}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {t.itemImageManager.buttons.deleteImage[lang]}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItemImageManager;
