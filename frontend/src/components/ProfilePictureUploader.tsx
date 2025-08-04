import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
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
//import profilePlaceholder from "@/assets/profile-placeholder.jpg";

const ProfilePictureUploader = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Define the expected user type
  type User = {
    id: string;
    profile_picture_url?: string;
    // add other properties as needed
  };

  const selectedUser: User = useAppSelector(selectSelectedUser);
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const currentImage = selectedUser?.profile_picture_url;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedUser) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await dispatch(
        uploadProfilePicture({
          id: selectedUser.id,
          formData: formData,
        }),
      ).unwrap();

      toast.success("Profilbild aktualisiert");
      setOpen(false);
    } catch {
      toast.error("Fehler beim Hochladen des Profilbilds");
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
            src={currentImage}
            alt="Profilbild"
            className="object-cover"
          />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm group-hover:scale-105 transition-transform">
          <Pencil className="w-4 h-4 text-gray-700" />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profilbild ändern</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border mx-auto"
              />
            )}

            <div className="flex justify-end gap-2">
              <Button onClick={handleUpload} disabled={!file}>
                Hochladen
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePictureUploader;
