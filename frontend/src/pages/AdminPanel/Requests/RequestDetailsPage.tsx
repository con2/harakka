import Spinner from "@/components/Spinner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  cancelBooking,
  getBookingByID,
  getBookingItems,
  getOrgBookings,
  selectBooking,
  selectBookingPagination,
  selectCurrentBooking,
  selectCurrentBookingLoading,
  updateBooking,
} from "@/store/slices/bookingsSlice";
import { BookingItemWithDetails, BookingWithDetails } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { formatDate } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { getRequestDetailsColumns } from "./requests.details.columns";
import { DataTable } from "@/components/ui/data-table";
import {
  getItemImages,
  selectItemsWithLoadedImages,
} from "@/store/slices/itemImagesSlice";
import {
  decrementQuantity,
  fetchItemsAvailability,
  incrementQuantity,
  updateQuantity,
} from "@/utils/quantityHelpers";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import { toastConfirm } from "@/components/ui/toastConfirm";

function RequestDetailsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const { user } = useAuth();
  const booking = useAppSelector(
    selectCurrentBooking,
  ) as BookingWithDetails | null;
  const loading = useAppSelector(selectCurrentBookingLoading);
  const { page, limit } = useAppSelector(selectBookingPagination);
  const { organizationId: activeOrgId } = useAppSelector(
    selectActiveRoleContext,
  );
  const itemsWithLoadedImages = useAppSelector(selectItemsWithLoadedImages);

  useEffect(() => {
    if (id) {
      void dispatch(getBookingByID({ booking_id: id }));
    }
  }, [id, dispatch]);

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
    const { booking_items } = booking ?? {};
    if (!booking_items || booking_items.length < 1) return [];
    return groupBookingItemsByOrg(booking_items);
  }, [booking]);

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

  useEffect(() => {
    console.log("status: ", booking?.org_status_for_active_org);
  }, [booking?.org_status_for_active_org]);
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
        await dispatch(cancelBooking(booking.id)).unwrap();
        toast.success(t.myBookingsPage.edit.toast.emptyCancelled[lang]);
        if (user?.id) {
          void dispatch(
            getOrgBookings({
              org_id: activeOrgId!,
              page,
              limit,
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
          updateBooking({ bookingId: booking.id, items: remainingItems }),
        ).unwrap();

        // Clear marked items and refresh data
        setItemsMarkedForRemoval(new Set());
        const res = await dispatch(
          getOrgBookings({ org_id: activeOrgId!, page, limit }),
        ).unwrap();
        const list = res && "data" in res ? res.data : [];
        const found = list?.find((b) => b.id === booking.id) || null;
        if (found) dispatch(selectBooking(found));
        await dispatch(getBookingItems(booking.id)).unwrap();
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

  if (!booking) return null;
  // console.log(groupedBookingItems);

  const {
    booking_number,
    status,
    booking_items,
    email,
    full_name,
    created_at,
  } = booking;

  const columns = getRequestDetailsColumns(
    lang,
    showEdit,
    itemsMarkedForRemoval,
    allItemsPending,
    itemQuantities,
    handleUpdateQuantity,
    handleIncrementQuantity,
    handleDecrementQuantity,
    availability,
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4 max-w-[900px]">
      <Button
        onClick={() => navigate(-1)}
        className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
      >
        <ChevronLeft /> {t.common.back[lang]}
      </Button>
      <div className="flex flex-col">
        {/* Booking overview and details */}
        <div className="mb-8 border-1 border-(muted-foreground) p-5 rounded bg-white flex flex-col gap-4">
          <h1 className="text-xl">
            {t.requestDetailsPage.title[lang].replace(
              "{booking_number}",
              booking_number,
            )}
          </h1>
          <div className="space-y-2 grid grid-cols-2 gap-4 text-sm text-primary">
            <div className="flex flex-col">
              <p>{full_name || t.bookingList.status.unknown[lang]}</p>
              <div className="flex items-center gap-2">
                <p className="mb-0">{email}</p>
              </div>
              <div className="flex flex-row gap-x-2 flex-wrap">
                {t.bookingDetailsPage.dateRange[lang]}{" "}
                <p>
                  {booking_items && booking_items.length > 0
                    ? `${formatDate(
                        new Date(booking_items[0].start_date || ""),
                        "d MMM yyyy",
                      )} - ${formatDate(
                        new Date(booking_items[0].end_date || ""),
                        "d MMM yyyy",
                      )}`
                    : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="font-normal mb-0 flex gap-2">
                {`${t.bookingDetailsPage.status[lang]}: `}
                <StatusBadge status={status} />
              </p>
              <p>{`Total items: ${booking_items?.length ?? 0}`}</p>
              <p>
                {`${t.bookingDetailsPage.modal.date[lang]} ${formatDate(new Date(created_at || ""), "d MMM yyyy")}`}
              </p>
            </div>
          </div>
          <div className="flex justify-start gap-3">
            {/* Back, Edit, Cancel & Save Buttons */}
            <div className="flex gap-2">
              {status === "pending" && allItemsPending && (
                <>
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
                </>
              )}
            </div>

            {status === "pending" && allItemsPending && !showEdit && (
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

        {/* Table */}
        {groupedBookingItems.map((orgGroup, index) => (
          <div key={orgGroup.orgName || `org-${index}`} className="mb-4">
            <h4 className="text-md font-medium mb-2 text-gray-700">
              {`${orgGroup.orgName || "Unknown Organization"} ${t.myBookingsPage.bookingDetails.orgItems[lang]} (${orgGroup.items.length})`}
            </h4>
            <div className="border rounded-3xl overflow-hidden [&_td,th]:p-2">
              <DataTable columns={columns} data={orgGroup.items} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RequestDetailsPage;
