import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getBookingByID,
  selectCurrentBooking,
  selectCurrentBookingLoading,
  updateSelfPickup,
  updateBookingItem,
  cancelBookingItem,
} from "@/store/slices/bookingsSlice";
import { BookingStatus, BookingWithDetails } from "@/types";
import Spinner from "@/components/Spinner";
import BookingConfirmButton from "@/components/Admin/Bookings/BookingConfirmButton";
import BookingRejectButton from "@/components/Admin/Bookings/BookingRejectButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Clipboard, Info, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { useOrganizationNames } from "@/hooks/useOrganizationNames";
import { StatusBadge } from "@/components/StatusBadge";
import { makeSelectItemImages } from "@/store/slices/itemImagesSlice";
import BookingPickupButton from "@/components/Admin/Bookings/BookingPickupButton";
import BookingReturnButton from "@/components/Admin/Bookings/BookingReturnButton";
import BookingCancelButton from "@/components/Admin/Bookings/BookingCancelButton";
import { sortByStatus } from "@/store/utils/helper.utils";
import { formatBookingStatus } from "@/utils/format";
import {
  fetchAllOrgLocations,
  selectOrgLocations,
  selectOrgLocationsLoading,
} from "@/store/slices/organizationLocationsSlice";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import InlineTimeframePicker from "@/components/InlineTimeframeSelector";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { selectActiveRoleName } from "@/store/slices/rolesSlice";
import {
  decrementQuantity,
  incrementQuantity,
  updateQuantity,
  fetchItemsAvailability,
} from "@/utils/quantityHelpers";

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const booking = useAppSelector(
    selectCurrentBooking,
  ) as BookingWithDetails | null;
  const loading = useAppSelector(selectCurrentBookingLoading);
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();
  const orgLocations = useAppSelector(selectOrgLocations);
  const orgLocationsLoading = useAppSelector(selectOrgLocationsLoading);
  const activeOrgId = useAppSelector(selectActiveOrganizationId);
  const activeRole = useAppSelector(selectActiveRoleName);

  // Fetch organization name if booking was made on behalf of an organization
  const organizationIds = booking?.booked_by_org ? [booking.booked_by_org] : [];
  const { organizationNames } = useOrganizationNames(organizationIds);

  const isAdmin =
    activeRole === "tenant_admin" || activeRole === "storage_manager";
  const canEdit =
    (booking?.org_status_for_active_org === "pending" ||
      booking?.org_status_for_active_org === "confirmed") &&
    isAdmin;

  const hasItemsFromOtherOrgs = booking?.has_items_from_multiple_orgs ?? false;
  // Edit state management
  const [showEdit, setShowEdit] = useState(false);
  const [editFormItems, setEditFormItems] = useState<
    NonNullable<BookingWithDetails["booking_items"]>
  >([]);
  const [globalStartDate, setGlobalStartDate] = useState<string | null>(null);
  const [globalEndDate, setGlobalEndDate] = useState<string | null>(null);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {},
  );
  const [availability, setAvailability] = useState<{
    [itemId: string]: number;
  }>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // state for copy-to-clipboard feedback
  const [copiedEmail, setCopiedEmail] = useState(false);
  const copyEmailToClipboard = async (email?: string) => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error("Failed to copy email", err);
    }
  };

  useEffect(() => {
    if (!activeOrgId) return;
    const missingForBooking = booking?.booking_items?.some(
      (b) =>
        b.provider_organization_id === activeOrgId &&
        b.location_id &&
        !orgLocations.some((l) => l.storage_location_id === b.location_id),
    );

    if (orgLocations.length === 0 || missingForBooking) {
      void dispatch(
        fetchAllOrgLocations({
          orgId: activeOrgId,
          pageSize: 20,
          currentPage: 1,
        }),
      );
    }
  }, [booking, orgLocations, activeOrgId, dispatch]);
  // Computed booking item data
  const orgItems = useMemo(
    () =>
      booking?.booking_items?.filter(
        (item) => item.provider_organization_id === activeOrgId,
      ) || [],
    [booking?.booking_items, activeOrgId],
  );

  const activeOrgItems = useMemo(
    () => orgItems.filter((item) => item.status !== "cancelled"),
    [orgItems],
  );

  // Booking status flags
  const hasPickedUpItems = orgItems.some((item) => item.status === "picked_up");
  const hasPendingItems = orgItems.some((item) => item.status === "pending");
  const hasConfirmedItems = orgItems.some(
    (item) => item.status === "confirmed",
  );
  const hasReviewedBooking = orgItems.every(
    (item) => item.status !== "pending",
  );

  // Initialize edit form when booking is loaded (only active items)
  useEffect(() => {
    if (!booking?.booking_items) return;

    setEditFormItems(activeOrgItems);
    setItemQuantities(
      Object.fromEntries(
        activeOrgItems.map((it) => [String(it.id), it.quantity]),
      ),
    );
    setGlobalStartDate(activeOrgItems?.[0]?.start_date ?? null);
    setGlobalEndDate(activeOrgItems?.[0]?.end_date ?? null);
  }, [booking?.booking_items, activeOrgItems]);

  // Availability check when timeframe or items change during edit mode
  useEffect(() => {
    if (
      !globalStartDate ||
      !globalEndDate ||
      !showEdit ||
      hasItemsFromOtherOrgs
    )
      return;

    void fetchItemsAvailability(
      editFormItems,
      globalStartDate,
      globalEndDate,
      setAvailability,
      setLoadingAvailability,
    );
  }, [
    globalStartDate,
    globalEndDate,
    editFormItems,
    showEdit,
    hasItemsFromOtherOrgs,
  ]);

  // Track selected item IDs for bulk actions
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  // When booking changes, clear out any selected IDs that are no longer pending
  useEffect(() => {
    if (!booking) return;
    const stillPendingIds = (booking.booking_items || [])
      .filter((bi) => bi.status === "pending")
      .map((bi) => String(bi.id));
    setSelectedItemIds((prev) =>
      prev.filter((id) => stillPendingIds.includes(id)),
    );
  }, [booking]);

  // Refetch booking details (after confirm/reject)
  const refetchBooking = () => {
    if (!id) return;
    void dispatch(getBookingByID(id));
  };

  // Statuses which have no further actions
  const END_STATUSES = ["cancelled", "rejected", "returned"];

  // Helper: get all selectable item IDs (only from active items)
  const allSelectableIds = useMemo(() => {
    if (showEdit) return []; // No selection allowed in edit mode
    return activeOrgItems
      .filter((item) => !END_STATUSES.includes(item.status))
      .map((item) => String(item.id));
  }, [activeOrgItems, showEdit]); //eslint-disable-line

  // Select All / Deselect All logic
  const allSelected =
    selectedItemIds.length === allSelectableIds.length &&
    allSelectableIds.length > 0;
  const handleSelectAllToggle = () => {
    setSelectedItemIds(allSelected ? [] : allSelectableIds);
  };

  const bookingOrg = booking?.booking_items?.[0]?.provider_organization_id;
  const sortedBookingItems = sortByStatus(orgItems);
  const LOCATION_IDS = new Set(
    booking?.booking_items?.map((i) => i.location_id),
  );
  const locationsForItems = orgLocations.filter((loc) =>
    LOCATION_IDS.has(loc.storage_location_id),
  );
  const mappedPickUp = booking?.booking_items?.map((item) => ({
    location_id: item.location_id,
    self_pickup: item.self_pickup,
  }));
  const pickUpStatuses = Array.from(
    new Map(mappedPickUp?.map((p) => [p.location_id, p])).values(),
  );

  // Small image component for booking items (fetches from itemImages slice)
  const ItemImage = ({
    item,
  }: {
    item: NonNullable<BookingWithDetails["booking_items"]>[number];
  }) => {
    const selectItemImages = useMemo(() => makeSelectItemImages(), []);
    const images = useAppSelector((state) =>
      selectItemImages(state, item.item_id),
    );
    const firstImageUrl = images?.length > 0 ? images[0].image_url : undefined;
    const itemName =
      item.storage_items?.translations?.[lang]?.item_name ||
      t.bookingDetailsPage.items.item[lang];
    return (
      <div className="h-8 w-8 rounded-md ring-1 ring-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
        {firstImageUrl ? (
          <img
            src={firstImageUrl}
            alt={itemName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs font-medium text-gray-600">
            {itemName.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
    );
  };

  // DataTable columns for booking items
  const bookingItemsColumns: ColumnDef<
    NonNullable<BookingWithDetails["booking_items"]>[number]
  >[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          disabled={allSelectableIds.length < 1}
          checked={allSelected}
          onCheckedChange={handleSelectAllToggle}
        />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const isOwned = item.provider_organization_id === activeOrgId;
        const isSelectable =
          !END_STATUSES.includes(item.status) && isOwned && !showEdit;
        return (
          <Checkbox
            checked={selectedItemIds.includes(String(item.id))}
            onCheckedChange={(checked) => {
              if (!isSelectable) return;
              setSelectedItemIds((prev) =>
                checked
                  ? [...new Set([...prev, String(item.id)])]
                  : prev.filter((id) => id !== String(item.id)),
              );
            }}
            disabled={!isSelectable}
            aria-label="Select item"
          />
        );
      },
      size: 32,
    },
    {
      accessorKey: "image",
      header: "",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className={item.status === "cancelled" ? "opacity-50" : ""}>
            <ItemImage item={item} />
          </div>
        );
      },
      size: 60,
    },
    {
      accessorKey: "item_name",
      header: t.bookingDetailsPage.modal.bookingItems.columns.item[lang],
      cell: ({ row }) => {
        const item = row.original;
        const itemName =
          item.storage_items?.translations?.[lang]?.item_name ??
          t.bookingDetailsPage.items.unknownItem[lang];
        return (
          <span className={item.status === "cancelled" ? "opacity-50" : ""}>
            {itemName}
          </span>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: t.bookingDetailsPage.modal.bookingItems.columns.quantity[lang],
      cell: ({ row }) => {
        const item = row.original;
        if (!showEdit) {
          return (
            <span className={item.status === "cancelled" ? "opacity-50" : ""}>
              {item.quantity}
            </span>
          );
        }

        // Don't allow editing cancelled items
        if (item.status === "cancelled") {
          return <span className="opacity-50">{item.quantity}</span>;
        }

        return (
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDecrementQuantity(item)}
                className="h-8 w-8 p-0"
                disabled={
                  (itemQuantities[String(item.id)] ?? item.quantity ?? 1) <= 1
                }
                aria-label="decrease quantity"
              >
                -
              </Button>
              <Input
                value={itemQuantities[String(item.id)] ?? item.quantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val) && val >= 1) {
                    handleUpdateQuantity(item, val);
                  }
                }}
                className="w-[50px] text-center"
                min={1}
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
                aria-label="increase quantity"
              >
                +
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              {t.bookingDetailsPage.edit.columns.availability[lang]}:{" "}
              {availability[item.item_id] ?? "-"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: t.bookingDetailsPage.modal.bookingItems.columns.location[lang],
      cell: ({ row }) => {
        if (orgLocationsLoading) {
          return t.bookingDetailsPage.modal.bookingItems.columns.loading[lang];
        }

        const locId = row.original.location_id;
        const loc = orgLocations.find((l) => l.storage_location_id === locId);
        const name =
          loc?.storage_locations?.name ||
          t.uiComponents.dataTable.emptyCell[lang] ||
          "—";

        return (
          <span
            className={row.original.status === "cancelled" ? "opacity-50" : ""}
          >
            {name}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: t.bookingDetailsPage.modal.bookingItems.columns.status[lang],
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className={item.status === "cancelled" ? "opacity-50" : ""}>
            <StatusBadge status={formatBookingStatus(item.status)} />
          </div>
        );
      },
    },
    {
      id: "actions",
      header: showEdit ? t.bookingDetailsPage.edit.columns.actions[lang] : "",
      cell: ({ row }) => {
        const item = row.original;
        if (!showEdit || item.status === "cancelled") {
          return null;
        }

        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelItem(item)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 rounded-md"
              aria-label="cancel item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      size: 60,
    },
  ];

  const handleSelfPickup = (value: boolean, location_id: string) => {
    toast.promise(
      dispatch(
        updateSelfPickup({ bookingId: id!, location_id, newStatus: value }),
      ),
      {
        loading: t.bookingDetailsPage.toast.selfPickup.loading[lang],
        success: value
          ? t.bookingDetailsPage.toast.selfPickup.enabled[lang]
          : t.bookingDetailsPage.toast.selfPickup.disabled[lang],
        error: t.bookingDetailsPage.toast.selfPickup.failed[lang],
      },
    );
  };

  // Edit helper functions
  const handleDecrementQuantity = (
    item: NonNullable<BookingWithDetails["booking_items"]>[number],
  ) => {
    decrementQuantity(item, itemQuantities, setItemQuantities);
  };

  const handleIncrementQuantity = (
    item: NonNullable<BookingWithDetails["booking_items"]>[number],
  ) => {
    incrementQuantity(item, itemQuantities, setItemQuantities, availability);
  };

  const handleUpdateQuantity = (
    item: NonNullable<BookingWithDetails["booking_items"]>[number],
    newQuantity: number,
  ) => {
    updateQuantity(item, newQuantity, setItemQuantities, availability);
  };

  // Cancel item function
  const cancelItem = (
    item: NonNullable<BookingWithDetails["booking_items"]>[number],
  ) => {
    toastConfirm({
      title: t.bookingDetailsPage.edit.confirm.cancelItem.title[lang],
      description:
        t.bookingDetailsPage.edit.confirm.cancelItem.description[lang],
      confirmText:
        t.bookingDetailsPage.edit.confirm.cancelItem.confirmText[lang],
      cancelText: t.bookingDetailsPage.edit.confirm.cancelItem.cancelText[lang],
      onConfirm: async () => {
        try {
          await dispatch(
            cancelBookingItem({ bookingItemId: item.id }),
          ).unwrap();

          toast.success(t.bookingDetailsPage.edit.toast.itemCancelled[lang]);
          refetchBooking();
        } catch {
          toast.error(t.bookingDetailsPage.edit.toast.failedToCancelItem[lang]);
        }
      },
    });
  };

  const handleSubmitEdit = () => {
    if (!booking?.booking_items) return;

    const originalItems = booking.booking_items.filter(
      (item) => item.provider_organization_id === activeOrgId,
    );

    const itemsToUpdate: Array<{
      id: string;
      updates: { quantity?: number; start_date?: string; end_date?: string };
    }> = [];

    // Analyze what changed in each non-cancelled item
    originalItems.forEach((originalItem) => {
      if (!originalItem.id || originalItem.status === "cancelled") return;

      const newQuantity =
        itemQuantities[originalItem.id] ?? originalItem.quantity;
      const newStartDate = globalStartDate ?? originalItem.start_date;
      const newEndDate = globalEndDate ?? originalItem.end_date;

      const quantityChanged = newQuantity !== originalItem.quantity;
      // Only allow date changes if there are no items from other organizations
      const startDateChanged =
        !hasItemsFromOtherOrgs && newStartDate !== originalItem.start_date;
      const endDateChanged =
        !hasItemsFromOtherOrgs && newEndDate !== originalItem.end_date;

      if (quantityChanged || startDateChanged || endDateChanged) {
        const updates: {
          quantity?: number;
          start_date?: string;
          end_date?: string;
        } = {};

        if (quantityChanged) updates.quantity = newQuantity;
        if (startDateChanged)
          updates.start_date = new Date(newStartDate).toISOString();
        if (endDateChanged)
          updates.end_date = new Date(newEndDate).toISOString();

        itemsToUpdate.push({ id: originalItem.id, updates });
      }
    });

    if (itemsToUpdate.length === 0) {
      toast.info(t.bookingDetailsPage.edit.toast.noChanges[lang]);
      setShowEdit(false);
      return;
    }

    toastConfirm({
      title: t.bookingDetailsPage.edit.confirm.saveChanges.title[lang],
      description:
        t.bookingDetailsPage.edit.confirm.saveChanges.description[lang],
      confirmText:
        t.bookingDetailsPage.edit.confirm.saveChanges.confirmText[lang],
      cancelText:
        t.bookingDetailsPage.edit.confirm.saveChanges.cancelText[lang],
      onConfirm: async () => {
        await executeBookingItemChanges(itemsToUpdate);
      },
    });
  };

  const executeBookingItemChanges = async (
    itemsToUpdate: Array<{
      id: string;
      updates: { quantity?: number; start_date?: string; end_date?: string };
    }>,
  ) => {
    try {
      const promises: Promise<unknown>[] = [];

      // Update items
      itemsToUpdate.forEach(({ id, updates }) => {
        promises.push(
          dispatch(updateBookingItem({ bookingItemId: id, updates })).unwrap(),
        );
      });

      await Promise.all(promises);

      toast.success(t.bookingDetailsPage.edit.toast.bookingUpdated[lang]);
      setShowEdit(false);
      refetchBooking();
    } catch (err: unknown) {
      console.error("Failed to update booking items", err);
      let msg = "";
      if (typeof err === "string") msg = err;
      else if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        msg = (e.message as string) || JSON.stringify(e);
      } else msg = String(err);
      toast.error(msg || t.bookingDetailsPage.edit.toast.updateFailed[lang]);
    }
  };

  const isFormValid = editFormItems.every((item) => {
    const inputQty =
      item.id !== undefined
        ? (itemQuantities[String(item.id)] ?? item.quantity)
        : item.quantity;
    const avail = availability[item.item_id];
    return avail === undefined || inputQty <= avail;
  });

  useEffect(() => {
    if (id) {
      void dispatch(getBookingByID(id));
    }
  }, [id, dispatch, activeOrgId]);

  if (loading || !booking) {
    return <Spinner containerClasses="py-10" />;
  }

  // Renavigate if activeOrgId is not of this booking
  if (bookingOrg !== activeOrgId) void navigate("/");

  return (
    <div className="mt-4 mx-10">
      {/* Back Button */}
      <div>
        <Button
          onClick={() => navigate(-1)}
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
        >
          <ChevronLeft /> {t.bookingDetailsPage.buttons.back[lang]}
        </Button>
      </div>
      {/* Booking Info Section */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-normal pt-4">
          {t.bookingDetailsPage.modal.bookingDetails[lang]}{" "}
          {booking.booking_number}
        </h3>
        {canEdit && (
          <Button onClick={() => setShowEdit((s) => !s)} variant="outline">
            {showEdit
              ? t.bookingDetailsPage.edit.buttons.cancel[lang]
              : t.bookingDetailsPage.edit.buttons.editBooking[lang]}
          </Button>
        )}
      </div>

      <div className="mb-4  border-1 border-(muted-foreground) rounded bg-white">
        <div>
          <div className="space-y-2 grid grid-cols-2 gap-4 p-5 pb-2">
            <div className="flex flex-col text-md">
              <p>{booking.full_name || t.bookingList.status.unknown[lang]}</p>
              <div className="flex items-center gap-2">
                <p className="mb-0">{booking.email}</p>
                <button
                  type="button"
                  onClick={() => copyEmailToClipboard(booking.email ?? "")}
                  title={t.bookingDetailsPage.copy.title[lang]}
                  aria-label={t.bookingDetailsPage.copy.title[lang]}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <Clipboard className="h-4 w-4 text-gray-600" />
                </button>
                {copiedEmail && (
                  <span className="text-xs text-green-600">
                    {t.bookingDetailsPage.copy.copied[lang]}
                  </span>
                )}
              </div>
              {booking.booked_by_org &&
                organizationNames[booking.booked_by_org] && (
                  <p className="text-sm text-blue-600 font-medium mt-2">
                    {t.bookingDetailsPage.modal.onBehalfOf[lang]}{" "}
                    {organizationNames[booking.booked_by_org]}
                  </p>
                )}
              <p>
                {t.bookingDetailsPage.modal.date[lang]}{" "}
                {formatDate(new Date(booking.created_at || ""), "d MMM yyyy")}
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
                {t.bookingDetailsPage.info[lang]}{" "}
                {booking.booking_items?.length ?? 0}
              </p>
              <div className="flex flex-row  gap-2">
                {t.bookingDetailsPage.dateRange[lang]}{" "}
                <p>
                  {booking.booking_items && booking.booking_items.length > 0
                    ? formatDate(
                        new Date(booking.booking_items[0].start_date || ""),
                        "d MMM yyyy",
                      )
                    : ""}{" "}
                  -{" "}
                  {booking.booking_items && booking.booking_items.length > 0
                    ? formatDate(
                        new Date(booking.booking_items[0].end_date || ""),
                        "d MMM yyyy",
                      )
                    : ""}
                </p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="p-4">
            <div className="flex gap-2">
              <p>{t.bookingDetailsPage.selfPickup[lang]}</p>
              <Tooltip>
                <TooltipTrigger className="h-fit">
                  <Info className="w-[18px] h-fit" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[290px] text-center">
                  {t.bookingDetailsPage.tooltip.self_pickup[lang]}
                </TooltipContent>
              </Tooltip>
              <div className="flex gap-4 ml-4">
                {locationsForItems.map((loc) => {
                  const isChecked = pickUpStatuses.find(
                    (s) => s.location_id === loc.storage_location_id,
                  )?.self_pickup;
                  const isDisabled = !["pending", "confirmed"].includes(
                    booking.org_status_for_active_org ?? "",
                  );
                  return (
                    <div
                      key={loc.storage_location_id}
                      className="flex gap-2 items-center"
                    >
                      <div>{loc.storage_locations?.name}</div>

                      <Checkbox
                        checked={isChecked}
                        disabled={isDisabled}
                        onCheckedChange={(newValue) =>
                          handleSelfPickup(
                            newValue as boolean,
                            loc.storage_location_id,
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Booking Details + Select All/Deselect All */}
      <div className="flex flex-col">
        {/* Date picker for edit mode */}
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

        <DataTable
          columns={bookingItemsColumns}
          data={sortedBookingItems || []}
        />
      </div>

      {/* Edit Controls */}
      {canEdit && (
        <div className="flex gap-2 mt-4 justify-center">
          {showEdit && (
            <Button
              onClick={handleSubmitEdit}
              disabled={!isFormValid || loadingAvailability}
              variant="secondary"
            >
              {loadingAvailability
                ? t.bookingDetailsPage.edit.buttons.checkingAvailability[lang]
                : t.bookingDetailsPage.edit.buttons.saveChanges[lang]}
            </Button>
          )}
        </div>
      )}
      {/* Action buttons */}
      {!showEdit && (
        <div className="flex flex-row justify-center items-center gap-8 mt-6">
          {hasPendingItems && orgItems.length > 0 && (
            <>
              <div className="flex flex-col items-center text-center">
                <span className="text-xs text-slate-600 max-w-[110px]">
                  {selectedItemIds.length === 0 ||
                  selectedItemIds.length === orgItems.length
                    ? t.bookingDetailsPage.modal.buttons.confirmAll[lang]
                    : t.bookingDetailsPage.modal.buttons.confirmItems[lang]}
                </span>
                <BookingConfirmButton
                  id={booking.id}
                  selectedItemIds={selectedItemIds}
                  onSuccess={refetchBooking}
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-xs text-slate-600 max-w-[110px]">
                  {selectedItemIds.length === 0 ||
                  selectedItemIds.length === orgItems.length
                    ? t.bookingDetailsPage.modal.buttons.rejectAll[lang]
                    : t.bookingDetailsPage.modal.buttons.rejectItems[lang]}
                </span>
                <BookingRejectButton
                  id={booking.id}
                  selectedItemIds={selectedItemIds}
                  onSuccess={refetchBooking}
                />
              </div>
            </>
          )}
          {hasConfirmedItems && !hasPendingItems && (
            <div className="flex flex-col items-center text-center">
              <span className="text-xs text-slate-600 max-w-[110px]">
                {selectedItemIds.length === 0 ||
                selectedItemIds.length === orgItems.length
                  ? t.bookingDetailsPage.modal.buttons.pickUpAll[lang]
                  : t.bookingDetailsPage.modal.buttons.pickUpSome[lang].replace(
                      "{amount}",
                      selectedItemIds.length.toString(),
                    )}
              </span>
              <BookingPickupButton
                id={booking.id}
                selectedItemIds={selectedItemIds}
                onSuccess={refetchBooking}
              />
            </div>
          )}
          {hasPickedUpItems && (
            <div className="flex flex-col items-center text-center">
              <span className="text-xs text-slate-600 max-w-[110px]">
                {selectedItemIds.length === 0 ||
                selectedItemIds.length === orgItems.length
                  ? t.bookingDetailsPage.modal.buttons.returnAll[lang]
                  : t.bookingDetailsPage.modal.buttons.returnSome[lang].replace(
                      "{amount}",
                      selectedItemIds.length.toString(),
                    )}
              </span>
              <BookingReturnButton
                id={booking.id}
                onSuccess={refetchBooking}
                itemIds={selectedItemIds}
              />
            </div>
          )}
          {hasReviewedBooking && hasConfirmedItems && (
            <div className="flex flex-col items-center text-center">
              <span className="text-xs text-slate-600 max-w-[110px]">
                {selectedItemIds.length === 0 ||
                selectedItemIds.length === orgItems.length
                  ? t.bookingDetailsPage.modal.buttons.cancelAll[lang]
                  : t.bookingDetailsPage.modal.buttons.cancelSome[lang].replace(
                      "{amount}",
                      selectedItemIds.length.toString(),
                    )}
              </span>
              <BookingCancelButton
                id={booking.id}
                onSuccess={refetchBooking}
                itemIds={selectedItemIds}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingDetailsPage;
