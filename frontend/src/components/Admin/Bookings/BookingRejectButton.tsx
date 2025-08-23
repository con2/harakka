import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { XCircle } from "lucide-react";
import { rejectItemsForOrg } from "@/store/slices/bookingsSlice";
import { toastConfirm } from "../../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const BookingRejectButton = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const handleRejectBooking = () => {
    if (!id) {
      toast.error(t.bookingReject.errors.invalidId[lang]);
      return;
    }

    toastConfirm({
      title: t.bookingReject.confirmDialog.title[lang],
      description: t.bookingReject.confirmDialog.description[lang],
      confirmText: t.bookingReject.confirmDialog.confirmText[lang],
      cancelText: t.bookingReject.confirmDialog.cancelText[lang],
      onConfirm: () => {
        toast.promise(dispatch(rejectItemsForOrg({ bookingId: id })).unwrap(), {
          loading: t.bookingReject.toast.loading[lang],
          success: t.bookingReject.toast.success[lang],
          error: t.bookingReject.toast.error[lang],
        });
        closeModal();
      },
    });
  };

  return (
    <Button
      size="sm"
      onClick={() => handleRejectBooking()}
      title={t.bookingList.buttons.reject[lang]}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
    >
      <XCircle className="h-4 w-4" />
    </Button>
  );
};

export default BookingRejectButton;
