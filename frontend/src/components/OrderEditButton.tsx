import { BookingOrder } from "@/types";
import { Button } from "./ui/button";
import { Edit } from "lucide-react";

const OrderEditButton = ({ order, onEdit }: { order: BookingOrder; onEdit: (order: BookingOrder) => void }) => (
  <Button
    onClick={() => onEdit(order)}
    size={"sm"}
    title="Edit Order"
    className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
  >
    <Edit className="h-4 w-4" />
  </Button>
);

export default OrderEditButton;