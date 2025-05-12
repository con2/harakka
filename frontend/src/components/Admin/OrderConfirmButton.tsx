import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { confirmOrder } from "@/store/slices/ordersSlice";
import { CheckCircle } from "lucide-react";
//import { toastConfirm } from "../ui/toastConfirm";

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

    toast.custom((t) => (
      <div className="bg-white dark:bg-primary text-primary dark:text-white border border-zinc-200 dark:border-primary rounded-xl p-4 w-[360px] shadow-lg flex flex-col gap-3">
        <div className="font-semibold text-lg">Confirm Order</div>
        <div className="text-sm">
          Are you sure you want to confirm this order?
        </div>
        <div className="flex justify-between gap-2">
          <Button className="addBtn" size="md" onClick={() => toast.dismiss(t)}>
            Cancel
          </Button>
          <Button
            className="bg-red-500 text-white hover:bg-red-700 border-1 border-red-500 rounded-2xl"
            onClick={async () => {
              toast.dismiss(t); // dismiss confirmation toast
              await toast.promise(dispatch(confirmOrder(id)).unwrap(), {
                loading: "Confirming order...",
                success: "Order has been successfully confirmed.",
                error: "Failed to confirm the order.",
              });
              closeModal();
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    ));
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
