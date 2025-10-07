import Spinner from "@/components/Spinner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  cancelBooking,
  clearCurrentBooking,
  deleteBookingItem,
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
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import InlineTimeframePicker from "@/components/InlineTimeframeSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileTable from "@/components/ui/MobileTable";

function RequestDetailsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();

  const { user } = useAuth();
  const booking = useAppSelector(
    selectCurrentBooking,
  ) as BookingWithDetails | null;
  const loading = useAppSelector(selectCurrentBookingLoading);
  const { page, limit } = useAppSelector(selectBookingPagination);
  const { organizationId: activeOrgId, organizationName: activeOrgName } =
    useAppSelector(selectActiveRoleContext);
  const itemsWithLoadedImages = useAppSelector(selectItemsWithLoadedImages);
  const { isMobile } = useIsMobile();

  useEffect(() => {
    const fetchBooking = async () => {
      if (id) {
        await dispatch(getBookingByID({ booking_id: id }));
        if (booking && !loading) {
          const { booked_by_org } = booking;
          const isNotAuthorized = booked_by_org !== activeOrgId;
          if (isNotAuthorized) {
            toast.info(
              t.requestDetailsPage.messages.redirectUnauthorized[lang].replace(
                "{org_name}",
                activeOrgName!,
              ),
            );
            const pageState = (location.state as { page?: number })?.page;
            void navigate("/admin/requests", {
              state: pageState ? { page: pageState } : undefined,
            });
          }
        }
      }
    };
    void fetchBooking();

    return () => {
      void dispatch(clearCurrentBooking());
    };
  }, [id, dispatch, activeOrgId]); //eslint-disable-line

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
    setGlobalEndDate(booking.booking_items?.[0]?.end_date ?? null);
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
  const [globalEndDate, setGlobalEndDate] = useState<string | null>(null);
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
  const hasItemsFromOtherOrgs = booking?.has_items_from_multiple_orgs ?? false;

  const removeItem = (
    item: NonNullable<BookingWithDetails["booking_items"]>[number],
  ) => {
    if (!booking?.booking_items) return;

    const orgItems = booking.booking_items.filter(
      (bookingItem) =>
        bookingItem.provider_organization_id === activeOrgId &&
        bookingItem.status !== "cancelled",
    );
    const isLastOrgItem = orgItems.length === 1 && orgItems[0].id === item.id;

    confirmItemDeletion(item, isLastOrgItem);
  };
  // Reusable confirmation function for item deletions
  const confirmItemDeletion = (
    item: NonNullable<BookingWithDetails["booking_items"]>[number],
    isLastOrgItem: boolean,
  ) => {
    const config = isLastOrgItem
      ? {
          title: t.bookingDetailsPage.confirmations.removeAllItems.title[lang],
          description:
            t.bookingDetailsPage.confirmations.removeAllItems.description[lang],
          confirmText:
            t.bookingDetailsPage.confirmations.removeAllItems.confirmText[lang],
          onSuccess: () => {
            const pageState = (location.state as { page?: number })?.page;
            void navigate("/admin/requests", {
              state: pageState ? { page: pageState } : undefined,
            });
          },
        }
      : {
          title: t.bookingDetailsPage.confirmations.removeItem.title[lang],
          description:
            t.bookingDetailsPage.confirmations.removeItem.description[lang],
          confirmText:
            t.bookingDetailsPage.confirmations.removeItem.confirmText[lang],
          onSuccess: () =>
            toast.success(
              t.bookingDetailsPage.edit.toast.itemPermanentlyRemoved[lang],
            ),
        };

    toastConfirm({
      title: config.title,
      description: config.description,
      confirmText: config.confirmText,
      cancelText:
        t.bookingDetailsPage.confirmations.removeItem.cancelText[lang],
      onConfirm: async () => {
        try {
          await dispatch(
            deleteBookingItem({
              bookingId: booking!.id,
              bookingItemId: item.id,
            }),
          ).unwrap();

          if (isLastOrgItem) {
            toast.success(
              t.bookingDetailsPage.edit.toast.itemRemovedWillNotAppear[lang],
            );
            config.onSuccess();
          } else {
            config.onSuccess();
          }
        } catch {
          toast.error(t.bookingDetailsPage.edit.toast.failedToRemoveItem[lang]);
        }
      },
    });
  };

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
        const pageState = (location.state as { page?: number })?.page;
        void navigate("/admin/requests", {
          state: pageState ? { page: pageState } : undefined,
        });
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
    removeItem,
    isMobile,
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4 max-w-[900px]">
      <Button
        onClick={() => {
          const pageState = (location.state as { page?: number })?.page;
          void navigate("/admin/requests", {
            state: pageState ? { page: pageState } : undefined,
          });
        }}
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
          <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary">
            <div className="flex flex-col">
              <p>{full_name}</p>
              <div className="flex items-center gap-2">
                <p className="mb-0">{email}</p>
              </div>
              <div className="flex flex-row gap-x-2 flex-wrap">
                {t.requestDetailsPage.dateRange[lang]}{" "}
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
                {`${t.common.status[lang]}: `}
                <StatusBadge status={status} />
              </p>
              <p>{`Total items: ${booking_items?.length ?? 0}`}</p>
              <p>
                {`${t.common.date[lang]} ${formatDate(new Date(created_at || ""), "d MMM yyyy")}`}
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
                          const pageState = (
                            location.state as { page?: number }
                          )?.page;
                          void navigate("/admin/requests", {
                            state: pageState ? { page: pageState } : undefined,
                          });
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
                {t.common.cancel[lang]}
              </Button>
            )}
          </div>
        </div>
        {showEdit && (
          <div className="mb-4">
            {hasItemsFromOtherOrgs ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  {t.bookingDetailsPage.edit.hasItemsFromMultipleOrgs[lang]}
                </p>
              </div>
            ) : (
              <InlineTimeframePicker
                startDate={globalStartDate ? new Date(globalStartDate) : null}
                endDate={globalEndDate ? new Date(globalEndDate) : null}
                onChange={(type, date) => {
                  if (type === "start") {
                    setGlobalStartDate(date ? date.toISOString() : null);
                    return;
                  }
                  setGlobalEndDate(date ? date.toISOString() : null);
                }}
              />
            )}
          </div>
        )}
        {/* Table */}
        {groupedBookingItems.map((orgGroup, index) => (
          <div key={orgGroup.orgName || `org-${index}`} className="mb-4">
            <h4 className="text-md font-medium mb-2 text-gray-700">
              {`${orgGroup.orgName || "Unknown Organization"} ${t.myBookingsPage.bookingDetails.orgItems[lang]} (${orgGroup.items.length})`}
            </h4>
            {isMobile ? (
              <MobileTable columns={columns} data={orgGroup.items} />
            ) : (
              <DataTable columns={columns} data={orgGroup.items} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RequestDetailsPage;
