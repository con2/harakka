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
import { createTag } from "@/store/slices/tagSlice";
import { toast } from "sonner";
import { Label } from "../../ui/label";
import { CreateTagDto, Tag } from "@/types/tag";
import { createTagPayload } from "@/types/forms";
// Import translation utilities
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

interface AddTagModalProps {
  children: React.ReactNode;
  onCreated?: (tag: Tag) => void;
}

const AddTagModal = ({ children, onCreated }: AddTagModalProps) => {
  const dispatch = useAppDispatch();
  // Translation
  const { lang } = useLanguage();

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
      toast.error(t.addTagModal.messages.validationError[lang]);
      return;
    }

    setSubmitting(true);
    try {
      // Use the helper function to create a properly typed payload
      const tagData = createTagPayload(fiName, enName);

      // Create the Supabase payload directly from the prepared form data
      const createTagDto: CreateTagDto = {
        translations: tagData.translations,
      };
      const result = await dispatch(createTag(createTagDto)).unwrap();

      toast.success(t.addTagModal.messages.success[lang]);
      onCreated?.(result);
      resetForm();
      setOpen(false);
    } catch {
      toast.error(t.addTagModal.messages.error[lang]);
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
            {t.addTagModal.title[lang]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fiName">{t.addTagModal.labels.fiName[lang]}</Label>
            <Input
              id="fiName"
              value={fiName}
              onChange={(e) =>
                setFiName(
                  e.target.value.charAt(0).toUpperCase() +
                    e.target.value.slice(1),
                )
              }
              placeholder={t.addTagModal.placeholders.fiName[lang]}
            />
          </div>

          <div>
            <Label htmlFor="enName">{t.addTagModal.labels.enName[lang]}</Label>
            <Input
              id="enName"
              value={enName}
              onChange={(e) =>
                setEnName(
                  e.target.value.charAt(0).toUpperCase() +
                    e.target.value.slice(1),
                )
              }
              placeholder={t.addTagModal.placeholders.enName[lang]}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            disabled={submitting}
          >
            {t.addTagModal.buttons.cancel[lang]}{" "}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? t.addTagModal.buttons.creating[lang]
              : t.addTagModal.buttons.create[lang]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTagModal;
