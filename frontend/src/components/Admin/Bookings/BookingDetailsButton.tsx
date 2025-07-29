import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { BookingPreview } from "@/types";

interface BookingDetailsButtonProps {
  booking: BookingPreview;
  onViewDetails: (booking: BookingPreview) => void;
}

const BookingDetailsButton = ({
  booking,
  onViewDetails,
}: BookingDetailsButtonProps) => {
  return (
    <Button
      variant="ghost"
      onClick={() => onViewDetails(booking)}
      className="hover:text-slate-900 hover:bg-slate-300"
      size="sm"
      title="View Details"
    >
      <Eye size={10} className="mr-1" />
    </Button>
  );
};

export default BookingDetailsButton;
