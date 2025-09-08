import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { returnItems } from "@/store/slices/bookingsSlice";
import { RotateCcw } from "lucide-react";
import { toastConfirm } from "../../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const BookingReturnButton = ({
  id,
  disabled = false,
  itemIds,
  onSuccess,
}: {
  id: string;
  disabled?: boolean;
  itemIds?: string[];
  onSuccess?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

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
        toast.promise(
          dispatch(
            returnItems({
              bookingId: id,
              itemIds: itemIds,
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
      onClick={handleReturnItems}
      title={t.bookingList.buttons.return[lang]}
      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
    >
      <RotateCcw className="h-4 w-4" />
    </Button>
  );
};

export default BookingReturnButton;
