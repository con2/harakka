import { Button } from "./ui/button";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { cancelOrder } from "@/store/slices/ordersSlice";
import { toastConfirm } from "./ui/toastConfirm";

interface OrderCancelButtonProps {
  id: string;
  closeModal?: () => void;
}

const OrderCancelButton = ({ id, closeModal }: OrderCancelButtonProps) => {
  const dispatch = useAppDispatch();

  const handleCancelOrder = () => {
    if (!id) {
      toast.error("Invalid order ID.");
      return;
    }

    toastConfirm({
      title: "Confirm Cancellation",
      description: "Are you sure you want to cancel this order?",
      confirmText: "Cancel Order",
      cancelText: "Keep Order",
      onConfirm: async () => {
        try {
          // Use unwrap() to properly handle the promise and catch errors
          await toast.promise(dispatch(cancelOrder(id)).unwrap(), {
            loading: "Cancelling order...",
            success: "Order cancelled successfully",
            error: "Failed to cancel order",
          });

          // Close modal after successful cancellation if provided
          if (closeModal) closeModal();
        } catch (error) {
          console.error("Error cancelling order:", error);
        }
      },
      onCancel: () => {},
    });
  };

  return (
    <Button
      onClick={handleCancelOrder}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
      size={"sm"}
      title="Cancel Order"
    >
      <XCircle size={10} className="mr-1" />
    </Button>
  );
};

export default OrderCancelButton;
