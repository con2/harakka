import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { returnItems, selectBookingError } from "@/store/slices/bookingsSlice";
import { RotateCcw } from "lucide-react";
import { toastConfirm } from "../../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { ReactNode } from "react";

const BookingReturnButton = ({
  id,
  disabled = false,
  itemIds,
  onSuccess,
  location_id,
  children,
}: {
  id: string;
  disabled?: boolean;
  itemIds?: string[];
  onSuccess?: () => void;
  location_id?: string;
  children?: ReactNode;
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const error = useAppSelector(selectBookingError);

  const handleReturnItems = () => {
    if (!id) {
      toast.error(t.bookingReturn.errors.invalidId[lang]);
      return;
    }

    toastConfirm({
      title: t.bookingReturn.confirmDialog.title[lang],
      description: t.bookingReturn.confirmDialog.description[lang],
      confirmText: t.bookingReturn.confirmDialog.confirmText[lang],
      cancelText: t.bookingReturn.confirmDialog.cancelText[lang],
      onConfirm: () => {
        const promise = dispatch(
          returnItems({ bookingId: id, itemIds, location_id }),
        ).unwrap();

        toast.promise(promise, {
          loading: t.bookingReturn.toast.loading[lang],
          success: t.bookingReturn.toast.success[lang],
          error: error ?? t.bookingReturn.toast.error[lang],
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
      onClick={handleReturnItems}
      title={t.bookingList.buttons.return[lang]}
      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      {children}
    </Button>
  );
};

export default BookingReturnButton;
