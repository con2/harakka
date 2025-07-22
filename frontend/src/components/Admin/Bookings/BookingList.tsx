import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAllBookings,
  selectBookingLoading,
  selectBookingError,
  selectAllBookings,
  updatePaymentStatus,
  selectBookingPage,
  selectBookingTotalPages,
  getOrderedBookings,
} from "@/store/slices/bookingsSlice";
import { Eye, LoaderCircle } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../ui/button";
import {
  PaymentStatus,
  ValidBooking,
  BookingUserViewRow,
  BookingStatus,
} from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import BookingReturnButton from "./BookingReturnButton";
import BookingConfirmButton from "./BookingConfirmButton";
import BookingRejectButton from "./BookingRejectButton";
import BookingDeleteButton from "./BookingDeleteButton";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { Separator } from "../../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import BookingPickupButton from "./BookingPickupButton";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const BookingList = () => {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectAllBookings);
  const loading = useAppSelector(selectBookingLoading);
  const error = useAppSelector(selectBookingError);
  const bookingsLoadedRef = useRef(false);
  const user = useAppSelector(selectSelectedUser);
  const { authLoading } = useAuth();
  const [selectedBooking, setSelectedBooking] =
    useState<BookingUserViewRow | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("all");
  const [booking, setBooking] = useState<ValidBooking>("booking_number");
  const [ascending, setAscending] = useState<boolean | null>(null);
  const page = useAppSelector(selectBookingPage);
  const totalPages = useAppSelector(selectBookingTotalPages);
  // Translation
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  /*----------------------handlers----------------------------------*/
  const handleViewDetails = (booking: BookingUserViewRow) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleBooking = (booking: string) =>
    setBooking(booking as ValidBooking);
  const handleAscending = (ascending: boolean | null) =>
    setAscending(ascending);

  /*----------------------side-effects----------------------------------*/
  useEffect(() => {
    if (debouncedSearchQuery || statusFilter || booking)
      void dispatch(
        getOrderedBookings({
          ordered_by: booking,
          page: currentPage,
          limit: 10,
          searchquery: debouncedSearchQuery,
          ascending: ascending === false ? false : true,
          status_filter: statusFilter !== "all" ? statusFilter : undefined,
        }),
      );
    else {
      void dispatch(getAllBookings({ page: currentPage, limit: 10 }));
      bookingsLoadedRef.current = true;
    }
  }, [
    debouncedSearchQuery,
    statusFilter,
    page,
    booking,
    dispatch,
    currentPage,
    ascending,
  ]);

  const columns: ColumnDef<BookingUserViewRow>[] = [
    {
      accessorKey: "booking_number",
      header: t.bookingList.columns.bookingNumber[lang],
      enableSorting: true,
    },
    {
      accessorKey: "full_name",
      header: t.bookingList.columns.customer[lang],
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          <div>
            {row.original.full_name || t.bookingList.status.unknown[lang]}
          </div>
          <div className="text-xs text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t.bookingList.columns.status[lang],
      enableSorting: true,
      cell: ({ row }) => <StatusBadge status={row.original.status!} />,
    },
    {
      accessorKey: "created_at",
      header: t.bookingList.columns.bookingDate[lang],
      enableSorting: true,
      cell: ({ row }) =>
        formatDate(new Date(row.original.created_at || ""), "d MMM yyyy"),
    },
    // {
    //   accessorKey: "date_range",
    //   header: t.bookingList.columns.dateRange[lang],
    //   cell: ({ row }) => {
    //     const items = row.original.booking_items || [];
    //     if (items.length === 0) return "-";

    //     // Get earliest start_date
    //     const minStartDate = items.reduce((minDate, item) => {
    //       const date = new Date(item.start_date);
    //       return date < minDate ? date : minDate;
    //     }, new Date(items[0].start_date));

    //     // Get latest end_date
    //     const maxEndDate = items.reduce((maxDate, item) => {
    //       const date = new Date(item.end_date);
    //       return date > maxDate ? date : maxDate;
    //     }, new Date(items[0].end_date));

    //     return (
    //       <div className="text-xs flex flex-col">
    //         <span>{`${formatDate(minStartDate, "d MMM yyyy")} -`}</span>
    //         <span>{`${formatDate(maxEndDate, "d MMM yyyy")}`}</span>
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "final_amount",
      header: t.bookingList.columns.total[lang],
      enableSorting: true,
      cell: ({ row }) => `€${row.original.final_amount?.toFixed(2) || "0.00"}`,
    },
    {
      accessorKey: "payment_status",
      header: t.bookingList.columns.invoice[lang],
      enableSorting: true,
      cell: ({ row }) => {
        const paymentStatus = row.original.payment_status ?? "N/A";

        const handleStatusChange = (
          newStatus:
            | "invoice-sent"
            | "paid"
            | "payment-rejected"
            | "overdue"
            | "N/A",
        ) => {
          void dispatch(
            updatePaymentStatus({
              bookingId: row.original.id!,
              status: newStatus === "N/A" ? null : (newStatus as PaymentStatus),
            }),
          );
        };

        return (
          <Select onValueChange={handleStatusChange} value={paymentStatus}>
            <SelectTrigger className="w-[120px] text-xs">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {[
                "invoice-sent",
                "paid",
                "payment-rejected",
                "overdue",
                "N/A",
              ].map((status) => {
                const statusKeyMap: Record<
                  string,
                  keyof typeof t.bookingList.columns.invoice.invoiceStatus
                > = {
                  "invoice-sent": "sent",
                  paid: "paid",
                  "payment-rejected": "rejected",
                  overdue: "overdue",
                  "N/A": "NA",
                };
                const statusKey = statusKeyMap[status];
                return (
                  <SelectItem className="text-xs" key={status} value={status}>
                    {t.bookingList.columns.invoice.invoiceStatus?.[statusKey]?.[
                      lang
                    ] || status}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const booking = row.original;
        const isPending = booking.status === "pending";
        const isConfirmed = booking.status === "confirmed";

        return (
          <div className="flex space-x-1">
            <Button
              variant={"ghost"}
              size="sm"
              onClick={() => handleViewDetails(booking)}
              title={t.bookingList.buttons.viewDetails[lang]}
              className="hover:text-slate-900 hover:bg-slate-300"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {isPending && (
              <>
                <BookingConfirmButton
                  id={booking.id!}
                  closeModal={() => setShowDetailsModal(false)}
                />
                <BookingRejectButton
                  id={booking.id!}
                  closeModal={() => setShowDetailsModal(false)}
                />
              </>
            )}

            {isConfirmed && (
              <BookingReturnButton
                id={booking.id!}
                closeModal={() => setShowDetailsModal(false)}
              />
            )}

            {isConfirmed && <BookingPickupButton />}

            <BookingDeleteButton
              id={booking.id!}
              closeModal={() => setShowDetailsModal(false)}
            />
          </div>
        );
      },
    },
  ];

  // const bookingColumns: ColumnDef<BookingItem>[] = [
  //   {
  //     accessorKey: "item_name",
  //     header: t.bookingList.modal.bookingItems.columns.item[lang],
  //     cell: (i) => {
  //       const itemName = i.getValue();
  //       return (
  //         String(itemName).charAt(0).toUpperCase() + String(itemName).slice(1)
  //       );
  //     },
  //   },
  //   {
  //     accessorKey: "quantity",
  //     header: t.bookingList.modal.bookingItems.columns.quantity[lang],
  //   },
  //   {
  //     accessorKey: "start_date",
  //     header: t.bookingList.modal.bookingItems.columns.startDate[lang],
  //     cell: ({ row }) => {
  //       formatDate(new Date(row.original.start_date || ""), "d MMM yyyy");
  //     },
  //   },
  //   {
  //     accessorKey: "end_date",
  //     header: t.bookingList.modal.bookingItems.columns.endDate[lang],
  //     cell: ({ row }) =>
  //       formatDate(new Date(row.original.end_date || ""), "d MMM yyyy"),
  //   },
  //   {
  //     accessorKey: "subtotal",
  //     header: t.bookingList.modal.bookingItems.columns.subtotal[lang],
  //     cell: ({ row }) => `€${row.original.subtotal?.toFixed(2) || "0.00"}`,
  //   },
  // ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8 mr-2" />
        <span>{t.bookingList.loading[lang]}</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl">{t.bookingList.title[lang]}</h1>

          <Button
            onClick={() => user && user?.id && dispatch(getAllBookings({}))}
            className="bg-background rounded-2xl text-primary/80 border-primary/80 border-1 hover:text-white hover:bg-primary/90"
          >
            {t.bookingList.buttons.refresh[lang]}
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder={t.bookingList.filters.search[lang]}
              value={searchQuery}
              size={50}
              onChange={(e) => handleSearchQuery(e)}
              className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus)}
              className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            >
              <option value="all">
                {t.bookingList.filters.status.all[lang]}
              </option>
              <option value="pending">
                {t.bookingList.filters.status.pending[lang]}
              </option>
              <option value="confirmed">
                {t.bookingList.filters.status.confirmed[lang]}
              </option>
              <option value="cancelled">
                {t.bookingList.filters.status.cancelled[lang]}
              </option>
              <option value="rejected">
                {t.bookingList.filters.status.rejected[lang]}
              </option>
              <option value="completed">
                {t.bookingList.filters.status.completed[lang]}
              </option>
              <option value="deleted">
                {t.bookingList.filters.status.deleted[lang]}
              </option>
              <option value="cancelled by admin">
                {t.bookingList.filters.status.cancelledByAdmin[lang]}
              </option>
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
                {t.bookingList.filters.clear[lang]}
              </Button>
            )}
          </div>
        </div>
        <PaginatedDataTable
          columns={columns}
          data={bookings as unknown as BookingUserViewRow[]}
          pageIndex={currentPage - 1}
          pageCount={totalPages}
          onPageChange={(page) => handlePageChange(page + 1)}
          booking={booking}
          ascending={ascending}
          handleBooking={handleBooking}
          handleAscending={handleAscending}
        />
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="min-w-[320px]">
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle className="text-left">
                  {t.bookingList.columns.bookingNumber[lang]}{" "}
                  {selectedBooking.booking_number}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Booking Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-normal">
                      {t.bookingList.modal.customer[lang]}
                    </h3>
                    <p className="text-sm mb-0">
                      {selectedBooking.full_name ||
                        t.bookingList.status.unknown[lang]}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedBooking.email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-normal">
                      {t.bookingList.modal.bookingInfo[lang]}
                    </h3>
                    <p className="text-sm mb-0">
                      {t.bookingList.modal.status[lang]}{" "}
                      <StatusBadge status={selectedBooking.status!} />
                    </p>
                    <p className="text-sm">
                      {t.bookingList.modal.date[lang]}{" "}
                      {formatDate(
                        new Date(selectedBooking.created_at || ""),
                        "d MMM yyyy",
                      )}
                    </p>
                  </div>
                </div>

                {/* booking Items */}
                <div>
                  {/* <DataTable
                    columns={bookingColumns}
                    data={selectedBooking.booking_items || []}
                  /> */}
                </div>

                {/* booking Modal Actions */}
                <div className="flex flex-col justify-center space-x-4">
                  <Separator />
                  <div className="flex flex-row items-center gap-4 mt-4 justify-center">
                    {selectedBooking.status === "pending" && (
                      <>
                        <div className="flex flex-col items-center text-center">
                          <span className="text-xs text-slate-600">
                            {t.bookingList.modal.buttons.confirm[lang]}
                          </span>
                          <BookingConfirmButton
                            id={selectedBooking.id!}
                            closeModal={() => setShowDetailsModal(false)}
                          />
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <span className="text-xs text-slate-600">
                            {t.bookingList.modal.buttons.reject[lang]}
                          </span>
                          <BookingRejectButton
                            id={selectedBooking.id!}
                            closeModal={() => setShowDetailsModal(false)}
                          />
                        </div>
                      </>
                    )}

                    {selectedBooking.status === "confirmed" && (
                      <>
                        <div className="flex flex-col items-center text-center">
                          <span className="text-xs text-slate-600">
                            {t.bookingList.modal.buttons.return[lang]}
                          </span>
                          <BookingReturnButton
                            id={selectedBooking.id!}
                            closeModal={() => setShowDetailsModal(false)}
                          />
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <span className="text-xs text-slate-600">
                            {t.bookingList.modal.buttons.pickedUp[lang]}
                          </span>
                          <BookingPickupButton />
                        </div>
                      </>
                    )}
                    <div className="flex flex-col items-center text-center">
                      <span className="text-xs text-slate-600">
                        {t.bookingList.modal.buttons.delete[lang]}
                      </span>
                      <BookingDeleteButton
                        id={selectedBooking.id!}
                        closeModal={() => setShowDetailsModal(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};

export default BookingList;
