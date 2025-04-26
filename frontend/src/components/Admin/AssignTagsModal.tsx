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
  fetchAllTags,
  assignTagToItem,
  selectAllTags,
  fetchTagsForItem,
  selectLoading,
  selectSelectedTags,
} from "@/store/slices/tagSlice";
import { Tag } from "@/types/tag";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { updateItemTags } from "@/store/slices/itemsSlice";

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
  const loading = useAppSelector(selectLoading);
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      dispatch(fetchAllTags());
      dispatch(fetchTagsForItem(itemId));
    }
  }, [open, dispatch, itemId]);

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
      await dispatch(
        assignTagToItem({ itemId, tagIds: localSelectedTags }),
      ).unwrap();

      const updatedTags = tags.filter((tag) =>
        localSelectedTags.includes(tag.id),
      );
      dispatch(updateItemTags({ itemId, tags: updatedTags }));

      toast.success("Tags assigned successfully!");
      onClose();
    } catch {
      toast.error("Failed to assign tags");
    }
  };

  // const handleSubmit = async () => {
  //   try {
  //     await dispatch(assignTagToItem({ itemId, tagIds: selectedTags })).unwrap();

  //     // Immediately update the item’s tags in Redux
  //     const updatedTags = tags.filter(tag => selectSelectedTags.includes(tag.id));
  //     dispatch(updateItemTags({ itemId, tags: updatedTags }));

  //     toast.success('Tags assigned successfully!');
  //     onClose();
  //   } catch (err) {
  //     toast.error('Failed to assign tags');
  //   }
  // };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Tags</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p>Loading tags...</p>
        ) : (
          <div className="flex flex-col space-y-2">
            {tags.map((tag: Tag) => (
              <label key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={localSelectedTags.includes(tag.id)} // Check if the tag is in the selected list
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
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Assign</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTagsModal;
