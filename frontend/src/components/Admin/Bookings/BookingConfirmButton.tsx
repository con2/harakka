import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { confirmBooking } from "@/store/slices/bookingsSlice";
import { CheckCircle } from "lucide-react";
import { toastConfirm } from "../../ui/toastConfirm";

const BookingConfirmButton = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();

  const handleConfirmBooking = () => {
    if (!id) {
      toast.error("Invalid booking ID.");
      return;
    }

    toastConfirm({
      title: "Confirm Booking",
      description: "Are you sure you want to confirm this booking?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: async () => {
        await toast.promise(dispatch(confirmBooking(id)).unwrap(), {
          loading: "Confirming booking...",
          success: "Booking has been successfully confirmed.",
          error: "Failed to confirm the booking.",
        });
        closeModal();
      },
    });
  };
  return (
    <Button
      size="sm"
      onClick={() => handleConfirmBooking()}
      title="Confirm Booking"
      className="text-green-600 hover:text-green-800 hover:bg-green-100"
    >
      <CheckCircle className="h-4 w-4" />
    </Button>
  );
};

export default BookingConfirmButton;
