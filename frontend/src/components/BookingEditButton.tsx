import { Booking } from "@/types";
import { Button } from "./ui/button";
import { Edit } from "lucide-react";

const BookingEditButton = ({
  booking,
  onEdit,
}: {
  booking: Booking;
  onEdit: (booking: Booking) => void;
}) => (
  <Button
    onClick={() => onEdit(booking)}
    size={"sm"}
    title="Edit Booking"
    className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
  >
    <Edit className="h-4 w-4" />
  </Button>
);

export default BookingEditButton;
