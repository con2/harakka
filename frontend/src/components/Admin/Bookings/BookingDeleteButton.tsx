import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteBooking } from "@/store/slices/bookingsSlice";
import { Trash2 } from "lucide-react";
import { toastConfirm } from "../../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const BookingDeleteButton = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const handleDelete = () => {
    if (!id) {
      toast.error(t.bookingDelete.errors.invalidId[lang]);
      return;
    }

    toastConfirm({
      title: t.bookingDelete.confirmDialog.title[lang],
      description: t.bookingDelete.confirmDialog.description[lang],
      confirmText: t.bookingDelete.confirmDialog.confirmText[lang],
      cancelText: t.bookingDelete.confirmDialog.cancelText[lang],
      onConfirm: () => {
        toast.promise(dispatch(deleteBooking(id)).unwrap(), {
          loading: t.bookingDelete.toast.loading[lang],
          success: t.bookingDelete.toast.success[lang],
          error: t.bookingDelete.toast.error[lang],
        });
        closeModal();
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleDelete()}
      title={t.bookingList.buttons.delete[lang]}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default BookingDeleteButton;
