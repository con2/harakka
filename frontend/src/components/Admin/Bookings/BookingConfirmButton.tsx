import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { confirmBookingForOrg } from "@/store/slices/bookingsSlice";
import { CheckCircle } from "lucide-react";
import { toastConfirm } from "../../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const BookingConfirmButton = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const handleConfirmBooking = () => {
    if (!id) {
      toast.error(t.bookingConfirm.errors.invalidId[lang]);
      return;
    }

    toastConfirm({
      title: t.bookingConfirm.confirmDialog.title[lang],
      description: t.bookingConfirm.confirmDialog.description[lang],
      confirmText: t.bookingConfirm.confirmDialog.confirmText[lang],
      cancelText: t.bookingConfirm.confirmDialog.cancelText[lang],
      onConfirm: () => {
        toast.promise(dispatch(confirmBookingForOrg(id)).unwrap(), {
          loading: t.bookingConfirm.toast.loading[lang],
          success: t.bookingConfirm.toast.success[lang],
          error: t.bookingConfirm.toast.error[lang],
        });
        closeModal();
      },
    });
  };
  return (
    <Button
      size="sm"
      onClick={() => handleConfirmBooking()}
      title={t.bookingConfirm.button.title[lang]}
      className="text-green-600 hover:text-green-800 hover:bg-green-100"
    >
      <CheckCircle className="h-4 w-4" />
    </Button>
  );
};

export default BookingConfirmButton;
