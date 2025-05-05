import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { returnItems } from "@/store/slices/ordersSlice";
import { ArrowLeftSquare } from "lucide-react";

const OrderReturnButton = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();

  const handleReturnItems = () => {
    if (!id) {
      toast.error("Invalid order ID.");
      return;
    }

    toast.custom((t) => (
      <div className="bg-white dark:bg-primary text-primary dark:text-white border border-zinc-200 dark:border-primary rounded-xl p-4 w-[360px] shadow-lg flex flex-col gap-3">
        <div className="font-semibold text-lg">Confirm Return</div>
        <div className="text-sm">
          Are you sure you want to mark this order as returned?
        </div>
        <div className="flex justify-between gap-2">
          <Button
            className="bg-red-500 text-white hover:bg-red-700 border-1 border-red-500 rounded-2xl"
            size="md"
            onClick={() => toast.dismiss(t)}
          >
            Cancel
          </Button>
          <Button
            className="addBtn"
            onClick={async () => {
              toast.dismiss(t); // dismiss confirmation toast
              await toast.promise(dispatch(returnItems(id)).unwrap(), {
                loading: "Processing return...",
                success: "Order has been successfully marked as returned.",
                error: "Failed to process the return.",
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
    <Button onClick={handleReturnItems} className="editBtn" size={"sm"}>
      <ArrowLeftSquare size={10} className="mr-1" /> Return
    </Button>
  );
};

export default OrderReturnButton;
