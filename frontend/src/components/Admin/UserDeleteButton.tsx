import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteUser } from "@/store/slices/usersSlice";
import { Trash2 } from "lucide-react";

const DeleteUserButton = ({ id, closeModal }: { id: string; closeModal: () => void }) => {
  const dispatch = useAppDispatch();

  const handleDelete = () => {
    if (!id) {
      toast.error("Invalid user ID.");
      return;
    }

    toast.custom((t) => (
      <div className="bg-white dark:bg-primary text-primary dark:text-white border border-zinc-200 dark:border-primary rounded-xl p-4 w-[360px] shadow-lg flex flex-col gap-3">
        <div className="font-semibold text-lg">Confirm Deletion</div>
        <div className="text-sm">
          Are you sure you want to delete this user?
        </div>
        <div className="flex justify-between gap-2">
          <Button
            className="addBtn"
            size="md"
            onClick={() => toast.dismiss(t)}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-500 text-white hover:bg-red-700 border-1 border-red-500 rounded-2xl"
            onClick={async () => {
              toast.dismiss(t); // dismiss confirmation toast
              await toast.promise(dispatch(deleteUser(id)).unwrap(), {
                loading: "Deleting user...",
                success: "User has been successfully removed.",
                error: "Failed to delete user.",
              });
              closeModal();
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
      className="deleteBtn" size={"sm"}
    >
      <Trash2 size={10} className="mr-1"/> Delete
    </Button>
  );
};

export default DeleteUserButton;
