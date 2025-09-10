import { Button } from "@/components/ui/button";
import { BoxIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { pickUpItems, selectBookingError } from "@/store/slices/bookingsSlice";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { toast } from "sonner";

type BookingPickUpProps = {
  id: string;
  selectedItemIds?: string[];
  disabled?: boolean;
  onSuccess?: () => void;
};

const BookingPickupButton = ({
  id,
  selectedItemIds,
  onSuccess,
  disabled = false,
}: BookingPickUpProps) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const error = useAppSelector(selectBookingError);

  const handlePickup = () => {
    toastConfirm({
      title: t.bookingPickup.confirmDialog.title[lang],
      description: t.bookingPickup.confirmDialog.description[lang],
      confirmText: t.bookingPickup.confirmDialog.confirmText[lang],
      cancelText: t.bookingPickup.confirmDialog.cancelText[lang],
      onConfirm: () => {
        const promise = dispatch(
          pickUpItems({ bookingId: id, itemIds: selectedItemIds }),
        ).unwrap();

        toast.promise(promise, {
          loading: t.bookingPickup.toast.loading[lang],
          success: t.bookingPickup.toast.success[lang],
          error: error ?? t.bookingPickup.toast.error[lang],
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
      className="text-green-600 hover:text-green-800 hover:bg-green-100"
      onClick={handlePickup}
    >
      <BoxIcon className="h-4 w-4" />
    </Button>
  );
};

export default BookingPickupButton;
