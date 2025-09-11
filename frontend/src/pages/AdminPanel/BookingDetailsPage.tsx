import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getBookingByID,
  selectCurrentBooking,
  selectCurrentBookingLoading,
} from "@/store/slices/bookingsSlice";
import { BookingStatus, BookingWithDetails } from "@/types";
import Spinner from "@/components/Spinner";
import BookingConfirmButton from "@/components/Admin/Bookings/BookingConfirmButton";
import BookingRejectButton from "@/components/Admin/Bookings/BookingRejectButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Clipboard } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/StatusBadge";
import { makeSelectItemImages } from "@/store/slices/itemImagesSlice";
import BookingPickupButton from "@/components/Admin/Bookings/BookingPickupButton";
import BookingReturnButton from "@/components/Admin/Bookings/BookingReturnButton";
import BookingCancelButton from "@/components/Admin/Bookings/BookingCancelButton";
import { sortByStatus } from "@/store/utils/helper.utils";
import { formatBookingStatus } from "@/utils/format";

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
  // Only show org-owned items for selection
  const activeOrgId = booking?.booking_items?.[0]?.provider_organization_id;
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

  const sortedBookingItems = sortByStatus(booking?.booking_items ?? []);

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
      accessorKey: "start_date",
      header: t.bookingDetailsPage.modal.bookingItems.columns.startDate[lang],
      cell: ({ row }) =>
        formatDate(new Date(row.original.start_date || ""), "d MMM yyyy"),
    },
    {
      accessorKey: "end_date",
      header: t.bookingDetailsPage.modal.bookingItems.columns.endDate[lang],
      cell: ({ row }) =>
        formatDate(new Date(row.original.end_date || ""), "d MMM yyyy"),
    },
    {
      accessorKey: "status",
      header: t.bookingDetailsPage.modal.bookingItems.columns.status[lang],
      cell: ({ row }) => (
        <StatusBadge status={formatBookingStatus(row.original.status)} />
      ),
    },
  ];

  useEffect(() => {
    if (id) {
      void dispatch(getBookingByID(id));
    }
  }, [id, dispatch]);

  if (loading || !booking) {
    return <Spinner containerClasses="py-10" />;
  }

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
      <div>
        <h3 className="text-xl font-normal text-center">
          {t.bookingDetailsPage.modal.bookingDetails[lang]}{" "}
          {booking.booking_number}
        </h3>
        <div className="space-y-2 mt-4 mb-2 grid grid-cols-2 gap-4">
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
      </div>
      {/* Booking Details + Select All/Deselect All */}
      <div className="flex flex-col">
        <DataTable
          columns={bookingItemsColumns}
          data={sortedBookingItems || []}
        />
      </div>
      {/* Action buttons */}
      <Separator />
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
