import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentBooking,
  getBookingByID,
  getBookingItems,
  cancelBooking,
  updateBooking,
} from "@/store/slices/bookingsSlice";
import { getOwnBookings } from "@/store/slices/bookingsSlice";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import { Button } from "@/components/ui/button";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import Spinner from "@/components/Spinner";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { toastConfirm } from "@/components/ui/toastConfirm";
import {
  getItemImages,
  selectItemsWithLoadedImages,
  makeSelectItemImages,
} from "@/store/slices/itemImagesSlice";
import { BookingItemWithDetails } from "@/types";
import InlineTimeframePicker from "@/components/InlineTimeframeSelector";
import { itemsApi } from "@/api/services/items";

const MyBookingsPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const booking = useAppSelector(selectCurrentBooking);
  const user = useAppSelector(selectSelectedUser);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();
  const [loading, setLoading] = useState(true);
  const itemsWithLoadedImages = useAppSelector(selectItemsWithLoadedImages);

  const [showEdit, setShowEdit] = useState(false);
  const [editFormItems, setEditFormItems] = useState<BookingItemWithDetails[]>(
    [],
  );
  const [globalStartDate, setGlobalStartDate] = useState<string | null>(null);
  const [globalEndDate, _setGlobalEndDate] = useState<string | null>(null);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {},
  );
  const [availability, setAvailability] = useState<{
    [itemId: string]: number;
  }>({});
  const [_loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    void (async () => {
      try {
        await dispatch(getBookingByID(id)).unwrap();
        await dispatch(getBookingItems(id)).unwrap();
      } catch {
        // ignore - errors stored in slice
      } finally {
        setLoading(false);
      }
    })();
  }, [id, dispatch]);

  // When booking is loaded, populate edit form defaults
  useEffect(() => {
    if (!booking) return;
    if (!booking.booking_items) return;

    setEditFormItems(booking.booking_items);
    setItemQuantities(
      Object.fromEntries(
        booking.booking_items.map((it) => [String(it.id), it.quantity]),
      ),
    );
    setGlobalStartDate(booking.booking_items?.[0]?.start_date ?? null);
    _setGlobalEndDate(booking.booking_items?.[0]?.end_date ?? null);
    // Fetch images for booking items
    if (booking?.booking_items) {
      booking.booking_items.forEach((item) => {
        if (!itemsWithLoadedImages.includes(item.item_id)) {
          void dispatch(getItemImages(item.item_id));
        }
      });
    }
  }, [booking, itemsWithLoadedImages, dispatch]);

  // Availability check when timeframe or items change
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!globalStartDate || !globalEndDate) return;
      setLoadingAvailability(true);
      const promises = editFormItems.map(async (item) => {
        try {
          const data = await itemsApi.checkAvailability(
            item.item_id,
            new Date(globalStartDate),
            new Date(globalEndDate),
          );
          const corrected = data.availableQuantity + (item.quantity ?? 0);
          setAvailability((prev) => ({ ...prev, [item.item_id]: corrected }));
        } catch {
          /* ignore availability errors */
        }
      });
      await Promise.all(promises);
      setLoadingAvailability(false);
    };

    void fetchAvailability();
  }, [globalStartDate, globalEndDate, editFormItems]);

  // Group items by provider organization id for display
  const itemsGroupedByOrg = useMemo(() => {
    const grouped: Record<string, BookingItemWithDetails[]> = {};
    if (!booking?.booking_items) return grouped;
    booking.booking_items.forEach((it) => {
      const orgId = it.provider_organization_id ?? "unknown";
      if (!grouped[orgId]) grouped[orgId] = [];
      grouped[orgId].push(it);
    });
    return grouped;
  }, [booking]);

  // ItemImage selector using itemImagesSlice
  const ItemImage = ({
    itemId,
    itemName,
  }: {
    itemId: string;
    itemName?: string;
  }) => {
    const selectItemImages = useMemo(() => makeSelectItemImages(), []);
    const images = useAppSelector((s) => selectItemImages(s, itemId));
    const first = images?.[0]?.image_url;

    return (
      <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
        {first ? (
          <img
            src={first}
            alt={itemName ?? ""}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs font-medium text-gray-600">
            {(itemName ?? "").slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
    );
  };

  const isFormValid = editFormItems.every((item) => {
    const inputQty =
      item.id !== undefined
        ? (itemQuantities[String(item.id)] ?? item.quantity)
        : item.quantity;
    const avail = availability[item.item_id];
    return avail === undefined || inputQty <= avail;
  });

  const timeframeDisplay = useMemo(() => {
    if (!booking?.booking_items || booking.booking_items.length === 0)
      return "";
    const s = booking.booking_items[0].start_date;
    const e = booking.booking_items[0].end_date;
    const sFmt = s ? formatDate(new Date(s), "d MMM yyyy") : "";
    const eFmt = e ? formatDate(new Date(e), "d MMM yyyy") : "";
    return `${sFmt}${sFmt && eFmt ? " - " : ""}${eFmt}`;
  }, [booking, formatDate]);

  const decrementQuantity = (item: BookingItemWithDetails) => {
    const key = String(item.id);
    const current = itemQuantities[key] ?? item.quantity ?? 0;
    const next = Math.max(1, current - 1);
    setItemQuantities((prev) => ({ ...prev, [key]: next }));
  };

  const incrementQuantity = (item: BookingItemWithDetails) => {
    const key = String(item.id);
    const current = itemQuantities[key] ?? item.quantity ?? 0;
    const avail = availability[item.item_id];
    const max = avail !== undefined ? avail : Infinity;
    const next = Math.min(max, current + 1);
    setItemQuantities((prev) => ({ ...prev, [key]: next }));
  };

  const handleSubmitEdit = async () => {
    if (!booking) return;
    const updatedItems = editFormItems
      .map((item) => {
        const quantity =
          item.id !== undefined
            ? (itemQuantities[String(item.id)] ?? item.quantity)
            : item.quantity;
        const start = globalStartDate ?? item.start_date;
        const end = globalEndDate ?? item.end_date;
        return {
          item_id: item.item_id,
          quantity: Number(quantity),
          start_date: new Date(start).toISOString(),
          end_date: new Date(end).toISOString(),
        };
      })
      .filter((it) => it.quantity > 0);

    try {
      if (updatedItems.length === 0) {
        await dispatch(cancelBooking(booking.id!)).unwrap();
        toast.success(t.myBookingsPage.edit.toast.emptyCancelled[lang]);
        if (user?.id) {
          void dispatch(
            getOwnBookings({
              page: 1,
              limit: 10,
            }),
          );
        }
        void navigate("/my-bookings");
        return;
      }
      console.debug("updateBooking payload", {
        bookingId: booking.id,
        items: updatedItems,
      });

      try {
        await dispatch(
          updateBooking({ bookingId: booking.id!, items: updatedItems }),
        ).unwrap();
        toast.success(t.myBookingsPage.edit.toast.bookingUpdated[lang]);
        if (user?.id) {
          void dispatch(
            getOwnBookings({
              page: 1,
              limit: 10,
            }),
          );
        }
      } catch (err: unknown) {
        console.error("updateBooking failed", err);
        let msg = "";
        if (typeof err === "string") msg = err;
        else if (err && typeof err === "object") {
          const e = err as Record<string, unknown>;
          msg = (e.message as string) || JSON.stringify(e);
        } else msg = String(err);
        toast.error(msg || t.myBookingsPage.edit.toast.updateFailed[lang]);
        return;
      }

      setShowEdit(false);
      void navigate("/my-bookings");
    } catch {
      toast.error(t.myBookingsPage.edit.toast.updateFailed[lang]);
    }
  };

  if (loading) return <Spinner containerClasses="py-8" />;

  if (!booking)
    return (
      <div className="p-8">{t.myBookingsPage.error.loadingError[lang]}</div>
    );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg min-h-[250px] bg-white">
      <div className="w-full bg-slate-50 p-4 rounded-lg mb-10 min-h-[250px]">
        <div className="mb-4">
          <Button
            onClick={() => navigate(-1)}
            className="text-secondary px-4 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.myBookingsPage.buttons.back[lang]}
          </Button>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-normal pt-2">
            {t.myBookingsPage.bookingDetails.title[lang]}{" "}
            {booking.booking_number}
          </h3>
          {booking.status === "pending" && !showEdit && (
            <Button
              onClick={() => {
                toastConfirm({
                  title:
                    t.myBookingsPage.edit.confirm.cancelBooking.title[lang],
                  description:
                    t.myBookingsPage.edit.confirm.cancelBooking.description[
                      lang
                    ],
                  confirmText:
                    t.myBookingsPage.edit.confirm.cancelBooking.confirmText[
                      lang
                    ],
                  cancelText:
                    t.myBookingsPage.edit.confirm.cancelBooking.cancelText[
                      lang
                    ],
                  onConfirm: async () => {
                    try {
                      if (booking.id) {
                        await dispatch(cancelBooking(booking.id)).unwrap();
                        toast.success(
                          t.myBookingsPage.edit.toast.emptyCancelled[lang],
                        );
                        void navigate("/my-bookings");
                      }
                    } catch {
                      toast.error(
                        t.myBookingsPage.edit.toast.cancelFailed[lang],
                      );
                    }
                  },
                });
              }}
              variant="destructive"
            >
              {t.myBookingsPage.edit.buttons.cancel[lang]}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div>
            <p className="text-md font-bold">{booking.full_name ?? ""}</p>
            <p className="text-sm mt-2">
              {t.myBookingsPage.headings.createdAt[lang]}{" "}
              {formatDate(booking.created_at, "d MMM yyyy")}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-2">
              <strong>{t.myBookingsPage.columns.status[lang]}</strong>
              <span className="ml-2">{booking.status}</span>
            </p>
            <p className="text-sm mt-2">
              {t.myBookingsPage.bookingDetails.items[lang]}:{" "}
              {booking.booking_items?.length ?? 0}
            </p>
          </div>
        </div>

        <div>
          {/* Booking Dates and Date Picker */}
          <div>
            <h3 className="font-medium">
              {t.myBookingsPage.headings.bookingDates[lang] ?? "Timeframe"}{" "}
            </h3>
            <div>
              {showEdit ? (
                <InlineTimeframePicker
                  startDate={globalStartDate ? new Date(globalStartDate) : null}
                  endDate={globalEndDate ? new Date(globalEndDate) : null}
                  onChange={(type, date) => {
                    if (type === "start") {
                      setGlobalStartDate(date ? date.toISOString() : null);
                      return;
                    }
                    _setGlobalEndDate(date ? date.toISOString() : null);
                  }}
                />
              ) : (
                <div className="text-sm">{timeframeDisplay}</div>
              )}
            </div>
          </div>
          {/* Items List */}
          <div className="mt-4">
            <h3 className="font-medium">
              {t.myBookingsPage.bookingDetails.items[lang]}
            </h3>
            <div className="space-y-4 mt-2">
              {Object.entries(itemsGroupedByOrg).map(([orgId, items]) => (
                <div key={orgId} className="p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">
                        {items && items.length > 0
                          ? (items[0].org_name ?? orgId)
                          : orgId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {items && items.length > 0
                          ? (items[0].location_id ?? "")
                          : ""}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2"
                      >
                        <ItemImage
                          itemId={item.item_id}
                          itemName={
                            item.storage_items.translations[lang]?.item_name
                          }
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {item.storage_items.translations[lang]?.item_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.location_id ?? ""}
                          </div>
                        </div>
                        {/* Quantity controls and availability */}
                        <div className="flex flex-col items-end">
                          {!showEdit ? (
                            <div className="text-sm">
                              {t.myBookingsPage.columns.quantity[lang]}:{" "}
                              {item.quantity}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => decrementQuantity(item)}
                                className="h-8 w-8 p-0"
                                disabled={
                                  (itemQuantities[String(item.id)] ??
                                    item.quantity ??
                                    0) <= 1
                                }
                                aria-label="decrease quantity"
                              >
                                -
                              </Button>

                              <div className="w-12 text-center">
                                {itemQuantities[String(item.id)] ??
                                  item.quantity}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => incrementQuantity(item)}
                                className="h-8 w-8 p-0"
                                disabled={
                                  (itemQuantities[String(item.id)] ??
                                    item.quantity ??
                                    0) >=
                                  (availability[item.item_id] ?? Infinity)
                                }
                                aria-label="increase quantity"
                              >
                                +
                              </Button>
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground mt-1">
                            {t.myBookingsPage.headings.availability[lang]}:{" "}
                            {availability[item.item_id] ?? "-"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Edit Buttons */}
          {booking.status === "pending" && (
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setShowEdit((s) => !s)} variant="outline">
                {showEdit
                  ? t.myBookingsPage.edit.buttons.cancel[lang]
                  : t.myBookingsPage.buttons.edit[lang]}
              </Button>
              {showEdit && (
                <Button
                  onClick={handleSubmitEdit}
                  disabled={!isFormValid}
                  variant={"secondary"}
                >
                  {t.myBookingsPage.edit.buttons.saveChanges[lang]}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
