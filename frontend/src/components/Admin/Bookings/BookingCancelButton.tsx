import { Button } from "@/components/ui/button";
import { XCircleIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  cancelBookingItems,
  selectBookingError,
} from "@/store/slices/bookingsSlice";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { toast } from "sonner";

type BookingCancelProps = {
  id: string;
  itemIds?: string[];
  disabled?: boolean;
  onSuccess?: () => void;
};

const BookingCancelButton = ({
  id,
  itemIds,
  onSuccess,
  disabled = false,
}: BookingCancelProps) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const error = useAppSelector(selectBookingError);

  const handleCancel = () => {
    toastConfirm({
      title: t.bookingItemsCancel.confirmDialog.title[lang],
      description: t.bookingItemsCancel.confirmDialog.description[lang],
      confirmText: t.bookingItemsCancel.confirmDialog.confirmText[lang],
      cancelText: t.bookingItemsCancel.confirmDialog.cancelText[lang],
      onConfirm: () => {
        const promise = dispatch(
          cancelBookingItems({ bookingId: id, itemIds }),
        ).unwrap();

        toast.promise(promise, {
          loading: t.bookingItemsCancel.toast.loading[lang],
          success: t.bookingItemsCancel.toast.success[lang],
          error: error ?? t.bookingItemsCancel.toast.error[lang],
        });

        void promise.then(() => {
          if (onSuccess) onSuccess();
        });
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      title={t.bookingList.buttons.pickedUp[lang]}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
      onClick={handleCancel}
    >
      <XCircleIcon className="h-4 w-4" />
    </Button>
  );
};

export default BookingCancelButton;
