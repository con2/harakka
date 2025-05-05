import { Button } from "./ui/button";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cancelOrder, getUserOrders } from "@/store/slices/ordersSlice";
import { selectSelectedUser } from "@/store/slices/usersSlice";

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

    toast.custom((t) => (
      <div className="bg-white dark:bg-primary text-primary dark:text-white border border-zinc-200 dark:border-primary rounded-xl p-4 w-[360px] shadow-lg flex flex-col gap-3">
        <div className="font-semibold text-lg">Confirm Cancellation</div>
        <div className="text-sm">
          Are you sure you want to cancel this order?
        </div>
        <div className="flex justify-between gap-2">
          <Button className="addBtn" size="md" onClick={() => toast.dismiss(t)}>
            Keep Order
          </Button>
          <Button
            className="bg-red-500 text-white hover:bg-red-700 border-1 border-red-500 rounded-2xl"
            onClick={async () => {
              toast.dismiss(t);
              await toast.promise(dispatch(cancelOrder(id)).unwrap(), {
                loading: "Cancelling order...",
                success: "Order cancelled successfully",
                error: "Failed to cancel order",
              });

              if (closeModal) closeModal();

              // After successful cancel refresh the list of orders
              if (user?.id) {
                dispatch(getUserOrders(user.id));
              }
            }}
          >
            Cancel Order
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <Button onClick={handleCancelOrder} className="deleteBtn" size={"sm"}>
      <XCircle size={10} className="mr-1" /> Cancel
    </Button>
  );
};

export default OrderCancelButton;
