import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteUser } from "@/store/slices/usersSlice";
import { Trash2 } from "lucide-react";
import { toastConfirm } from "../ui/toastConfirm";

const DeleteUserButton = ({ id, closeModal }: { id: string; closeModal: () => void }) => {
  const dispatch = useAppDispatch();

  const handleDelete = () => {
    if (!id) {
      toast.error("Invalid user ID.");
      return;
    }

    toastConfirm({
      title: "Confirm Deletion",
      description: "Are you sure you want to delete this user?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: async () => {
        await toast.promise(dispatch(deleteUser(id)).unwrap(), {
          loading: "Deleting user...",
          success: "User has been successfully removed.",
          error: "Failed to delete user.",
        });
        closeModal();
      },
    });
  };

  return (
    <Button
      onClick={handleDelete}
      title="Delete User"
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default DeleteUserButton;