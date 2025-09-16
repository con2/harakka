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
} from "@/store/slices/bookingsSlice";
import { BookingStatus, BookingWithDetails } from "@/types";
import Spinner from "@/components/Spinner";
import BookingConfirmButton from "@/components/Admin/Bookings/BookingConfirmButton";
import BookingRejectButton from "@/components/Admin/Bookings/BookingRejectButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Clipboard, Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";
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
} from "@/store/slices/organizationLocationsSlice";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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
  const activeOrgId = useAppSelector(selectActiveOrganizationId);
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
    if (orgLocations.length === 0)
      void dispatch(fetchAllOrgLocations({ orgId: activeOrgId! }));
  }, [orgLocations, activeOrgId, dispatch]);

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
  const ownedItemsForOrg = useMemo(
    () =>
      (booking?.booking_items || []).filter(
        (it) => it.provider_organization_id === activeOrgId,
      ),
    [booking, activeOrgId],
  );

  // Statuses which have no further actions
  const END_STATUSES = ["cancelled", "rejected", "returned"];

  // Helper: get all selectable item IDs
  const allSelectableIds = useMemo(() => {
    return ownedItemsForOrg
      .filter((item) => !END_STATUSES.includes(item.status))
      .map((item) => String(item.id));
  }, [ownedItemsForOrg]); //eslint-disable-line

  // Select All / Deselect All logic
  const allSelected =
    selectedItemIds.length === allSelectableIds.length &&
    allSelectableIds.length > 0;
  const handleSelectAllToggle = () => {
    setSelectedItemIds(allSelected ? [] : allSelectableIds);
  };

  const hasPickedUpItems = booking?.booking_items?.some(
    (items) => items.status === "picked_up",
  );
  const hasPendingItems = booking?.booking_items?.some(
    (item) => item.status === "pending",
  );
  const hasReviewedBooking = booking?.booking_items?.every(
    (item) => item.status !== "pending",
  );
  const hasConfirmedItems = booking?.booking_items?.some(
    (item) => item.status === "confirmed",
  );
  const bookingOrg = booking?.booking_items?.[0].provider_organization_id;
  const sortedBookingItems = sortByStatus(booking?.booking_items ?? []);
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
      item.storage_items?.translations?.[lang]?.item_name || "Item";
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
        const isSelectable = !END_STATUSES.includes(item.status) && isOwned;
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
      cell: ({ row }) => <ItemImage item={row.original} />,
      size: 60,
    },
    {
      accessorKey: "item_name",
      header: t.bookingDetailsPage.modal.bookingItems.columns.item[lang],
      cell: ({ row }) =>
        row.original.storage_items.translations?.[lang]?.item_name ?? "",
    },
    {
      accessorKey: "quantity",
      header: t.bookingDetailsPage.modal.bookingItems.columns.quantity[lang],
      cell: ({ row }) => row.original.quantity,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const loc = orgLocations.find(
          (l) => l.storage_location_id === row.original.location_id,
        );
        return loc?.storage_locations?.name ?? "";
      },
    },
    {
      accessorKey: "status",
      header: t.bookingDetailsPage.modal.bookingItems.columns.status[lang],
      cell: ({ row }) => (
        <StatusBadge status={formatBookingStatus(row.original.status)} />
      ),
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

      <h3 className="text-xl font-normal pt-4">
        {t.bookingDetailsPage.modal.bookingDetails[lang]}{" "}
        {booking.booking_number}
      </h3>
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
              <p>Self-pickup</p>
              <Tooltip>
                <TooltipTrigger className="h-fit">
                  <Info className="w-[18px] h-fit" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[290px] text-center">
                  Allow user to pick up items themselves for selected locations.
                  If enabled, the items are marked as picked up by the user
                  instead of an admin.
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
                    <div className="flex gap-2 items-center">
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
        <DataTable
          columns={bookingItemsColumns}
          data={sortedBookingItems || []}
        />
      </div>
      {/* Action buttons */}
      <div className="flex flex-row justify-center items-center gap-8 mt-6">
        {hasPendingItems && ownedItemsForOrg.length > 0 && (
          <>
            <div className="flex flex-col items-center text-center">
              <span className="text-xs text-slate-600 max-w-[110px]">
                {selectedItemIds.length === 0 ||
                selectedItemIds.length === ownedItemsForOrg.length
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
                selectedItemIds.length === ownedItemsForOrg.length
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
              selectedItemIds.length === ownedItemsForOrg.length
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
              selectedItemIds.length === ownedItemsForOrg.length
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
              selectedItemIds.length === ownedItemsForOrg.length
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
    </div>
  );
};

export default BookingDetailsPage;
