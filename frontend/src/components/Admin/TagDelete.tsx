import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteTag, fetchAllTags } from "@/store/slices/tagSlice";

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

    toast.custom((t) => (
      <div className="bg-white dark:bg-primary text-primary dark:text-white border border-zinc-200 dark:border-primary rounded-xl p-4 w-[360px] shadow-lg flex flex-col gap-3">
        <div className="font-semibold text-lg">Confirm Deletion</div>
        <div className="text-sm text-muted-foreground">
          This will permanently delete the tag and remove it from all associated
          items. Are you sure?
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.dismiss(t)}
            className="bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-md"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-md"
            onClick={async () => {
              toast.dismiss(t);
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
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <Button
      onClick={handleDelete}
      className="bg-background rounded-2xl px-6 text-destructive border-destructive border hover:text-background"
      variant="destructive"
    >
      Delete
    </Button>
  );
};

export default TagDelete;
