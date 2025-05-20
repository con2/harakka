import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteOrder } from "@/store/slices/ordersSlice";
import { Trash2 } from "lucide-react";
import { toastConfirm } from "../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const OrderDeleteButton = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const handleDelete = () => {
    if (!id) {
      toast.error("Invalid order ID.");
      return;
    }

    toastConfirm({
      title: "Confirm Deletion",
      description: "Are you sure you want to delete this order?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: async () => {
        await toast.promise(dispatch(deleteOrder(id)).unwrap(), {
          loading: "Deleting order...",
          success: "Order has been successfully deleted.",
          error: "Failed to delete order.",
        });
        closeModal();
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleDelete()}
      title={t.orderList.buttons.delete[lang]}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default OrderDeleteButton;
