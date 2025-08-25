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

  const handleRejectBooking = async () => {
    await Promise.resolve();
    if (!id || disabled) {
      toast.error(t.bookingReject.errors.invalidId[lang]);
      return;
    }

    toastConfirm({
      title: t.bookingReject.confirmDialog.title[lang],
      description: t.bookingReject.confirmDialog.description[lang],
      confirmText: t.bookingReject.confirmDialog.confirmText[lang],
      cancelText: t.bookingReject.confirmDialog.cancelText[lang],
      onConfirm: async () => {
        const promise = new Promise((resolve, reject) => {
          dispatch(
            rejectItemsForOrg({
              bookingId: id,
              itemIds:
                selectedItemIds && selectedItemIds.length > 0
                  ? selectedItemIds
                  : undefined,
            }),
          )
            .then(resolve)
            .catch(reject);
        });
        await toast.promise(promise, {
          loading: t.bookingReject.toast.loading[lang],
          success: t.bookingReject.toast.success[lang],
          error: t.bookingReject.toast.error[lang],
        });
        if (onSuccess) onSuccess();
      },
    });
  };

  return (
    <Button
      size="sm"
      onClick={handleRejectBooking}
      title={t.bookingList.buttons.reject[lang]}
      className={`text-red-600 hover:text-red-800 hover:bg-red-100${disabled ? " opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled}
    >
      <XCircle className="h-4 w-4" />
    </Button>
  );
};

export default BookingRejectButton;
