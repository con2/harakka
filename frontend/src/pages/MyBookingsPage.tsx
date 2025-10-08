import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentBooking,
  getBookingItems,
  cancelBooking,
  updateBooking,
  selectUserBookings,
  selectBooking,
  selectBookingPagination,
} from "@/store/slices/bookingsSlice";
import { getOwnBookings } from "@/store/slices/bookingsSlice";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import { Button } from "@/components/ui/button";
import BookingReturnButton from "@/components/Admin/Bookings/BookingReturnButton";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import Spinner from "@/components/Spinner";
import { toast } from "sonner";
import { ArrowLeft, Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toastConfirm } from "@/components/ui/toastConfirm";
import {
  getItemImages,
  selectItemsWithLoadedImages,
} from "@/store/slices/itemImagesSlice";
import { BookingItemWithDetails } from "@/types";
import InlineTimeframePicker from "@/components/InlineTimeframeSelector";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef, Row } from "@tanstack/react-table";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import BookingPickupButton from "@/components/Admin/Bookings/BookingPickupButton";
import {
  decrementQuantity,
  incrementQuantity,
  updateQuantity,
  fetchItemsAvailability,
} from "@/utils/quantityHelpers";
import { ItemImage } from "@/components/ItemImage";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileTable from "@/components/ui/MobileTable";

const MyBookingsPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const booking = useAppSelector(selectCurrentBooking);
  const userBookings = useAppSelector(selectUserBookings);
  const user = useAppSelector(selectSelectedUser);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();
  const [loading, setLoading] = useState(true);
  const itemsWithLoadedImages = useAppSelector(selectItemsWithLoadedImages);
  const { isMobile } = useIsMobile();
  // Find the extended booking with orgs data from userBookings
  const extendedBooking = useMemo(() => {
    if (!booking?.id || !userBookings.length) return null;
    return userBookings.find((ub) => ub.id === booking.id) || null;
  }, [booking?.id, userBookings]);
  const ORGS_WITH_SELF_PICKUP = (extendedBooking?.orgs || []).filter((o) =>
    o.locations.filter((loc) => loc.self_pickup),
  );

  // Group booking items by organization
  const groupBookingItemsByOrg = (
    items: BookingItemWithDetails[],
  ): {
    orgName: string;
    items: BookingItemWithDetails[];
  }[] => {
    const groups = items.reduce<Map<string, BookingItemWithDetails[]>>(
      (map, item) => {
        const orgName =
          item?.org_name ||
          (item as BookingItemWithDetails & { provider_org?: { name: string } })
            ?.provider_org?.name ||
          "Unknown Organization";
        const key = orgName.toString();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(item);
        return map;
      },
      new Map(),
    );

    return [...groups.entries()]
      .sort(([aName], [bName]) => aName.localeCompare(bName, undefined))
      .map(([orgName, orgItems]) => ({ orgName, items: orgItems }));
  };

  const groupedBookingItems = useMemo(() => {
    if (!booking?.booking_items) return [];
    return groupBookingItemsByOrg(booking.booking_items);
  }, [booking?.booking_items]);

  // Self-pickup state & Date states
  const self_pickup_locations = ORGS_WITH_SELF_PICKUP.flatMap(
    (o) => o.locations,
  );
  const all_locations = extendedBooking?.orgs.flatMap((o) => o.locations);
  const HAS_SELF_PICKUP = self_pickup_locations.length > 0;
  const PICKUP_DATE = new Date(
    booking?.booking_items?.[0]?.start_date ?? "",
  ).setHours(0, 0, 0, 0);
  const TODAY = new Date().setHours(0, 0, 0, 0);

  // Check if all booking items are pending - only then allow editing
  const allItemsPending = useMemo(() => {
    if (!booking?.booking_items?.length) return false;
    return booking.booking_items.every((item) => item.status === "pending");
  }, [booking?.booking_items]);

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
  const [itemsMarkedForRemoval, setItemsMarkedForRemoval] = useState<
    Set<string>
  >(new Set());
  const pagination = useAppSelector(selectBookingPagination);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    void (async () => {
      try {
        const res = await dispatch(
          getOwnBookings({ page: pagination.page, limit: pagination.limit }),
        ).unwrap();
        const list = (res && "data" in res ? res.data : []) as
          | typeof userBookings
          | undefined;
        const found = list?.find((b) => b.id === id) || null;
        if (found) dispatch(selectBooking(found));
        await dispatch(getBookingItems(id)).unwrap();
      } catch {
        // ignore - errors stored in slice
      } finally {
        setLoading(false);
      }
    })();
  }, [id, dispatch, pagination.page, pagination.limit]);

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
    // Clear any previously marked items when re-initializing
    setItemsMarkedForRemoval(new Set());
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
    if (!globalStartDate || !globalEndDate) return;

    void fetchItemsAvailability(
      editFormItems,
      globalStartDate,
      globalEndDate,
      setAvailability,
      setLoadingAvailability,
    );
  }, [globalStartDate, globalEndDate, editFormItems]);

  /**
   * Columns for booking items data table
   */
  const bookingColumns: ColumnDef<BookingItemWithDetails>[] = [
    ...(isMobile
      ? []
      : [
          {
            accessorKey: "image",
            header: "",
            cell: ({ row }: { row: Row<BookingItemWithDetails> }) => (
              <ItemImage
                itemId={row.original.item_id}
                itemName={
                  row.original.storage_items.translations[lang]?.item_name
                }
              />
            ),
            size: 60,
          },
        ]),
    {
      accessorKey: "item_name",
      header: t.myBookingsPage.columns.item[lang],
      cell: ({ row }) => {
        const itemName =
          row.original.storage_items.translations[lang].item_name;
        const formattedName =
          itemName.charAt(0).toUpperCase() + itemName.slice(1);
        const isMarkedForRemoval = itemsMarkedForRemoval.has(
          String(row.original.id),
        );

        return (
          <span className={isMarkedForRemoval ? "line-through opacity-50" : ""}>
            {formattedName}
          </span>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: t.myBookingsPage.columns.quantity[lang],
      cell: ({ row }) => {
        const item = row.original;

        if (item.status === "cancelled" || !showEdit) return item.quantity;
        const isMarkedForRemoval = itemsMarkedForRemoval.has(String(item.id));

        if (!showEdit || !allItemsPending || isMarkedForRemoval) {
          return (
            <span
              className={isMarkedForRemoval ? "line-through opacity-50" : ""}
            >
              {item.quantity}
            </span>
          );
        }

        return (
          <div className="flex flex-col items-center w-fit justify-self-end md:justify-self-start">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDecrementQuantity(item)}
                className="h-8 w-8 p-0"
                disabled={
                  (itemQuantities[String(item.id)] ?? item.quantity ?? 0) <= 1
                }
                aria-label={t.myBookingsPage.aria.labels.quantity.decrease[
                  lang
                ].replace("{number}", (item.quantity - 1).toString())}
              >
                <Minus aria-hidden />
              </Button>
              <Input
                aria-label={t.myBookingsPage.aria.labels.quantity.enterQuantity[
                  lang
                ].replace("{number}", item.quantity.toString())}
                value={itemQuantities[String(item.id)] ?? item.quantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val) && val >= 1) {
                    handleUpdateQuantity(item, val);
                  }
                }}
                className="w-[50px] text-center"
                min="1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleIncrementQuantity(item)}
                className="h-8 w-8 p-0"
                disabled={
                  (itemQuantities[String(item.id)] ?? item.quantity ?? 0) >=
                  (availability[item.item_id] ?? Infinity)
                }
                aria-label={t.myBookingsPage.aria.labels.quantity.increase[
                  lang
                ].replace("{number}", (item.quantity + 1).toString())}
              >
                <Plus aria-hidden />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              {t.myBookingsPage.headings.availability[lang]}{" "}
              {availability[item.item_id] ?? "-"}
            </div>
          </div>
        );
      },
    },
    {
      header: "Location",
      cell: ({ row }) => (
        <div className="max-w-[170px] truncate justify-self-end md:justify-self-start">
          {all_locations?.find((l) => l.id === row.original.location_id)?.name}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t.myBookingsPage.columns.status[lang],
      cell: ({ row }) => {
        const item = row.original;
        const isMarkedForRemoval = itemsMarkedForRemoval.has(String(item.id));
        return (
          <div className={isMarkedForRemoval ? "line-through opacity-50" : ""}>
            <StatusBadge status={item.status} />
          </div>
        );
      },
    },
    ...(allItemsPending && showEdit
      ? [
          {
            id: "actions",
            header:
              showEdit && allItemsPending
                ? t.myBookingsPage.columns.actions[lang]
                : "",
            cell: ({ row }: { row: Row<BookingItemWithDetails> }) => {
              const item = row.original;
              if (!showEdit || !allItemsPending) {
                return null;
              }

              const isMarkedForRemoval = itemsMarkedForRemoval.has(
                String(item.id),
              );

              return (
                <div className="flex justify-end md:justify-center gap-1">
                  {!isMarkedForRemoval ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markItemForRemoval(item)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 rounded-md"
                      aria-label="mark item for removal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => undoItemRemoval(item)}
                      className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200 rounded-md"
                      aria-label="undo item removal"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            },
            size: 60,
          },
        ]
      : []),
  ];

  const isFormValid = editFormItems
    .filter((item) => !itemsMarkedForRemoval.has(String(item.id)))
    .every((item) => {
      const inputQty =
        item.id !== undefined
          ? (itemQuantities[String(item.id)] ?? item.quantity)
          : item.quantity;
      const avail = availability[item.item_id];
      return avail === undefined || inputQty <= avail;
    });

  // Statuses which have no further actions
  const END_STATUSES = ["cancelled", "rejected", "returned", "completed"];

  // Check if there are any changes to save
  const hasChangesToSave = useMemo(() => {
    const hasRemovals = itemsMarkedForRemoval.size > 0;
    const hasQuantityChanges = editFormItems.some((item) => {
      if (itemsMarkedForRemoval.has(String(item.id))) return false;
      const currentQuantity = itemQuantities[String(item.id)] ?? item.quantity;
      return Number(currentQuantity) !== item.quantity;
    });
    const hasDateChanges = editFormItems.some((item) => {
      const start = globalStartDate ?? item.start_date;
      const end = globalEndDate ?? item.end_date;
      return (
        new Date(start).toISOString() !==
          new Date(item.start_date).toISOString() ||
        new Date(end).toISOString() !== new Date(item.end_date).toISOString()
      );
    });

    return hasRemovals || hasQuantityChanges || hasDateChanges;
  }, [
    itemsMarkedForRemoval,
    editFormItems,
    itemQuantities,
    globalStartDate,
    globalEndDate,
  ]);

  const timeframeDisplay = useMemo(() => {
    if (!booking?.booking_items || booking.booking_items.length === 0)
      return "";
    const s = booking.booking_items[0].start_date;
    const e = booking.booking_items[0].end_date;
    const sFmt = s ? formatDate(new Date(s), "d MMM yyyy") : "";
    const eFmt = e ? formatDate(new Date(e), "d MMM yyyy") : "";
    return `${sFmt}${sFmt && eFmt ? " - " : ""}${eFmt}`;
  }, [booking, formatDate]);

  const refetchBookings = () => {
    if (!id) return;
    void (async () => {
      try {
        const res = await dispatch(
          getOwnBookings({ page: pagination.page, limit: pagination.limit }),
        ).unwrap();
        const list = (res && "data" in res ? res.data : []) as
          | typeof userBookings
          | undefined;
        const found = list?.find((b) => b.id === id) || null;
        if (found) dispatch(selectBooking(found));
      } catch {
        // ignore
      } finally {
        void dispatch(getBookingItems(id));
      }
    })();
  };

  // Edit helper functions - using shared utilities
  const handleDecrementQuantity = (item: BookingItemWithDetails) => {
    decrementQuantity(item, itemQuantities, setItemQuantities);
  };

  const handleIncrementQuantity = (item: BookingItemWithDetails) => {
    incrementQuantity(item, itemQuantities, setItemQuantities, availability);
  };

  const handleUpdateQuantity = (
    item: BookingItemWithDetails,
    newQuantity: number,
  ) => {
    // Ensure minimum quantity is 1
    const validQuantity = Math.max(1, newQuantity);
    updateQuantity(item, validQuantity, setItemQuantities, availability);
  };

  const markItemForRemoval = (item: BookingItemWithDetails) => {
    if (!item.id) return;
    setItemsMarkedForRemoval((prev) => new Set([...prev, String(item.id)]));
  };

  const undoItemRemoval = (item: BookingItemWithDetails) => {
    if (!item.id) return;
    setItemsMarkedForRemoval((prev) => {
      const newSet = new Set(prev);
      newSet.delete(String(item.id));
      return newSet;
    });
  };
  const handleSubmitEdit = async () => {
    if (!booking) return;

    // Filter out items marked for removal and process remaining items
    const remainingItems = editFormItems
      .filter((item) => !itemsMarkedForRemoval.has(String(item.id)))
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
      // Check if we're removing all items (cancelling the booking)
      if (remainingItems.length === 0) {
        await dispatch(cancelBooking(booking.id!)).unwrap();
        toast.success(t.myBookingsPage.edit.toast.emptyCancelled[lang]);
        if (user?.id) {
          void dispatch(
            getOwnBookings({
              page: pagination.page,
              limit: pagination.limit,
            }),
          );
        }
        void navigate("/my-bookings");
        return;
      }

      // Check if any changes were made (items removed, quantities changed, or dates changed)
      const hasRemovals = itemsMarkedForRemoval.size > 0;
      const hasQuantityChanges = editFormItems.some((item) => {
        if (itemsMarkedForRemoval.has(String(item.id))) return false;
        const currentQuantity =
          itemQuantities[String(item.id)] ?? item.quantity;
        return Number(currentQuantity) !== item.quantity;
      });
      const hasDateChanges = editFormItems.some((item) => {
        const start = globalStartDate ?? item.start_date;
        const end = globalEndDate ?? item.end_date;
        return (
          new Date(start).toISOString() !==
            new Date(item.start_date).toISOString() ||
          new Date(end).toISOString() !== new Date(item.end_date).toISOString()
        );
      });

      if (!hasRemovals && !hasQuantityChanges && !hasDateChanges) {
        setShowEdit(false);
        toast.info(t.myBookingsPage.edit.toast.noChanges[lang]);
        return;
      }

      // Update the booking with remaining items and show loading toast
      const updatePromise = (async () => {
        await dispatch(
          updateBooking({ bookingId: booking.id!, items: remainingItems }),
        ).unwrap();

        // Clear marked items and refresh data
        setItemsMarkedForRemoval(new Set());
        const res = await dispatch(
          getOwnBookings({ page: pagination.page, limit: pagination.limit }),
        ).unwrap();
        const list = (res && "data" in res ? res.data : []) as
          | typeof userBookings
          | undefined;
        const found = list?.find((b) => b.id === booking.id) || null;
        if (found) dispatch(selectBooking(found));
        await dispatch(getBookingItems(booking.id!)).unwrap();
      })();

      // Determine success message
      let successMessage: string;
      if (hasRemovals && (hasQuantityChanges || hasDateChanges)) {
        successMessage =
          t.myBookingsPage.edit.toast.bookingUpdatedItemRemoved[lang];
      } else if (hasRemovals) {
        successMessage = t.myBookingsPage.edit.toast.itemRemoved[lang];
      } else {
        successMessage = t.myBookingsPage.edit.toast.bookingUpdated[lang];
      }

      toast.promise(updatePromise, {
        loading: t.myBookingsPage.edit.toast.updatingBooking[lang],
        success: successMessage,
        error: t.myBookingsPage.edit.toast.updateFailed[lang],
      });

      await updatePromise;
      setShowEdit(false);
    } catch (err: unknown) {
      let msg = "";
      if (typeof err === "string") msg = err;
      else if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        msg = (e.message as string) || JSON.stringify(e);
      } else msg = String(err);
      toast.error(msg || t.myBookingsPage.edit.toast.updateFailed[lang]);
    }
  };

  if (loading) return <Spinner containerClasses="py-8" />;

  if (!booking)
    return (
      <div className="p-8">{t.myBookingsPage.error.loadingError[lang]}</div>
    );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg min-h-[250px] bg-white">
      <div className="mb-4 flex justify-between gap-2 flex-wrap">
        <Button
          onClick={() => navigate(-1)}
          className="text-secondary px-4 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.myBookingsPage.buttons.back[lang]}
        </Button>
        <div className="flex gap-2">
          {/* Edit/Save Buttons */}
          {booking.status === "pending" && allItemsPending && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (showEdit) {
                    // Clear marked items when canceling edit
                    setItemsMarkedForRemoval(new Set());
                  }
                  setShowEdit((s) => !s);
                }}
                variant="outline"
              >
                {showEdit
                  ? t.myBookingsPage.edit.buttons.cancel[lang]
                  : t.myBookingsPage.buttons.edit[lang]}
              </Button>
              {showEdit && (
                <Button
                  onClick={handleSubmitEdit}
                  disabled={!isFormValid || !hasChangesToSave}
                  variant={"secondary"}
                >
                  {t.myBookingsPage.edit.buttons.saveChanges[lang]}
                </Button>
              )}
            </div>
          )}
          {/* Cancel booking button */}
          {booking.status === "pending" && allItemsPending && !showEdit && (
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
      </div>

      <div className="w-full bg-slate-50 p-4 rounded-lg mb-10 min-h-[250px]">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-primary text-start font-semibold pt-2">
              {`${t.myBookingsPage.bookingDetails.title[lang]}
              ${booking.booking_number}`}
            </h2>
            <div className="flex gap-2"></div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Booking details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 my-8">
            {/* Booking Dates and Date Picker */}

            <div className="mb-4">
              <h3 className="font-semibold text-md mb-1">
                {t.myBookingsPage.headings.bookingDates[lang]}
              </h3>
              <div>
                <div className="text-sm">{timeframeDisplay}</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-md mb-1">
                {t.myBookingsPage.bookingDetails.bookingInfo[lang]}
              </h3>
              <p className="text-sm">
                {t.myBookingsPage.columns.status[lang]}:{" "}
                <StatusBadge status={booking.status} />
              </p>
              <p className="text-sm">
                {t.myBookingsPage.headings.createdAt[lang]}:{" "}
                {formatDate(booking.created_at, "d MMM yyyy")}
              </p>
            </div>
            {showEdit && allItemsPending && (
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
            )}
          </div>

          {HAS_SELF_PICKUP &&
            !allItemsPending &&
            !END_STATUSES.includes(booking.status!) &&
            TODAY >= PICKUP_DATE &&
            !showEdit && (
              <div className="bg-white w-full p-4 rounded-3xl flex mb-8 flex-wrap flex-col justify-center sm:justify-start">
                <h3 className="mb-0 font-main text-lg">
                  {t.requestDetailsPage.selfPickup.title[lang]}
                </h3>
                <p className="mb-4 text-sm">
                  {t.requestDetailsPage.selfPickup.description[lang]}
                </p>

                <div className="flex gap-4 flex-wrap">
                  {ORGS_WITH_SELF_PICKUP?.map((org) => {
                    const { locations, id: orgId } = org;

                    return (locations || []).map((loc, idx) => {
                      if (loc.pickup_status === "returned" || !id) return;
                      if (loc.pickup_status === "picked_up")
                        return (
                          <BookingReturnButton
                            key={`${loc.id}-${idx}`}
                            onSuccess={refetchBookings}
                            id={id}
                            org_id={orgId}
                            location_id={loc.id}
                            className="infoBtn flex !p-2 !px-4 gap-3 text-start items-center flex-1 sm:flex-0 h-fit"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold">{loc.name}</span>
                              {
                                t.requestDetailsPage.selfPickup.markAs.returned[
                                  lang
                                ]
                              }
                            </div>
                          </BookingReturnButton>
                        );

                      if (PICKUP_DATE < TODAY) return;
                      return (
                        <BookingPickupButton
                          id={id}
                          key={`${loc.id}-${idx}`}
                          location_id={loc.id}
                          org_id={orgId}
                          onSuccess={refetchBookings}
                          className="infoBtn flex !p-2 !px-4 gap-3 text-start items-center flex-1 sm:flex-0 h-fit"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold">{loc.name}</span>
                            {
                              t.requestDetailsPage.selfPickup.markAs.pickedUp[
                                lang
                              ]
                            }
                          </div>
                        </BookingPickupButton>
                      );
                    });
                  })}
                </div>
              </div>
            )}

          <div>
            {/* Booking Items */}
            {loading || _loadingAvailability ? (
              <Spinner containerClasses="py-8" />
            ) : (
              <div>
                {/* Grouped booking items by organization */}
                {groupedBookingItems.map((orgGroup, index) => (
                  <div
                    key={orgGroup.orgName || `org-${index}`}
                    className="mb-8"
                  >
                    <h4 className="text-md font-medium md:mb-2 mb-0 text-gray-700 pb-1">
                      {orgGroup.orgName || "Unknown Organization"}{" "}
                      {t.myBookingsPage.bookingDetails.orgItems[lang]} (
                      {orgGroup.items.length})
                    </h4>
                    {isMobile ? (
                      <MobileTable
                        columns={bookingColumns}
                        data={orgGroup.items}
                      />
                    ) : (
                      <DataTable
                        columns={bookingColumns}
                        data={orgGroup.items}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
