import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectCurrentBooking,
  selectBookingLoading,
} from "../store/slices/bookingsSlice";
import { selectSelectedUser } from "../store/slices/usersSlice";
import {
  getItemImages,
  makeSelectItemImages,
} from "../store/slices/itemImagesSlice";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, Calendar, Package } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { BookingWithDetails } from "@/types";
import { BookingItemWithDetails } from "@/types/booking";
import CalendarSend from "@/assets/calendar-send-icon.svg?react";
import { formatDate } from "date-fns";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";

interface BookingItemDisplayProps {
  item: BookingItemWithDetails;
}

const BookingItemDisplay: React.FC<BookingItemDisplayProps> = ({ item }) => {
  const { lang } = useLanguage();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (item.id) {
      void dispatch(getItemImages(item.id));
    }
  }, [dispatch, item.id]);

  const selectItemImages = useMemo(() => makeSelectItemImages(), []);
  const itemImages = useAppSelector((state) =>
    selectItemImages(state, item.item_id),
  );
  const firstImage = itemImages[0]?.image_url;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md ring-1 ring-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
          {firstImage ? (
            <img
              src={firstImage}
              alt={
                item.storage_items?.translations?.[lang]?.item_name || "Item"
              }
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-gray-600">
              {item.storage_items?.translations?.[lang]?.item_name
                ?.slice(0, 2)
                ?.toUpperCase() || "IT"}
            </span>
          )}
        </div>
        <div>
          <p className="font-medium text-sm">
            {item.storage_items?.translations?.[lang]?.item_name || "Item"}
          </p>
          <p className="text-xs text-gray-500">
            {t.bookingConfirmation.quantity[lang]}: {item.quantity} •{" "}
            {item.total_days} {t.bookingConfirmation.days[lang]}
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
  const { roleName: activeRole } = useAppSelector(selectActiveRoleContext);

  // Add language support
  const { lang } = useLanguage();
  const REQUESTER_ROLES = ["requester", "tenant_admin", "storage_manager"];
  const BOOKED_BY_ORG = REQUESTER_ROLES.includes(activeRole!);

  function groupBookingItemsByOrg(
    booking: BookingWithDetails | null,
  ): BookingItemWithDetails[][] {
    const items: BookingItemWithDetails[] = [...(booking?.booking_items ?? [])];

    const groups = items.reduce<Map<string, BookingItemWithDetails[]>>(
      (map, item) => {
        const key = (item?.org_name ?? "").toString();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(item);
        return map;
      },
      new Map(),
    );

    return [...groups.entries()]
      .sort(([aName], [bName]) => aName.localeCompare(bName, undefined))
      .map(([, itemsForOrg]) => itemsForOrg);
  }

  // Usage
  const groupedItems: BookingItemWithDetails[][] =
    groupBookingItemsByOrg(booking);

  // Function to get translated status
  const getTranslatedStatus = (status: string) => {
    const statusMap: { [key: string]: { fi: string; en: string } } = {
      pending: t.bookingConfirmation.statuses.pending,
      confirmed: t.bookingConfirmation.statuses.confirmed,
      cancelled: t.bookingConfirmation.statuses.cancelled,
      "cancelled by admin": t.bookingConfirmation.statuses.cancelledByAdmin,
      rejected: t.bookingConfirmation.statuses.rejected,
      completed: t.bookingConfirmation.statuses.completed,
      deleted: t.bookingConfirmation.statuses.deleted,
    };

    return statusMap[status]?.[lang] || status;
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card className="overflow-hidden">
        <CardHeader className="text-center space-y-2 mb-6">
          <div className="flex items-center gap-4 justify-center">
            <CalendarSend className="w-30 h-30 *:stroke-blue-400" />
          </div>
          <CardTitle className="text-2xl">
            {t.bookingConfirmation.title[lang]}
          </CardTitle>
          <p className="text-gray-600">{t.bookingConfirmation.message[lang]}</p>
        </CardHeader>
        <CardContent>
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
              <div className="bg-slate-50 p-4 rounded-md border">
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
                      {/* Booked By */}
                      <p className="text-sm text-gray-600 mb-1">
                        {t.bookingConfirmation.bookedBy[lang]}
                      </p>
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
                    {/* Status */}
                    <p className="text-sm text-gray-600 mb-1">
                      {t.bookingConfirmation.status[lang]}
                    </p>
                    <Badge
                      variant="outline"
                      className="capitalize bg-yellow-100 text-yellow-800 border-yellow-300"
                    >
                      {getTranslatedStatus(booking.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      {/* Booking Dates */}
                      <p className="text-sm text-gray-600">
                        {t.bookingConfirmation.bookingDates[lang]}
                      </p>
                      {booking.booking_items && (
                        <p className="font-medium text-sm">
                          {formatDate(
                            booking.booking_items[0].start_date,
                            "d MMM yyyy",
                          )}
                          -
                          {formatDate(
                            booking.booking_items[0].end_date,
                            "d MMM yyyy",
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Items */}
              {booking.booking_items && booking.booking_items.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {/* Booked Items Count */}
                      {t.bookingConfirmation.bookedItems[lang]} (
                      {booking.booking_items.length})
                    </h3>
                  </div>
                  {groupedItems.map((org) => {
                    return (
                      <div
                        className="space-y-2 mb-4"
                        key={`group-${org[0].org_name}`}
                      >
                        <p>{org[0]?.org_name}</p>
                        {org?.map((item) => (
                          <BookingItemDisplay key={item.id} item={item} />
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Notes */}
              {booking.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t.bookingConfirmation.notes[lang]}
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md border">
                    {booking.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-md text-left mb-6 text-amber-600 border">
              <p>{t.bookingConfirmation.notAvailable[lang]}</p>
            </div>
          )}

          <div className="flex gap-4 justify-center mt-8">
            <Button
              onClick={() =>
                navigate(BOOKED_BY_ORG ? "/admin/requests" : "/my-bookings")
              }
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
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
