import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  uploadProfilePicture,
  selectSelectedUser,
} from "@/store/slices/usersSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import profilePlaceholder from "../assets/profilePlaceholder.png";
import Cropper from "react-easy-crop";
import { getCroppedImg, useImageValidator } from "@/utils/imageUtils";
import { Area } from "react-easy-crop";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { FILE_CONSTRAINTS } from "@/types";

const ProfilePictureUploader = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Define the expected user type
  type User = {
    id: string;
    profile_picture_url?: string | null;
  };

  const selectedUser: User | null = useAppSelector(selectSelectedUser);
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<null | {
    width: number;
    height: number;
    x: number;
    y: number;
  }>(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  // translation hook
  const { lang } = useLanguage();
  const { validateFile } = useImageValidator();

  const currentImage = selectedUser?.profile_picture_url;

  // handle file selection
  const handleSelectedFile = (selected: File) => {
    if (
      !validateFile(
        selected,
        FILE_CONSTRAINTS.MAX_FILE_SIZE,
        FILE_CONSTRAINTS.ALLOWED_FILE_TYPES,
      )
    ) {
      return; // Early return if validation fails
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      handleSelectedFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleSelectedFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // saves the exact crop area when cropping is complete
  const handleCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // preview the cropped image
  useEffect(() => {
    const generatePreview = async () => {
      if (previewUrl && croppedAreaPixels) {
        const blob = await getCroppedImg(
          previewUrl,
          crop,
          zoom,
          1,
          croppedAreaPixels,
          rotation,
          lang,
        );
        const newPreviewUrl = URL.createObjectURL(blob);
        setLivePreviewUrl(newPreviewUrl);
      }
    };

    void generatePreview();
  }, [previewUrl, croppedAreaPixels, crop, zoom, rotation, lang]);

  const handleUpload = async () => {
    if (!file || !selectedUser || !croppedAreaPixels || !previewUrl) return;

    try {
      const croppedFile = await getCroppedImg(
        previewUrl,
        crop,
        zoom,
        1,
        croppedAreaPixels,
        rotation,
        lang,
      );

      await dispatch(uploadProfilePicture(croppedFile)).unwrap();
      // Use translations for success message
      toast.success(t.profilePicUploader.messages.success[lang]);
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t.profilePicUploader.messages.error[lang],
      );
    }
  };

  return (
    <>
      <div
        className="relative group cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Avatar className="w-24 h-24 border border-secondary">
          <AvatarImage
            src={currentImage ?? undefined}
            alt="Profile picture"
            className="object-cover"
          />
          <AvatarFallback>
            {<img src={profilePlaceholder} alt="Profile placeholder" />}
          </AvatarFallback>
        </Avatar>

        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm group-hover:scale-105 transition-transform">
          <Pencil className="w-4 h-4 text-gray-700" />
        </div>
      </div>

      {/* open the modal containing also the cropper*/}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {t.profilePicUploader.changeProfilePicture[lang]}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 flex flex-col gap-6">
            {/* File Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t.profilePicUploader.chooseImage[lang]}
              </label>
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 transition"
                >
                  {t.profilePicUploader.uploadFile[lang]}
                </button>
                <span className="ml-4 text-sm text-muted-foreground">
                  {file?.name ?? t.profilePicUploader.noFileSelected[lang]}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
            </div>

            {/* Cropper */}
            {previewUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t.profilePicUploader.cropImage[lang]}
                </label>
                <div className="relative w-full h-64 bg-gray-200 rounded overflow-hidden">
                  <Cropper
                    image={previewUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                    rotation={rotation}
                    cropShape="round"
                    showGrid={false}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    {t.profilePicUploader.zoom[lang]}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Live Preview */}
            {livePreviewUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t.profilePicUploader.preview[lang]}
                </label>
                <img
                  src={livePreviewUrl}
                  className="w-24 h-24 rounded-full border"
                />
              </div>
            )}

            {/* Rotate Button */}
            {previewUrl && (
              <div>
                <Button
                  variant="ghost"
                  className="border border-gray-300 hover:bg-gray-100"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                >
                  {t.profilePicUploader.rotate[lang]}
                </Button>
              </div>
            )}

            {/* Drop-Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition 
    ${isDragging ? "border-secondary bg-secondary/10" : "border-gray-300"}`}
            >
              <p className="text-sm text-gray-500">
                {t.profilePicUploader.dragAndDrop[lang] ??
                  "Drag & Drop your image here or click to select"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button onClick={() => setOpen(false)}>
                {t.profilePicUploader.cancel[lang]}
              </Button>
              <Button variant="outline" onClick={handleUpload} disabled={!file}>
                {t.profilePicUploader.upload[lang]}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePictureUploader;
