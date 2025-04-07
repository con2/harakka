import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteUser } from "@/store/slices/usersSlice";

const DeleteUserButton = ({ id, closeModal }: { id: string; closeModal: () => void }) => {
  const dispatch = useAppDispatch();

  const handleDelete = () => {
    if (!id) {
      console.error("Invalid user ID:", id);
      toast.error("Invalid user ID.");
      return;
    }
    toast(
      "Confirm Deletion",
      {
        description: "Are you sure you want to delete this user?",
        action: {
          label: "Confirm",
          onClick: async () => {
            await toast.promise(
              dispatch(deleteUser(id)).unwrap(),
              {
                loading: "Deleting user...",
                success: "User has been successfully removed.",
                error: "Failed to delete user.",
              }
            );
            closeModal();
          },
        },
        className: "delete-toast",
        closeButton: true,
      }
    );
  };

  return (
    <Button onClick={handleDelete} className="bg-background rounded-2xl px-6 text-destructive border-destructive border-1 hover:text-background" variant="destructive">
      Delete
    </Button>
  );
};

export default DeleteUserButton;
