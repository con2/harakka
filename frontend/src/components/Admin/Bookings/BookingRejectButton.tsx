import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { XCircle } from "lucide-react";
import { rejectBooking } from "@/store/slices/bookingsSlice";
import { toastConfirm } from "../../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const BookingRejectButton = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const handleRejectBooking = () => {
    if (!id) {
      toast.error("Invalid booking ID.");
      return;
    }

    toastConfirm({
      title: "Confirm Rejection",
      description: "Are you sure you want to reject this booking?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: () => {
        toast.promise(dispatch(rejectBooking(id)).unwrap(), {
          loading: "Rejecting booking...",
          success: "Booking has been successfully rejected.",
          error: "Failed to reject the booking.",
        });
        closeModal();
      },
    });
  };

  return (
    <Button
      size="sm"
      onClick={() => handleRejectBooking()}
      title={t.bookingList.buttons.reject[lang]}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
    >
      <XCircle className="h-4 w-4" />
    </Button>
  );
};

export default BookingRejectButton;
