import { ChangeEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectBookingLoading,
  selectBookingError,
  selectAllBookings,
  getOrderedBookings,
  selectBookingPagination,
} from "@/store/slices/bookingsSlice";
import { Eye, LoaderCircle, Calendar, Clock } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { BookingStatus, ValidBookingOrder } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { BookingPreviewWithOrgData } from "@common/bookings/booking.types";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";
import { useNavigate } from "react-router-dom";
import { formatBookingStatus } from "@/utils/format";

const BookingList = () => {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectAllBookings);
  const loading = useAppSelector(selectBookingLoading);
  const error = useAppSelector(selectBookingError);
  const navigate = useNavigate();
  const { authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("all");
  const [orderBy, setOrderBy] = useState<ValidBookingOrder>("created_at");
  // For start_date: ascending=true (closest dates first), for created_at: ascending=false (most recent first)
  const getAscending = (order: ValidBookingOrder) => order === "start_date";
  const { totalPages, page } = useAppSelector(selectBookingPagination);
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const activeOrgId = useAppSelector(selectActiveOrganizationId);

  /*----------------------handlers----------------------------------*/
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  const handleSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleOrderToggle = (newOrderBy: ValidBookingOrder) => {
    if (newOrderBy !== orderBy) {
      setOrderBy(newOrderBy);
      setCurrentPage(1);
    }
  };

  /*----------------------side-effects----------------------------------*/
  useEffect(() => {
    void dispatch(
      getOrderedBookings({
        ordered_by: orderBy,
        ascending: getAscending(orderBy),
        page: currentPage,
        limit: 10,
        searchquery: debouncedSearchQuery,
        status_filter: statusFilter !== "all" ? statusFilter : undefined,
      }),
    );
  }, [
    debouncedSearchQuery,
    statusFilter,
    page,
    orderBy,
    dispatch,
    currentPage,
    activeOrgId,
  ]);

  const columns: ColumnDef<BookingPreviewWithOrgData>[] = [
    {
      id: "actions",
      size: 5,
      cell: () => {
        return (
          <div className="flex space-x-1">
            <Button
              variant={"ghost"}
              size="sm"
              title={t.bookingList.buttons.viewDetails[lang]}
              className="hover:text-slate-900 hover:bg-slate-300"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
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
      accessorKey: "start_date",
      header: t.bookingList.columns.startDate[lang],
      enableSorting: true,
      cell: ({ row }) => {
        const startDate = row.original.start_date;
        if (!startDate) return t.bookingList.status.unknown[lang];
        return formatDate(new Date(startDate), "d MMM yyyy");
      },
    },
    {
      id: "org_status",
      header: t.bookingList.columns.status[lang],
      enableSorting: false,
      cell: ({ row }) => {
        const status =
          row.original.org_status_for_active_org ??
          (row.original.status as string | undefined);
        return (
          <StatusBadge
            status={formatBookingStatus(status as BookingStatus) ?? "unknown"}
          />
        );
      },
    },
    {
      accessorKey: "created_at",
      header: t.bookingList.columns.bookingDate[lang],
      enableSorting: true,
      cell: ({ row }) =>
        formatDate(new Date(row.original.created_at || ""), "d MMM yyyy"),
    },
  ];

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
            onClick={() =>
              dispatch(
                getOrderedBookings({
                  ordered_by: orderBy,
                  ascending: getAscending(orderBy),
                  page: currentPage,
                  limit: 10,
                  searchquery: debouncedSearchQuery,
                  status_filter:
                    statusFilter !== "all" ? statusFilter : undefined,
                }),
              )
            }
            className="bg-background rounded-2xl text-primary/80 border-primary/80 border-1 hover:text-white hover:bg-primary/90"
          >
            {t.bookingList.buttons.refresh[lang]}
          </Button>
        </div>
        {/* Search and Filters */}
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
              <option value="rejected">
                {t.bookingList.filters.status.rejected[lang]}
              </option>
              <option value="cancelled">
                {t.bookingList.filters.status.cancelled[lang]}
              </option>
              <option value="picked_up">
                {t.bookingList.filters.status.picked_up[lang]}
              </option>
              <option value="returned">
                {t.bookingList.filters.status.returned[lang]}
              </option>
              <option value="completed">
                {t.bookingList.filters.status.completed[lang]}
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

          {/* Ordering Toggle Buttons */}
          <div className="flex gap-2 items-center">
            <span className="text-sm italic text-primary/70">
              {t.bookingList.filters.filterBy[lang]}
            </span>
            <Button
              onClick={() => handleOrderToggle("created_at")}
              variant={orderBy === "created_at" ? "secondary" : "default"}
              size="sm"
              disabled={orderBy === "created_at"}
              className={`flex items-center gap-2 ${
                orderBy === "created_at"
                  ? "cursor-not-allowed opacity-75"
                  : "cursor-pointer"
              }`}
            >
              <Clock className="h-4 w-4" />
              {t.bookingList.filters.recent[lang]}
            </Button>
            <Button
              onClick={() => handleOrderToggle("start_date")}
              variant={orderBy === "start_date" ? "secondary" : "default"}
              size="sm"
              disabled={orderBy === "start_date"}
              className={`flex items-center gap-2 ${
                orderBy === "start_date"
                  ? "cursor-not-allowed opacity-75"
                  : "cursor-pointer"
              }`}
            >
              <Calendar className="h-4 w-4" />
              {t.bookingList.filters.upcoming[lang]}
            </Button>
          </div>
        </div>
        {/* Table of Bookings */}
        <PaginatedDataTable
          columns={columns}
          data={bookings}
          pageIndex={currentPage - 1}
          pageCount={totalPages}
          onPageChange={(page) => handlePageChange(page + 1)}
          rowProps={(row) => ({
            style: { cursor: "pointer" },
            onClick: () => navigate(`/admin/bookings/${row.original.id}`),
          })}
        />
      </div>
    </>
  );
};

export default BookingList;
