import { BookingPreview } from "@/types";
import { Button } from "./ui/button";
import { Edit } from "lucide-react";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

const BookingEditButton = ({
  booking,
  onEdit,
}: {
  booking: BookingPreview;
  onEdit: (booking: BookingPreview) => void;
}) => {
  const { lang } = useLanguage();

  return (
    <Button
      onClick={() => onEdit(booking)}
      size={"sm"}
      title={t.bookingEditButton.title[lang]}
      className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
    >
      <Edit className="h-4 w-4" />
    </Button>
  );
};

export default BookingEditButton;
