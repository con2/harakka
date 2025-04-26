import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { createTag, fetchAllTags } from "@/store/slices/tagSlice";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Tag } from "@/types/tag";

interface AddTagModalProps {
  children: React.ReactNode;
  onCreated?: (tag: Tag) => void;
}

const AddTagModal = ({ children, onCreated }: AddTagModalProps) => {
  const dispatch = useAppDispatch();

  const [fiName, setFiName] = useState("");
  const [enName, setEnName] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFiName("");
    setEnName("");
  };

  const handleSubmit = async () => {
    if (!fiName && !enName) {
      toast.error("At least one translation is required.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await dispatch(
        createTag({
          translations: {
            fi: fiName ? { name: fiName } : undefined,
            en: enName ? { name: enName } : undefined,
          },
        }),
      ).unwrap();

      toast.success("Tag created successfully!");
      dispatch(fetchAllTags());
      onCreated?.(result);
      resetForm();
      setOpen(false);
    } catch {
      toast.error("Failed to create tag.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center mb-4">
            Create a New Tag
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fiName">Finnish Name</Label>
            <Input
              id="fiName"
              value={fiName}
              onChange={(e) => setFiName(e.target.value)}
              placeholder="e.g. Suosittu"
            />
          </div>

          <div>
            <Label htmlFor="enName">English Name</Label>
            <Input
              id="enName"
              value={enName}
              onChange={(e) => setEnName(e.target.value)}
              placeholder="e.g. Popular"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Tag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTagModal;
