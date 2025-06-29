import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { confirmOrder } from "@/store/slices/ordersSlice";
import { CheckCircle } from "lucide-react";
import { toastConfirm } from "../../ui/toastConfirm";

const OrderConfirmButton = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();

  const handleConfirmOrder = () => {
    if (!id) {
      toast.error("Invalid order ID.");
      return;
    }

    toastConfirm({
      title: "Confirm Order",
      description: "Are you sure you want to confirm this order?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: async () => {
        await toast.promise(dispatch(confirmOrder(id)).unwrap(), {
          loading: "Confirming order...",
          success: "Order has been successfully confirmed.",
          error: "Failed to confirm the order.",
        });
        closeModal();
      },
    });
  };
  return (
    <Button
      size="sm"
      onClick={() => handleConfirmOrder()}
      title="Confirm Order"
      className="text-green-600 hover:text-green-800 hover:bg-green-100"
    >
      <CheckCircle className="h-4 w-4" />
    </Button>
  );
};

export default OrderConfirmButton;
