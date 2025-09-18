import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentBooking,
  getBookingByID,
  getBookingItems,
  cancelBooking,
} from "@/store/slices/bookingsSlice";
import { Button } from "@/components/ui/button";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import Spinner from "@/components/Spinner";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const MyBookingsPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const booking = useAppSelector(selectCurrentBooking);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      void dispatch(getBookingByID(id))
        .unwrap()
        .catch(() => {})
        .finally(() => setLoading(false));
      void dispatch(getBookingItems(id));
    }
  }, [id, dispatch]);

  if (loading) return <Spinner containerClasses="py-8" />;

  if (!booking)
    return <div className="p-8">{t.myBookings.error.loadingError[lang]}</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-md">
      <Button onClick={() => navigate(-1)} variant="secondary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t.myBookingsPage.buttons.back[lang]}
      </Button>
      <h2 className="text-lg font-semibold">
        {t.myBookings.bookingDetails.title[lang]} {booking.booking_number}
      </h2>
      <div className="mt-4 space-y-2">
        <p>
          <strong>{t.myBookings.columns.status[lang]}</strong> {booking.status}
        </p>
        <p>
          <strong>{t.myBookings.columns.date[lang]}</strong>{" "}
          {booking.created_at}
        </p>
      </div>

      <div className="mt-6 flex space-x-2">
        <Button
          onClick={async () => {
            try {
              if (booking.id) {
                await dispatch(cancelBooking(booking.id)).unwrap();
                toast.success(t.myBookings.edit.toast.emptyCancelled[lang]);
                void navigate("/my-bookings");
              }
            } catch {
              toast.error(t.myBookings.edit.toast.cancelFailed[lang]);
            }
          }}
        >
          {t.myBookings.edit.buttons.cancel[lang]}
        </Button>
      </div>
    </div>
  );
};

export default MyBookingsPage;
