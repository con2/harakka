import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { returnItems } from "@/store/slices/ordersSlice";
import { RotateCcw } from "lucide-react";
import { toastConfirm } from "../../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const OrderReturnButton = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const handleReturnItems = () => {
    if (!id) {
      toast.error("Invalid order ID.");
      return;
    }

    toastConfirm({
      title: "Confirm Return",
      description: "Are you sure you want to mark this order as returned?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: async () => {
        await toast.promise(dispatch(returnItems(id)).unwrap(), {
          loading: "Processing return...",
          success: "Order has been successfully marked as returned.",
          error: "Failed to process the return.",
        });
        closeModal();
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleReturnItems()}
      title={t.orderList.buttons.return[lang]}
      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
    >
      <RotateCcw className="h-4 w-4" />
    </Button>
  );
};

export default OrderReturnButton;
