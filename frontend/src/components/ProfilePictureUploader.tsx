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
import { getCroppedImg } from "@/store/utils/cropImage";
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />

            {previewUrl && (
              <div className="relative w-full h-64 bg-gray-200">
                <Cropper
                  image={previewUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                  rotation={rotation}
                />
              </div>
            )}

            {/* zoom regulator */}
            {previewUrl && (
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            )}

            {livePreviewUrl && (
              <img src={livePreviewUrl} className="w-24 h-24 rounded-full" />
            )}

            <Button onClick={() => setRotation((prev) => (prev + 90) % 360)}>
              Rotate 90°
            </Button>

            <div className="flex justify-end gap-2">
              <Button onClick={handleUpload} disabled={!file}>
                Upload
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePictureUploader;
