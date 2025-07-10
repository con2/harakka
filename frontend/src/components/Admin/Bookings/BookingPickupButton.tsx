import { Button } from "@/components/ui/button";
import { BoxIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const BookingPickupButton = () => {
  const { lang } = useLanguage();
  return (
    <Button
      variant="ghost"
      size="sm"
      title={t.bookingList.buttons.pickedUp[lang]}
      className="text-green-600 hover:text-green-800 hover:bg-green-100"
    >
      <BoxIcon className="h-4 w-4" />
    </Button>
  );
};

export default BookingPickupButton;
