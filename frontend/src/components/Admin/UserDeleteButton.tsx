import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteUser } from "@/store/slices/usersSlice";
import { Trash2 } from "lucide-react";
import { toastConfirm } from "../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const DeleteUserButton = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();
  // Translation
  const { lang } = useLanguage();

  const handleDelete = () => {
    if (!id) {
      toast.error(t.userDelete.messages.invalidId[lang]);
      return;
    }

    toastConfirm({
      title: t.userDelete.confirmation.title[lang],
      description: t.userDelete.confirmation.description[lang],
      confirmText: t.userDelete.confirmation.confirmText[lang],
      cancelText: t.userDelete.confirmation.cancelText[lang],
      onConfirm: async () => {
        await toast.promise(dispatch(deleteUser(id)).unwrap(), {
          loading: t.userDelete.toast.loading[lang],
          success: t.userDelete.toast.success[lang],
          error: t.userDelete.toast.error[lang],
        });
        closeModal();
      },
    });
  };

  return (
    <Button
      onClick={handleDelete}
      title={t.userDelete.button.title[lang]}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default DeleteUserButton;
