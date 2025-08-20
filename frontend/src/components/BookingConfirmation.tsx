import React from "react";
import { useAppSelector } from "../store/hooks";
import {
  selectCurrentBooking,
  selectBookingLoading,
} from "../store/slices/bookingsSlice";
import { selectSelectedUser } from "../store/slices/usersSlice";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, LoaderCircle, Calendar, Package } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { BookingWithDetails } from "@/types";
import { BookingItemWithDetails } from "@/types/booking";

interface BookingItemDisplayProps {
  item: BookingItemWithDetails;
}

const BookingItemDisplay: React.FC<BookingItemDisplayProps> = ({ item }) => {
  const { lang } = useLanguage();

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
      <div className="flex items-center gap-3">
        <Package className="h-4 w-4 text-gray-500" />
        <div>
          <p className="font-medium text-sm">
            {item.storage_items?.translations?.[lang]?.item_name || "Item"}
          </p>
          <p className="text-xs text-gray-500">
            Quantity: {item.quantity} | {item.total_days} days
          </p>
        </div>
      </div>
    </div>
  );
};

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const booking = useAppSelector(
    selectCurrentBooking,
  ) as BookingWithDetails | null;
  const isLoading = useAppSelector(selectBookingLoading);
  const userProfile = useAppSelector(selectSelectedUser);

  // Add language support
  const { lang } = useLanguage();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      lang === "fi" ? "fi-FI" : "en-US",
    );
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">
          {t.bookingConfirmation.title[lang]}
        </h2>
        <p className="mb-6 text-center text-gray-600">
          {t.bookingConfirmation.message[lang]}
        </p>

        {isLoading ? (
          <div className="bg-slate-50 p-4 rounded-md flex justify-center items-center mb-6 h-12">
            <LoaderCircle className="animate-spin h-5 w-5 mr-2" />
            <span className="text-sm text-gray-600">
              {t.bookingConfirmation.loading[lang]}
            </span>
          </div>
        ) : booking ? (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-slate-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {t.bookingConfirmation.bookingNumber[lang]}
                  </p>
                  <p className="font-semibold text-lg">
                    {booking.booking_number}
                  </p>
                </div>
                {userProfile && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Booked by</p>
                    <p className="font-semibold">
                      {userProfile.full_name ||
                        userProfile.visible_name ||
                        "User"}
                    </p>
                    {userProfile.email && (
                      <p className="text-sm text-gray-500">
                        {userProfile.email}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="font-semibold capitalize">{booking.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">
                      {booking.created_at
                        ? formatDate(booking.created_at)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Items */}
            {booking.booking_items && booking.booking_items.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Booked Items ({booking.booking_items.length})
                </h3>
                <div className="space-y-2">
                  {booking.booking_items.map(
                    (item: BookingItemWithDetails, index: number) => (
                      <BookingItemDisplay key={index} item={item} />
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Notes section if available */}
            {booking.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                  {booking.notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-md text-left mb-6 text-amber-600">
            <p>{t.bookingConfirmation.notAvailable[lang]}</p>
          </div>
        )}

        <div className="flex gap-4 justify-center mt-8">
          <Button
            onClick={() => navigate("/profile?tab=bookings")}
            className="flex-1 bg-background text-secondary border-secondary border hover:bg-secondary hover:text-white"
          >
            {t.bookingConfirmation.buttons.viewBookings[lang]}
          </Button>
          <Button
            onClick={() => navigate("/storage")}
            className="flex-1 bg-background text-primary border-primary border hover:bg-primary hover:text-white"
          >
            {t.bookingConfirmation.buttons.continueBrowsing[lang]}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
