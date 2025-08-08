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
import { getCroppedImg } from "@/utils/cropImage";
import { Area } from "react-easy-crop";

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

  const currentImage = selectedUser?.profile_picture_url;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
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
        );
        const newPreviewUrl = URL.createObjectURL(blob);
        setLivePreviewUrl(newPreviewUrl);
      }
    };

    void generatePreview();
  }, [previewUrl, croppedAreaPixels, crop, zoom]);

  const handleUpload = async () => {
    if (!file || !selectedUser || !croppedAreaPixels || !previewUrl) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const croppedBlob = await getCroppedImg(
        previewUrl,
        crop,
        zoom,
        1,
        croppedAreaPixels,
        rotation,
      );

      const croppedFile = new File([croppedBlob], file.name, {
        type: "image/jpeg",
      });

      await dispatch(uploadProfilePicture(croppedFile)).unwrap();

      toast.success("Profile picture updated");
      setOpen(false);
    } catch {
      toast.error("Error uploading the profile picture");
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
              Change Profile Picture
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 flex flex-col gap-6">
            {/* File Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Choose Image</label>
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 transition"
                >
                  Upload File
                </button>
                <span className="ml-4 text-sm text-muted-foreground">
                  {file?.name ?? "No file selected"}
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
                <label className="text-sm font-medium">Crop Image</label>
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
                  <label className="text-sm font-medium">Zoom</label>
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
                <label className="text-sm font-medium">Preview</label>
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
                  Rotate 90°
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="outline" onClick={handleUpload} disabled={!file}>
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePictureUploader;
