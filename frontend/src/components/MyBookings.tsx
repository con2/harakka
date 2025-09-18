import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  cancelBooking,
  selectUserBookings,
  selectBookingError,
  selectBookingLoading,
  updateBooking,
  selectBooking,
  selectCurrentBooking,
  selectBookingItemsPagination,
  selectBookingPagination,
  selectCurrentBookingLoading,
  getBookingItems,
  clearCurrentBookingItems,
  clearUserBookings,
  getOwnBookings,
} from "@/store/slices/bookingsSlice";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import {
  getItemImages,
  selectItemsWithLoadedImages,
  makeSelectItemImages,
} from "@/store/slices/itemImagesSlice";
import {
  BookingPreview,
  BookingItemWithDetails,
  ExtendedBookingPreview,
} from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import BookingDetailsButton from "@/components/Admin/Bookings/BookingDetailsButton";
import BookingCancelButton from "@/components/BookingCancelButton";
import BookingEditButton from "@/components/BookingEditButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/context/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { t } from "@/translations";
import { DataTable } from "./ui/data-table";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { StatusBadge } from "./StatusBadge";
import InlineTimeframePicker from "./InlineTimeframeSelector";
import { itemsApi } from "@/api/services/items";
import Spinner from "./Spinner";
import { useRoles } from "../hooks/useRoles";
import BookingPickupButton from "./Admin/Bookings/BookingPickupButton";
import { formatBookingStatus } from "@/utils/format";
import {
  selectCurrentUserRoles,
  setActiveRoleContext,
} from "@/store/slices/rolesSlice";
import BookingReturnButton from "./Admin/Bookings/BookingReturnButton";

const MyBookings = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectSelectedUser);
  const bookings = useAppSelector(selectUserBookings);
  const loading = useAppSelector(selectBookingLoading);
  const error = useAppSelector(selectBookingError);
  const [hasFetchedBookings, setHasFetchedBookings] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editFormItems, setEditFormItems] = useState<BookingItemWithDetails[]>(
    [],
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [globalStartDate, setGlobalStartDate] = useState<string | null>(null);
  const [globalEndDate, setGlobalEndDate] = useState<string | null>(null);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {},
  );
  const [availability, setAvailability] = useState<{
    [itemId: string]: number;
  }>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const currentUserRoles = useAppSelector(selectCurrentUserRoles);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const selectedBooking = useAppSelector(selectCurrentBooking);
  const itemsWithLoadedImages = useAppSelector(selectItemsWithLoadedImages);
  const { page: itemPage, totalPages: itemTotalPages } = useAppSelector(
    selectBookingItemsPagination,
  );
  const [currentItemPage, setCurrentItemPage] = useState(1);
  const { activeContext } = useRoles();
  const { roleName } = activeContext;

  const { totalPages } = useAppSelector(selectBookingPagination);
  const { isMobile } = useIsMobile();
  const itemsLoading = useAppSelector(selectCurrentBookingLoading);

  // Translation
  const { lang } = useLanguage();
  const { formatDate: formatDateLocalized } = useFormattedDate();

  const statusFilterOptions = [
    "all",
    "pending",
    "confirmed",
    "rejected",
    "completed",
    "picked_up",
    "cancelled",
  ];
  const handleEditBooking = async (booking: BookingPreview) => {
    setLoadingAvailability(true);
    setShowEditModal(true);
    if (selectedBooking && selectedBooking.id === booking.id)
      return setLoadingAvailability(false);
    dispatch(selectBooking(booking));
    dispatch(clearCurrentBookingItems());
    await dispatch(getBookingItems(booking.id));
  };

  const refetchBookings = () => {
    if (user)
      void dispatch(
        getOwnBookings({
          page: currentPage + 1,
          limit: 10,
        }),
      );
  };

  useEffect(() => {
    if (
      activeContext.roleName !== "user" &&
      activeContext.roleName !== "requester"
    ) {
      dispatch(clearUserBookings());
    }
  }, [activeContext.roleName, dispatch]);

  useEffect(() => {
    if (
      selectedBooking &&
      !itemsLoading &&
      selectedBooking.booking_items === null
    ) {
      dispatch(clearCurrentBookingItems());
      setEditFormItems([]);
      setLoadingAvailability(false);
    } else if (selectedBooking && selectedBooking.booking_items) {
      setItemQuantities(
        Object.fromEntries(
          selectedBooking.booking_items.map((item) => [
            String(item.id),
            item.quantity,
          ]),
        ),
      );
      setGlobalStartDate(
        selectedBooking.booking_items?.[0]?.start_date ?? null,
      );
      setGlobalEndDate(selectedBooking.booking_items?.[0]?.end_date ?? null);
      setEditFormItems(selectedBooking.booking_items || []);
    }
  }, [selectedBooking, dispatch, itemsLoading]);

  // Fetch images for booking items when selectedBooking has items
  useEffect(() => {
    if (selectedBooking && selectedBooking.booking_items) {
      selectedBooking.booking_items.forEach((item) => {
        // Only fetch if we don't already have images for this item
        if (!itemsWithLoadedImages.includes(item.item_id)) {
          void dispatch(getItemImages(item.item_id));
        }
      });
    }
  }, [selectedBooking, itemsWithLoadedImages, dispatch]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      toast.error(t.myBookings.error.loginRequired[lang]);
      void navigate("/login");
      return;
    }

    if (roleName === "super_admin" || roleName === null) {
      return;
    }

    if (!hasFetchedBookings || activeContext) {
      const { organizationId } = activeContext;

      // Ensure organizationId is valid
      if (!organizationId) {
        toast.error(t.myBookings.error.invalidContext[lang]);
        return;
      }

      void dispatch(
        getOwnBookings({
          page: currentPage + 1,
          limit: 10,
        }),
      )
        .unwrap()
        .then(() => setHasFetchedBookings(true)) // Mark as fetched on success
        .catch(() => setHasFetchedBookings(true)); // Mark as fetched even on error
    }
  }, [
    dispatch,
    navigate,
    user,
    lang,
    hasFetchedBookings,
    currentPage,
    activeContext,
    roleName,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, statusFilter]);

  // Handle page change
  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return formatDateLocalized(new Date(dateString), "d MMM yyyy");
  };

  const handleViewDetails = (booking: BookingPreview) => {
    if (selectedBooking && selectedBooking.id === booking.id) {
      return setShowDetailsModal(true);
    }
    dispatch(selectBooking(booking));
    void dispatch(getBookingItems(booking.id));
    setShowDetailsModal(true);
  };
  const handleItemPageChange = (newPage: number) => setCurrentItemPage(newPage);

  const handleSubmitEdit = async () => {
    if (!selectedBooking || !showEditModal) return;

    const updatedItems = editFormItems
      .map((item) => {
        const quantity =
          item.id !== undefined
            ? (itemQuantities[item.id] ?? item.quantity)
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
      .filter((item) => item.quantity > 0);

    if (updatedItems.length === 0) {
      try {
        // No items left -> cancel booking directly. Do NOT call updateBooking with an empty items array
        await dispatch(cancelBooking(selectedBooking.id!)).unwrap();
        toast.warning(t.myBookings.edit.toast.emptyCancelled[lang]);
        if (user?.id) {
          void dispatch(
            getOwnBookings({
              page: currentPage + 1,
              limit: 10,
            }),
          );
        }
      } catch {
        toast.error(t.myBookings.edit.toast.cancelFailed[lang]);
      } finally {
        setShowEditModal(false);
      }
      return;
    }

    try {
      await dispatch(
        updateBooking({
          bookingId: selectedBooking.id!,
          items: updatedItems,
        }),
      ).unwrap();

      toast.success(t.myBookings.edit.toast.bookingUpdated[lang]);
      setShowEditModal(false);
      if (user?.id) {
        void dispatch(
          getOwnBookings({
            page: currentPage + 1,
            limit: 10,
          }),
        );
      }
    } catch {
      toast.error(t.myBookings.edit.toast.updateFailed[lang]);
    }
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!globalStartDate || !globalEndDate) return;

      const availabilityPromises = editFormItems.map(async (item) => {
        const itemId = item.item_id;
        const currentBookingQty = item.quantity ?? 0;

        try {
          const data = await itemsApi.checkAvailability(
            itemId,
            new Date(globalStartDate),
            new Date(globalEndDate),
          );

          const correctedAvailableQuantity =
            data.availableQuantity + currentBookingQty;

          setAvailability((prev) => ({
            ...prev,
            [itemId]: correctedAvailableQuantity,
          }));
        } catch (err) {
          console.error(`Error checking availability for item ${itemId}:`, err);
        }
      });

      await Promise.all(availabilityPromises);
      setLoadingAvailability(false);
    };

    void fetchAvailability();
  }, [globalStartDate, globalEndDate, editFormItems]);

  const isFormValid = editFormItems.every((item) => {
    const inputQty =
      item.id !== undefined
        ? (itemQuantities[item.id] ?? item.quantity)
        : item.quantity;
    const availQty = availability[item.item_id];

    return availQty === undefined || inputQty <= availQty;
  });

  /**
   * Columns of booking
   */

  const columns: ColumnDef<ExtendedBookingPreview>[] = [
    {
      accessorKey: "booking_number",
      header: t.myBookings.columns.bookingNumber[lang],
    },
    {
      accessorKey: "status",
      header: t.myBookings.columns.status[lang],
      cell: ({ row }) => (
        <StatusBadge status={formatBookingStatus(row.original.status)} />
      ),
    },
    {
      accessorKey: "created_at",
      header: t.myBookings.columns.date[lang],
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const booking = row.original;
        const hasBeenReviewed = booking.status !== "pending";
        const orgsWithPickup = booking.orgs
          ?.filter((o) => o.locations.some((l) => l.self_pickup === true))
          .map((o) => ({
            ...o,
            locations: o.locations?.filter((l) => l.self_pickup === true),
          }));
        const isPending = booking.status === "pending";
        const orgs_with_picked_up_items = orgsWithPickup?.filter(
          (o) =>
            o.org_booking_status !== "completed" &&
            o.locations.some((l) => l.pickup_status === "picked_up"),
        );
        return (
          <div className="flex space-x-2">
            <BookingDetailsButton
              booking={booking}
              onViewDetails={handleViewDetails}
            />

            {isPending && (
              <>
                <BookingEditButton
                  booking={booking}
                  onEdit={handleEditBooking}
                />
                <BookingCancelButton
                  id={booking.id}
                  closeModal={() => setShowDetailsModal(false)}
                />
              </>
            )}
            {hasBeenReviewed &&
              orgsWithPickup?.length > 0 &&
              orgsWithPickup?.flatMap((o) =>
                o.locations
                  ?.filter((l) => l.pickup_status === "confirmed")
                  .map((l) => (
                    <BookingPickupButton
                      onSuccess={refetchBookings}
                      location_id={l.id}
                      key={`pickup-${l.id}`}
                      id={booking.id}
                      className="gap-1"
                      org_id={o.id}
                    >
                      {l.name}
                    </BookingPickupButton>
                  )),
              )}
            {orgs_with_picked_up_items.map((o) =>
              o.locations.map((loc) => (
                <BookingReturnButton
                  key={`${o.id}-${loc.id}`}
                  org_id={o.id}
                  location_id={loc.id}
                  id={booking.id}
                  onSuccess={refetchBookings}
                >
                  {loc.name}
                </BookingReturnButton>
              )),
            )}
          </div>
        );
      },
    },
  ];

  /**
   * Small image component for booking items in the modal
   */
  const ItemImage = React.memo(({ item }: { item: BookingItemWithDetails }) => {
    // Create the selector once per component instance, then call it inside useAppSelector
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
  });

  /**
   * Columns of booking items
   */
  const bookingColumns: ColumnDef<BookingItemWithDetails>[] = [
    {
      accessorKey: "image",
      header: "", // No header for image column
      cell: ({ row }) => <ItemImage item={row.original} />,
      size: 60, // Fixed small width for image column
    },
    {
      accessorKey: "item_name",
      header: t.myBookings.columns.item[lang],
      cell: ({ row }) => {
        const itemName =
          row.original.storage_items.translations[lang].item_name;
        return itemName.charAt(0).toUpperCase() + itemName.slice(1);
      },
    },
    {
      accessorKey: "quantity",
      header: t.myBookings.columns.quantity[lang],
    },
    {
      accessorKey: "start_date",
      header: t.myBookings.columns.startDate[lang],
      cell: ({ row }) => formatDate(row.original.start_date),
    },
    {
      accessorKey: "end_date",
      header: t.myBookings.columns.endDate[lang],
      cell: ({ row }) => formatDate(row.original.end_date),
    },
  ];

  const globalUser = currentUserRoles.find(
    (r) => r.organization_name === "Global",
  );

  const viewPersonalBookings = () =>
    dispatch(
      setActiveRoleContext({
        organizationId: globalUser?.organization_id,
        roleName: globalUser?.role_name,
        organizationName: globalUser?.organization_name,
      }),
    );

  if (loading) {
    return (
      <Spinner
        containerClasses="flex-1 gap-3 text-primary text-sm"
        loaderClasses="text-secondary w-8 h-8"
      >
        Loading Bookings
      </Spinner>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        <p>{t.myBookings.error.loadingError[lang]}</p>
        <p className="text-sm">{error}</p>
        <Button
          onClick={() => {
            if (!user?.id) {
              toast.error(t.myBookings.error.loginRequired[lang]);
              return;
            }
            void dispatch(
              getOwnBookings({
                page: currentPage + 1,
                limit: 10,
              }),
            );
          }}
          className="mt-4"
        >
          {t.myBookings.buttons.tryAgain[lang]}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg min-h-[250px]">
      <div className="space-y-4 min-h-[250px]">
        {/* Filtering UI */}
        {activeContext.roleName !== "super_admin" && bookings.length > 0 && (
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder={t.myBookings.filter.searchPlaceholder[lang]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
              >
                {statusFilterOptions.map((o) => (
                  <option key={`option-${o}`} value={o}>
                    {
                      t.myBookings.status[
                        o as keyof typeof t.myBookings.status
                      ]?.[lang]
                    }
                  </option>
                ))}
              </select>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  size={"sm"}
                  className="px-2 py-0 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
                >
                  {t.myBookings.buttons.clearFilters[lang]}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* BookingPreview table or empty state */}
        {activeContext.roleName === "super_admin" ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <p className="text-lg mb-1">
              {t.myBookings.error.insufficientRole[lang]}
            </p>
            <p className="text-muted-foreground mb-4">
              {t.myBookings.error.insufficientRoleDescription[lang]}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="default" onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button variant="outline" onClick={viewPersonalBookings}>
                View personal bookings
              </Button>
            </div>
          </div>
        ) : (
          bookings?.length === 0 && (
            <div className="text-center py-8 bg-slate-50 rounded-lg">
              <p className="text-lg mb-2">
                {t.myBookings.emptyState.title[lang]}
              </p>
              <p className="text-muted-foreground mb-4">
                {t.myBookings.emptyState.description[lang]}
              </p>
              <Button
                onClick={() => navigate("/storage")}
                className="bg-background text-secondary border-secondary border hover:bg-secondary hover:text-white"
              >
                {t.myBookings.buttons.browseItems[lang]}
              </Button>
            </div>
          )
        )}
        {isMobile && (
          <Accordion type="multiple" className="w-full space-y-2">
            {bookings.map((booking) => (
              <AccordionItem key={booking.id} value={String(booking.id)}>
                <AccordionTrigger className="text-left">
                  <div className="flex flex-col w-full">
                    <span className="text-sm font-medium">
                      {t.myBookings.columns.bookingNumber[lang]}{" "}
                      {booking.booking_number}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(booking.created_at)} · {booking.status}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1">
                    {/* booking Info */}
                    <div className="text-sm">
                      <p>
                        <strong>{t.myBookings.mobile.status[lang]}</strong>{" "}
                        <StatusBadge status={booking.status} />
                      </p>
                    </div>

                    {/* booking Items */}
                    {selectedBooking && selectedBooking.booking_items && (
                      <>
                        <div className="bg-slate-50 rounded-md ">
                          <p className="text-md font-semibold">
                            {t.myBookings.bookingDetails.items[lang]}:
                          </p>
                          <div className="space-y-2 p-1">
                            {selectedBooking.booking_items.map((item) => (
                              <div
                                key={item.id}
                                className="text-xs space-y-1 border-b pb-2 last:border-b-0 last:pb-0"
                              >
                                <p>
                                  <strong>
                                    {t.myBookings.mobile.item[lang]}
                                  </strong>{" "}
                                  {item.storage_items.translations[lang]
                                    .item_name ?? "Unknown"}
                                </p>
                                <p>
                                  <strong>
                                    {t.myBookings.mobile.quantity[lang]}
                                  </strong>{" "}
                                  {item.quantity}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-3">
                      {booking.status === "pending" && (
                        <>
                          <BookingEditButton
                            booking={booking}
                            onEdit={() => {}}
                          />
                          <BookingCancelButton
                            id={booking.id}
                            closeModal={() => {}}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        {activeContext.roleName !== "super_admin" && bookings.length > 0 && (
          <>
            {totalPages > 1 ? (
              <PaginatedDataTable
                columns={columns}
                data={bookings}
                pageIndex={currentPage}
                pageCount={totalPages}
                onPageChange={handlePageChange}
              />
            ) : (
              <DataTable data={bookings} columns={columns} />
            )}
          </>
        )}
      </div>

      {/* Editing Booking Modal */}
      {selectedBooking && showEditModal && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-sm overflow-visible">
            <DialogHeader className="items-start">
              <DialogTitle>
                {t.myBookings.edit.title[lang]}
                {selectedBooking.booking_number}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {t.myBookings.edit.description[lang]}
              </DialogDescription>
            </DialogHeader>

            {(itemsLoading || loadingAvailability) && (
              <Spinner padding="py-10" />
            )}
            {!itemsLoading && !loadingAvailability && (
              <div className="space-y-4">
                <InlineTimeframePicker
                  startDate={globalStartDate ? new Date(globalStartDate) : null}
                  endDate={globalEndDate ? new Date(globalEndDate) : null}
                  onChange={(type, date) => {
                    if (type === "start") {
                      setGlobalStartDate(date?.toISOString() ?? null);
                    } else {
                      setGlobalEndDate(date?.toISOString() ?? null);
                    }
                  }}
                />
                {editFormItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-5 gap-4">
                    <div className="col-span-2 items-center">
                      <Label className="block text-xs font-medium">
                        {t.myBookings.edit.item[lang]}
                      </Label>
                      <p className="text-sm">
                        {item.storage_items.translations[lang].item_name ??
                          "Unknown"}
                      </p>
                    </div>
                    <div
                      className="flex flex-col h-full"
                      style={{ zIndex: 50, pointerEvents: "auto" }}
                    >
                      <div className="flex items-center gap-1 mt-auto">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            item.id !== undefined &&
                            itemQuantities[item.id] <= 1
                          }
                          onClick={() => {
                            if (item.id !== undefined) {
                              const newQty =
                                (itemQuantities[item.id] || item.quantity) - 1;
                              if (newQty >= 0) {
                                setItemQuantities({
                                  ...itemQuantities,
                                  [String(item.id)]: newQty,
                                });
                              }
                            }
                          }}
                        >
                          –
                        </Button>
                        <Input
                          value={
                            item.id !== undefined
                              ? (itemQuantities[item.id] ?? item.quantity)
                              : item.quantity
                          }
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (!isNaN(val) && val >= 0) {
                              setItemQuantities({
                                ...itemQuantities,
                                [String(item.id)]: val,
                              });
                            }
                          }}
                          className="w-[50px] text-center"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            availability[item.item_id] !== undefined &&
                            item.id !== undefined &&
                            itemQuantities[item.id] ===
                              availability[item.item_id]
                          }
                          onClick={() => {
                            if (item.id !== undefined) {
                              const newQty =
                                (itemQuantities[item.id] || item.quantity) + 1;
                              setItemQuantities({
                                ...itemQuantities,
                                [String(item.id)]: newQty,
                              });
                            }
                          }}
                        >
                          +
                        </Button>
                      </div>
                      {availability[item.item_id] && (
                        <p className="text-xs italic text-slate-400 mt-1">
                          Total of {availability[item.item_id]} items bookable
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between gap-2 mt-4">
                  <Button
                    variant={"secondary"}
                    onClick={() => setShowEditModal(false)}
                  >
                    {t.myBookings.edit.buttons.cancel[lang]}
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={handleSubmitEdit}
                    disabled={!showEditModal || !isFormValid}
                  >
                    {t.myBookings.edit.buttons.saveChanges[lang]}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl overflow-x-auto">
            <DialogHeader>
              <DialogTitle className="text-left">
                {t.myBookings.bookingDetails.title[lang]}
                {selectedBooking.booking_number}
              </DialogTitle>
              <DialogDescription className="text-left text-sm text-gray-600">
                {t.myBookings.bookingDetails.description[lang]}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* booking Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-normal text-sm mb-1">
                    {t.myBookings.bookingDetails.customerInfo[lang]}
                  </h3>
                  <p className="text-xs text-grey-500">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <div>
                  <h3 className="font-normal text-sm mb-1">
                    {t.myBookings.bookingDetails.bookingInfo[lang]}
                  </h3>
                  <p className="text-xs">
                    {t.myBookings.columns.status[lang]}:{" "}
                    <StatusBadge status={selectedBooking.status} />
                  </p>
                  <p className="text-xs">
                    {t.myBookings.columns.date[lang]}:{" "}
                    {formatDate(selectedBooking.created_at)}
                  </p>
                </div>
              </div>

              {/* Booking Items */}
              {bookings.length > 0 && (itemsLoading || loadingAvailability) ? (
                <Spinner containerClasses="py-8" />
              ) : (
                <div>
                  <h3 className="font-normal text-sm mb-2">
                    {t.myBookings.bookingDetails.items[lang]}
                  </h3>
                  <div className="border rounded-md overflow-hidden">
                    {itemTotalPages > 1 ? (
                      <PaginatedDataTable
                        pageCount={itemPage}
                        onPageChange={handleItemPageChange}
                        pageIndex={currentItemPage - 1}
                        columns={bookingColumns}
                        data={selectedBooking.booking_items || []}
                      />
                    ) : itemTotalPages === 1 ? (
                      <DataTable
                        columns={bookingColumns}
                        data={selectedBooking.booking_items || []}
                      />
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MyBookings;
