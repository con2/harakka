import { Button } from "./ui/button";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { cancelBooking } from "@/store/slices/bookingsSlice";
import { toastConfirm } from "./ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

interface BookingCancelButtonProps {
  id: string;
  closeModal?: () => void;
}

const BookingCancelButton = ({ id, closeModal }: BookingCancelButtonProps) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const handleCancelBooking = () => {
    if (!id) {
      toast.error(t.bookingCancel.errors.invalidId[lang]);
      return;
    }

    toastConfirm({
      title: t.bookingCancel.confirmDialog.title[lang],
      description: t.bookingCancel.confirmDialog.description[lang],
      confirmText: t.bookingCancel.confirmDialog.confirmText[lang],
      cancelText: t.bookingCancel.confirmDialog.cancelText[lang],
      onConfirm: () => {
        try {
          // Use unwrap() to properly handle the promise and catch errors
          toast.promise(dispatch(cancelBooking(id)).unwrap(), {
            loading: t.bookingCancel.toast.loading[lang],
            success: t.bookingCancel.toast.success[lang],
            error: t.bookingCancel.toast.error[lang],
          });

          // Close modal after successful cancellation if provided
          if (closeModal) closeModal();
        } catch (error) {
          console.error("Error cancelling booking:", error);
        }
      },
      onCancel: () => {},
    });
  };

  return (
    <Button
      onClick={handleCancelBooking}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
      size={"sm"}
      title={t.bookingCancel.cancel[lang]}
    >
      <XCircle size={10} />
    </Button>
  );
};

export default BookingCancelButton;
