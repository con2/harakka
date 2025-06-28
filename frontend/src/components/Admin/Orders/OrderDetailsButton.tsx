import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { BookingOrder } from "@/types";

interface OrderDetailsButtonProps {
  order: BookingOrder;
  onViewDetails: (order: BookingOrder) => void;
}

const OrderDetailsButton = ({
  order,
  onViewDetails,
}: OrderDetailsButtonProps) => {
  return (
    <Button
      variant="ghost"
      onClick={() => onViewDetails(order)}
      className="hover:text-slate-900 hover:bg-slate-300"
      size="sm"
      title="View Details"
    >
      <Eye size={10} className="mr-1" />
    </Button>
  );
};

export default OrderDetailsButton;
