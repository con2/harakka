import { Button } from "./ui/button";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cancelOrder, getUserOrders } from "@/store/slices/ordersSlice";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import { toastConfirm } from "./ui/toastConfirm";

interface OrderCancelButtonProps {
  id: string;
  closeModal?: () => void;
}

const OrderCancelButton = ({ id, closeModal }: OrderCancelButtonProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectSelectedUser);

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
        await toast.promise(dispatch(cancelOrder(id)).unwrap(), {
          loading: "Cancelling order...",
          success: "Order cancelled successfully",
          error: "Failed to cancel order",
        });
    
        if (closeModal) closeModal();
    
        if (user?.id) {
          dispatch(getUserOrders(user.id));
        }
      },
      onCancel: () => {
      },
    });
  };

  return (
    <Button
      onClick={handleCancelOrder}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
      size={"sm"}>
      <XCircle size={10} className="mr-1" />
    </Button>
  );
};

export default OrderCancelButton;
