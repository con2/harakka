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
import { BookingWithDetails } from "@/types";
import Spinner from "@/components/Spinner";
import BookingConfirmButton from "@/components/Admin/Bookings/BookingConfirmButton";
import BookingRejectButton from "@/components/Admin/Bookings/BookingRejectButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/StatusBadge";
import { makeSelectItemImages } from "@/store/slices/itemImagesSlice";

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

  // Helper: get all selectable item IDs
  const allSelectableIds = useMemo(() => {
    return ownedItemsForOrg
      .filter((item) => item.status === "pending")
      .map((item) => String(item.id));
  }, [ownedItemsForOrg]);

  // Select All / Deselect All logic
  const allSelected =
    selectedItemIds.length === allSelectableIds.length &&
    allSelectableIds.length > 0;
  const handleSelectAllToggle = () => {
    setSelectedItemIds(allSelected ? [] : allSelectableIds);
  };

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
      header: () => null,
      cell: ({ row }) => {
        const item = row.original;
        const isOwned = item.provider_organization_id === activeOrgId;
        const isSelectable = isOwned && item.status === "pending";
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
      header: t.bookingList.modal.bookingItems.columns.item[lang],
      cell: ({ row }) =>
        row.original.storage_items.translations?.[lang]?.item_name ?? "",
    },
    {
      accessorKey: "quantity",
      header: t.bookingList.modal.bookingItems.columns.quantity[lang],
      cell: ({ row }) => row.original.quantity,
    },
    {
      accessorKey: "start_date",
      header: t.bookingList.modal.bookingItems.columns.startDate[lang],
      cell: ({ row }) =>
        formatDate(new Date(row.original.start_date || ""), "d MMM yyyy"),
    },
    {
      accessorKey: "end_date",
      header: t.bookingList.modal.bookingItems.columns.endDate[lang],
      cell: ({ row }) =>
        formatDate(new Date(row.original.end_date || ""), "d MMM yyyy"),
    },
    {
      accessorKey: "status",
      header: t.bookingList.modal.bookingItems.columns.status[lang],
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
          <ChevronLeft /> {t.itemDetails?.buttons?.back?.[lang] || "Back"}
        </Button>
      </div>
      {/* Booking Info Section */}
      <div className="space-y-2 mt-4">
        <div className="flex flex-row items-start gap-4">
          <div className="flex flex-col space-y-2">
            <h3 className="font-normal">
              {t.bookingList.modal.customer[lang]}
            </h3>
            <p className="text-sm mb-0">
              {booking.full_name || t.bookingList.status.unknown[lang]}
            </p>
            <p className="text-sm text-gray-500">{booking.email}</p>
            <p className="text-sm">
              {t.bookingList.modal.date[lang]}{" "}
              {formatDate(new Date(booking.created_at || ""), "d MMM yyyy")}
            </p>
            <h3 className="font-normal mt-2">
              {t.bookingList.columns.status[lang]}{" "}
              <StatusBadge status={booking.status ?? "unknown"} />
            </h3>
          </div>
        </div>
      </div>
      {/* Booking Details + Select All/Deselect All */}
      <div className="flex flex-col">
        <div className="flex justify-start mb-2">
          {allSelectableIds.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSelectAllToggle}
              className="rounded-2xl border-secondary text-secondary"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>
        <DataTable
          columns={bookingItemsColumns}
          data={booking.booking_items || []}
        />
      </div>
      {/* Action buttons */}
      <Separator />
      <div className="flex flex-row justify-center items-center gap-8 mt-6">
        {booking.status === "pending" && ownedItemsForOrg.length > 0 && (
          <>
            <div className="flex flex-col items-center text-center">
              <span className="text-xs text-slate-600">
                {selectedItemIds.length === 0
                  ? t.bookingList.modal.buttons.confirmDisabled[lang]
                  : selectedItemIds.length === 1
                    ? t.bookingList.modal.buttons.confirmItem[lang]
                    : selectedItemIds.length === ownedItemsForOrg.length
                      ? t.bookingList.modal.buttons.confirmAll[lang]
                      : t.bookingList.modal.buttons.confirmItems[lang]}
              </span>
              <BookingConfirmButton
                id={booking.id}
                selectedItemIds={selectedItemIds}
                disabled={selectedItemIds.length === 0}
                onSuccess={refetchBooking}
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-xs text-slate-600">
                {selectedItemIds.length === 0
                  ? t.bookingList.modal.buttons.rejectDisabled[lang]
                  : selectedItemIds.length === 1
                    ? t.bookingList.modal.buttons.rejectItem[lang]
                    : selectedItemIds.length === ownedItemsForOrg.length
                      ? t.bookingList.modal.buttons.rejectAll[lang]
                      : t.bookingList.modal.buttons.rejectItems[lang]}
              </span>
              <BookingRejectButton
                id={booking.id}
                selectedItemIds={selectedItemIds}
                disabled={selectedItemIds.length === 0}
                onSuccess={refetchBooking}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingDetailsPage;
