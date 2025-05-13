import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteTag, fetchAllTags } from "@/store/slices/tagSlice";
import { Trash2 } from "lucide-react";
import { toastConfirm } from "../ui/toastConfirm";

const TagDelete = ({
  id,
  closeModal,
  onDeleted,
}: {
  id: string;
  closeModal?: () => void;
  onDeleted?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const handleDelete = () => {
    if (!id) {
      toast.error("Invalid tag ID.");
      return;
    }

    toastConfirm({
      title: "Confirm Deletion",
      description:
        "This will permanently delete the tag and remove it from all associated items. Are you sure?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await toast.promise(dispatch(deleteTag(id)).unwrap(), {
            loading: "Deleting tag...",
            success: "Tag has been successfully deleted.",
            error: "Failed to delete tag.",
          });
          dispatch(fetchAllTags());
          onDeleted?.();
          closeModal?.();
        } catch {
          toast.error("Error deleting tag.");
        }
      },
    });    
  };

  return (
    <Button
      onClick={handleDelete}
      size={"sm"}
      title="Delete Tag"
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default TagDelete;
