import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  assignTagToItem,
  selectAllTags,
  selectTagsLoading,
  selectSelectedTags,
} from "@/store/slices/tagSlice";
import { Tag } from "@/types/tag";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { updateItemTags } from "@/store/slices/itemsSlice";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

/**
 * Props for AssignTagsModal component
 */
interface AssignTagsModalProps {
  itemId: string;
  onClose: () => void;
  open: boolean;
}

const AssignTagsModal: React.FC<AssignTagsModalProps> = ({
  itemId,
  open,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const tags = useAppSelector(selectAllTags);
  const selectedTags = useAppSelector(selectSelectedTags);
  const loading = useAppSelector(selectTagsLoading);
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>([]);
  // Translation
  const { lang } = useLanguage();

  useEffect(() => {
    if (selectedTags) {
      setLocalSelectedTags(selectedTags.map((tag) => tag.id));
    }
  }, [selectedTags]);

  const handleCheckboxChange = (tagId: string) => {
    setLocalSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };
  const handleSubmit = async () => {
    try {
      // Only send the tag IDs, nothing else
      await dispatch(
        assignTagToItem({
          itemId,
          tagIds: localSelectedTags,
        }),
      ).unwrap();

      const updatedTags = tags.filter((tag) =>
        localSelectedTags.includes(tag.id),
      );
      dispatch(updateItemTags({ itemId, tags: updatedTags }));

      toast.success(t.assignTagsModal.messages.success[lang]);
      onClose();
    } catch (error) {
      toast.error(t.assignTagsModal.messages.error[lang]);
      console.error("Tag assignment error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.assignTagsModal.title[lang]}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p>{t.assignTagsModal.loading[lang]}</p>
        ) : (
          <div className="flex flex-col space-y-2">
            {tags.map((tag: Tag) => (
              <label key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={localSelectedTags.includes(tag.id)}
                  onCheckedChange={() => handleCheckboxChange(tag.id)}
                />
                <span>
                  {tag.translations?.fi?.name ||
                    tag.translations?.en?.name ||
                    "Unnamed"}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            {t.assignTagsModal.buttons.cancel[lang]}
          </Button>
          <Button onClick={handleSubmit}>
            {t.assignTagsModal.buttons.assign[lang]}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTagsModal;
