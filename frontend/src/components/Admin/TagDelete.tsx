import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteTag, fetchAllTags } from "@/store/slices/tagSlice";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
      <Card className="w-[360px] shadow-lg border">
        <CardHeader>
          <CardTitle className="text-lg">Confirm Deletion</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
          This will permanently delete the tag and remove it from all associated
          items. Are you sure?
        </p>
        <div className="flex justify-end gap-2">
          <Button
              variant="outline"
              onClick={() => toast.dismiss(t)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                toast.dismiss(t); // close the confirm toast
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
        </CardContent>
      </Card>
    ));
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
