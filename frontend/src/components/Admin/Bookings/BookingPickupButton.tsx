import { Button } from "@/components/ui/button";
import { BoxIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useAppDispatch } from "@/store/hooks";
import { pickUpItems } from "@/store/slices/bookingsSlice";
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

  const handlePickup = async () => {
    await dispatch(pickUpItems({ bookingId: id, itemIds: selectedItemIds }));
    if (onSuccess) onSuccess();

    toastConfirm({
      title: t.bookingReturn.confirmDialog.title[lang],
      description: t.bookingReturn.confirmDialog.description[lang],
      confirmText: t.bookingReturn.confirmDialog.confirmText[lang],
      cancelText: t.bookingReturn.confirmDialog.cancelText[lang],
      onConfirm: () => {
        toast.promise(
          dispatch(
            pickUpItems({
              bookingId: id,
              itemIds: selectedItemIds,
            }),
          ).unwrap(),
          {
            loading: t.bookingReturn.toast.loading[lang],
            success: t.bookingReturn.toast.success[lang],
            error: t.bookingReturn.toast.error[lang],
          },
        );
        if (onSuccess) onSuccess();
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
