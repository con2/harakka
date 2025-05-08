import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteUser } from "@/store/slices/usersSlice";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const DeleteUserButton = ({ id, closeModal }: { id: string; closeModal: () => void }) => {
  const dispatch = useAppDispatch();

  const handleDelete = () => {
    if (!id) {
      toast.error("Invalid user ID.");
      return;
    }

    toast.custom((t) => (
      <Card className="w-[360px] shadow-lg border">
        <CardHeader>
          <CardTitle className="text-lg">Confirm Deletion</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this user?
          </p>
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => toast.dismiss(t)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                toast.dismiss(t);
                try {
                  await toast.promise(dispatch(deleteUser(id)).unwrap(), {
                    loading: "Deleting user...",
                    success: "User has been successfully removed.",
                    error: "Failed to delete user.",
                  });
                  closeModal();
                } catch {
                  toast.error("Error deleting user.");
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
      className="deleteBtn" size={"sm"}
    >
      <Trash2 size={10} className="mr-1"/> Delete
    </Button>
  );
};

export default DeleteUserButton;
