import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteTag } from "@/store/slices/tagSlice";
import { Trash2 } from "lucide-react";
import { toastConfirm } from "../../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

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
  // Translation
  const { lang } = useLanguage();

  const handleDelete = () => {
    if (!id) {
      toast.error(t.tagDelete.messages.invalidId[lang]);
      return;
    }

    toastConfirm({
      title: t.tagDelete.confirmation.title[lang],
      description: t.tagDelete.confirmation.description[lang],
      confirmText: t.tagDelete.confirmation.confirmText[lang],
      cancelText: t.tagDelete.confirmation.cancelText[lang],
      onConfirm: async () => {
        try {
          await toast.promise(dispatch(deleteTag(id)).unwrap(), {
            loading: t.tagDelete.toast.loading[lang],
            success: t.tagDelete.toast.success[lang],
            error: t.tagDelete.toast.error[lang],
          });
          onDeleted?.();
          closeModal?.();
        } catch {
          toast.error(t.tagDelete.messages.generalError[lang]);
        }
      },
    });
  };

  return (
    <Button
      onClick={handleDelete}
      size={"sm"}
      title={t.tagDelete.button.title[lang]}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default TagDelete;
