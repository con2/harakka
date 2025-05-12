import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { deleteItem } from "@/store/slices/itemsSlice";
import { toast } from "sonner";

const DeleteItemModal = ({
  itemId,
  itemName,
  children,
}: {
  itemId: string;
  itemName: string;
  children: React.ReactNode;
}) => {
  const dispatch = useAppDispatch();
  const [confirmText, setConfirmText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteItem(itemId)).unwrap();
      toast.success(`Item "${itemName}" deleted successfully.`);
      setIsOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Item</DialogTitle>
          <DialogDescription>
            This will permanently delete{" "}
            <span className="font-semibold">"{itemName}"</span>. To confirm,
            type <span className="font-mono text-sm">delete</span> below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Label htmlFor="delete-confirm">Type "delete" to confirm</Label>
          <Input
            id="delete-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete"
            className="placeholder:text-xs italic p-2"
          />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== "delete" || loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteItemModal;
