import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { BookingPreview } from "@/types";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

interface BookingDetailsButtonProps {
  booking: BookingPreview;
  onViewDetails: (booking: BookingPreview) => void;
}

const BookingDetailsButton = ({
  booking,
  onViewDetails,
}: BookingDetailsButtonProps) => {
  const { lang } = useLanguage();

  return (
    <Button
      variant="ghost"
      onClick={() => onViewDetails(booking)}
      className="hover:text-slate-900 hover:bg-slate-300"
      size="sm"
      title={t.bookingDetailsButton.title[lang]}
    >
      <Eye size={10} />
    </Button>
  );
};

export default BookingDetailsButton;
