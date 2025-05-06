import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { XCircle } from "lucide-react";
import { rejectOrder } from "@/store/slices/ordersSlice";

const OrderRejectButton = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();

  const handleRejectOrder = () => {
    if (!id) {
      toast.error("Invalid order ID.");
      return;
    }

    toast.custom((t) => (
      <div className="bg-white dark:bg-primary text-primary dark:text-white border border-zinc-200 dark:border-primary rounded-xl p-4 w-[360px] shadow-lg flex flex-col gap-3">
        <div className="font-semibold text-lg">Confirm Rejection</div>
        <div className="text-sm">
          Are you sure you want to reject this order?
        </div>
        <div className="flex justify-between gap-2">
          <Button className="addBtn" size="md" onClick={() => toast.dismiss(t)}>
            Cancel
          </Button>
          <Button
            className="bg-red-500 text-white hover:bg-red-700 border-1 border-red-500 rounded-2xl"
            onClick={async () => {
              toast.dismiss(t); // dismiss confirmation toast
              await toast.promise(dispatch(rejectOrder(id)).unwrap(), {
                loading: "Rejecting order...",
                success: "Order has been successfully rejected.",
                error: "Failed to reject the order.",
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
    <Button onClick={handleRejectOrder} className="deleteBtn" size={"sm"}>
      <XCircle size={10} className="mr-1" /> Reject
    </Button>
  );
};

export default OrderRejectButton;
