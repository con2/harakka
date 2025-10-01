import { Button } from "@/components/ui/button";
import { BoxIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { pickUpItems, selectBookingError } from "@/store/slices/bookingsSlice";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { toast } from "sonner";
import { ReactNode } from "react";

type BookingPickUpProps = {
  id: string;
  location_id: string;
  org_id?: string;
  selectedItemIds?: string[];
  disabled?: boolean;
  disabledReason?: string;
  onSuccess?: () => void;
  children?: ReactNode;
  className?: string;
};

const BookingPickupButton = ({
  id,
  location_id,
  org_id,
  selectedItemIds,
  onSuccess,
  disabled = false,
  disabledReason,
  children,
  className,
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
          pickUpItems({
            bookingId: id,
            location_id,
            org_id,
            itemIds: selectedItemIds,
          }),
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
  const base_classes = "text-green-600 hover:text-green-800 hover:bg-green-100";
  const defaultTitle = t.bookingList.buttons.pickedUp[lang];
  const title = disabled && disabledReason ? disabledReason : defaultTitle;

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      title={title}
      aria-disabled={disabled}
      className={className ? [className, base_classes].join(" ") : base_classes}
      onClick={handlePickup}
    >
      <BoxIcon className="h-4 w-4" />
      {children}
    </Button>
  );
};

export default BookingPickupButton;
