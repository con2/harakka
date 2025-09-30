import Spinner from "@/components/Spinner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getBookingByID,
  selectCurrentBooking,
  selectCurrentBookingLoading,
} from "@/store/slices/bookingsSlice";
import { BookingStatus, BookingWithDetails } from "@/types";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { formatDate } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBookingStatus } from "@/utils/format";

function RequestDetailsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const booking = useAppSelector(
    selectCurrentBooking,
  ) as BookingWithDetails | null;
  const loading = useAppSelector(selectCurrentBookingLoading);

  useEffect(() => {
    if (id) {
      void dispatch(getBookingByID(id));
    }
  }, [id, dispatch]);

  if (loading) return <Spinner />;

  if (!booking) return null;

  const { booking_number, booking_items } = booking;
  return (
    <div className="space-y-4">
      <div>
        <Button
          onClick={() => navigate(-1)}
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
        >
          <ChevronLeft /> {t.common.back[lang]}
        </Button>
      </div>

      <div className="flex flex-col">
        <h1 className="text-xl mb-2">
          {t.requestDetailsPage.title[lang].replace(
            "{booking_number}",
            booking_number,
          )}
        </h1>
        <div className="mb-4  border-1 border-(muted-foreground) rounded bg-white">
          <div className="space-y-2 grid grid-cols-2 gap-4 p-5 pb-2">
            <div className="flex flex-col text-md">
              <p>{booking.full_name || t.bookingList.status.unknown[lang]}</p>
              <div className="flex items-center gap-2">
                <p className="mb-0">{booking.email}</p>
              </div>
              {/* {booking.booked_by_org &&
                  organizationNames[booking.booked_by_org] && (
                    <p className="text-sm text-blue-600 font-medium mt-2">
                      {t.bookingDetailsPage.modal.onBehalfOf[lang]}{" "}
                      {organizationNames[booking.booked_by_org]}
                    </p>
                  )} */}
              <p>
                {`${t.bookingDetailsPage.modal.date[lang]} ${formatDate(new Date(booking.created_at || ""), "d MMM yyyy")}`}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="font-normal mb-0 flex gap-2">
                {t.bookingDetailsPage.status[lang]}{" "}
                <StatusBadge
                  status={
                    formatBookingStatus(
                      booking.org_status_for_active_org as BookingStatus,
                    ) ?? "unknown"
                  }
                />
              </p>
              <p>
                {`${t.bookingDetailsPage.info[lang]} ${booking.booking_items?.length ?? 0}`}
              </p>
              <div className="flex flex-row  gap-2">
                {t.bookingDetailsPage.dateRange[lang]}{" "}
                <p>
                  {booking.booking_items && booking.booking_items.length > 0
                    ? `${formatDate(
                        new Date(booking.booking_items[0].start_date || ""),
                        "d MMM yyyy",
                      )} - ${formatDate(
                        new Date(booking.booking_items[0].end_date || ""),
                        "d MMM yyyy",
                      )}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestDetailsPage;
