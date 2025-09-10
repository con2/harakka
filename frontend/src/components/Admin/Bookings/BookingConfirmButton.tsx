import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  confirmItemsForOrg,
  selectBookingError,
} from "@/store/slices/bookingsSlice";
import { CheckCircle } from "lucide-react";
import { toastConfirm } from "../../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const BookingConfirmButton = ({
  id,
  selectedItemIds,
  disabled,
  onSuccess,
}: {
  id: string;
  selectedItemIds?: string[];
  disabled?: boolean;
  onSuccess?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const error = useAppSelector(selectBookingError);

  const handleConfirmBooking = async () => {
    await Promise.resolve();
    if (!id || disabled) {
      toast.error(t.bookingConfirm.errors.invalidId[lang]);
      return;
    }

    toastConfirm({
      title: t.bookingConfirm.confirmDialog.title[lang],
      description: t.bookingConfirm.confirmDialog.description[lang],
      confirmText: t.bookingConfirm.confirmDialog.confirmText[lang],
      cancelText: t.bookingConfirm.confirmDialog.cancelText[lang],
      onConfirm: () => {
        const promise = dispatch(
          confirmItemsForOrg({ bookingId: id, itemIds: selectedItemIds }),
        ).unwrap();

        toast.promise(promise, {
          loading: t.bookingConfirm.toast.loading[lang],
          success: t.bookingConfirm.toast.success[lang],
          error: error ?? t.bookingConfirm.toast.error[lang],
        });

        void promise.then(() => {
          if (onSuccess) onSuccess();
        });
      },
    });
  };
  return (
    <Button
      size="sm"
      onClick={handleConfirmBooking}
      title={t.bookingConfirm.button.title[lang]}
      className={`text-green-600 hover:text-green-800 hover:bg-green-100${disabled ? " opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled}
    >
      <CheckCircle className="h-4 w-4" />
    </Button>
  );
};

export default BookingConfirmButton;
