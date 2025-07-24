import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteBooking } from "@/store/slices/bookingsSlice";
import { Trash2 } from "lucide-react";
import { toastConfirm } from "../../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const BookingDeleteButton = ({
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
      toast.error("Invalid booking ID.");
      return;
    }

    toastConfirm({
      title: "Confirm Deletion",
      description: "Are you sure you want to delete this booking?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: () => {
        toast.promise(dispatch(deleteBooking(id)).unwrap(), {
          loading: "Deleting booking...",
          success: "Booking has been successfully deleted.",
          error: "Failed to delete booking.",
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
      title={t.bookingList.buttons.delete[lang]}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default BookingDeleteButton;
