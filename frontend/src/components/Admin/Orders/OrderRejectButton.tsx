import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { XCircle } from "lucide-react";
import { rejectOrder } from "@/store/slices/ordersSlice";
import { toastConfirm } from "../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const OrderRejectButton = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const handleRejectOrder = () => {
    if (!id) {
      toast.error("Invalid order ID.");
      return;
    }

    toastConfirm({
      title: "Confirm Rejection",
      description: "Are you sure you want to reject this order?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: async () => {
        await toast.promise(dispatch(rejectOrder(id)).unwrap(), {
          loading: "Rejecting order...",
          success: "Order has been successfully rejected.",
          error: "Failed to reject the order.",
        });
        closeModal();
      },
    });
  };

  return (
    <Button
      size="sm"
      onClick={() => handleRejectOrder()}
      title={t.orderList.buttons.reject[lang]}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
    >
      <XCircle className="h-4 w-4" />
    </Button>
  );
};

export default OrderRejectButton;
