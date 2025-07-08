import { Button } from "./ui/button";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { cancelBooking } from "@/store/slices/bookingsSlice";
import { toastConfirm } from "./ui/toastConfirm";

interface BookingCancelButtonProps {
  id: string;
  closeModal?: () => void;
}

const BookingCancelButton = ({ id, closeModal }: BookingCancelButtonProps) => {
  const dispatch = useAppDispatch();

  const handleCancelBooking = () => {
    if (!id) {
      toast.error("Invalid booking ID.");
      return;
    }

    toastConfirm({
      title: "Confirm Cancellation",
      description: "Are you sure you want to cancel this booking?",
      confirmText: "Cancel Booking",
      cancelText: "Keep Booking",
      onConfirm: async () => {
        try {
          // Use unwrap() to properly handle the promise and catch errors
          await toast.promise(dispatch(cancelBooking(id)).unwrap(), {
            loading: "Cancelling booking...",
            success: "Booking cancelled successfully",
            error: "Failed to cancel booking",
          });

          // Close modal after successful cancellation if provided
          if (closeModal) closeModal();
        } catch (error) {
          console.error("Error cancelling booking:", error);
        }
      },
      onCancel: () => {},
    });
  };

  return (
    <Button
      onClick={handleCancelBooking}
      className="text-red-600 hover:text-red-800 hover:bg-red-100"
      size={"sm"}
      title="Cancel Booking"
    >
      <XCircle size={10} className="mr-1" />
    </Button>
  );
};

export default BookingCancelButton;
