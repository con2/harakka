import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectBookingLoading,
  selectBookingError,
  selectAllBookings,
  getOrderedBookings,
  selectBookingPagination,
} from "@/store/slices/bookingsSlice";
import {
  Eye,
  LoaderCircle,
  Calendar,
  Clock,
  AlertTriangle,
  Search,
} from "lucide-react";
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
import { useOrganizationNames } from "@/hooks/useOrganizationNames";
import { BookingPreviewWithOrgData } from "@common/bookings/booking.types";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import { useNavigate } from "react-router-dom";
import { formatBookingStatus } from "@/utils/format";
import { bookingsApi, OverdueBookingRow } from "@/api/services/bookings";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  const getAscending = (order: ValidBookingOrder) => order === "start_date";
  const { totalPages, page } = useAppSelector(selectBookingPagination);
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const { organizationId: activeOrgId } = useAppSelector(
    selectActiveRoleContext,
  );

  // Get organization IDs from bookings that have booked_by_org set
  const organizationIds = useMemo(() => {
    return (bookings as BookingPreviewWithOrgData[])
      .filter((booking) => booking.booked_by_org)
      .map((booking) => booking.booked_by_org)
      .filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates
  }, [bookings]);

  // Fetch organization names
  const { organizationNames } = useOrganizationNames(organizationIds);
  // Overdue-only scope
  const [scopeOverdue, setScopeOverdue] = useState(false);
  const [overdueRows, setOverdueRows] = useState<OverdueBookingRow[]>([]);
  const [overduePageCount, setOverduePageCount] = useState(1);
  const [overdueLoading, setOverdueLoading] = useState(false);
  const [overdueError, setOverdueError] = useState<string | null>(null);

  /*----------------------handlers----------------------------------*/
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  const handleSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleOrderToggle = (newOrderBy: ValidBookingOrder) => {
    if (scopeOverdue) setScopeOverdue(false);
    if (newOrderBy !== orderBy) {
      setOrderBy(newOrderBy);
      setCurrentPage(1);
    }
  };

  /*----------------------side-effects----------------------------------*/
  useEffect(() => {
    if (scopeOverdue) {
      // Fetch overdue rows locally
      setOverdueLoading(true);
      setOverdueError(null);
      bookingsApi
        .getOverdueBookings(currentPage, 10)
        .then((res) => {
          setOverdueRows(res.data as unknown as OverdueBookingRow[]);
          setOverduePageCount(res.metadata?.totalPages ?? 1);
        })
        .catch((err: unknown) => {
          const anyErr = err as { response?: { data?: { message?: string } } };
          const msg =
            anyErr?.response?.data?.message ||
            (err instanceof Error ? err.message : String(err));
          setOverdueError(msg);
        })
        .finally(() => setOverdueLoading(false));
      return;
    }

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
    scopeOverdue,
  ]);

  const statusFilterOptions = [
    "all",
    "pending",
    "confirmed",
    "rejected",
    "cancelled",
    "completed",
    "picked_up",
  ];

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
      header: () => (
        <p aria-label={t.bookingList.aria.labels.headers.bookingNumber[lang]}>
          {t.bookingList.columns.bookingNumber[lang]}
        </p>
      ),
      enableSorting: true,
      cell: ({ row }) =>
        row.original.booking_number ||
        t.uiComponents.dataTable.emptyCell[lang] ||
        "—",
    },
    {
      accessorKey: "full_name",
      header: t.bookingList.columns.customer[lang],
      enableSorting: true,
      cell: ({ row }) => {
        const booking = row.original;
        const orgName = booking.booked_by_org
          ? organizationNames[booking.booked_by_org]
          : null;

        return (
          <div>
            <div>
              {booking.full_name ||
                t.uiComponents.dataTable.emptyCell[lang] ||
                "—"}
            </div>
            <div className="text-xs text-gray-500">
              {booking.email || t.uiComponents.dataTable.emptyCell[lang] || "—"}
            </div>
            {orgName && (
              <div className="text-xs text-blue-600 font-medium mt-1">
                {t.bookingList.status.onBehalfOf[lang]} {orgName}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "start_date",
      header: t.bookingList.columns.startDate[lang],
      enableSorting: true,
      cell: ({ row }) => {
        const startDate = row.original.start_date;
        if (!startDate) {
          return t.uiComponents.dataTable.emptyCell[lang] || "—";
        }
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
      cell: ({ row }) => {
        const createdAt = row.original.created_at;
        if (!createdAt) {
          return t.uiComponents.dataTable.emptyCell[lang] || "—";
        }
        return formatDate(new Date(createdAt), "d MMM yyyy");
      },
    },
  ];

  const overdueColumns: ColumnDef<OverdueBookingRow>[] = useMemo(
    () => [
      {
        accessorKey: "booking_number",
        header: t.overdueBookings.columns.bookingNumber[lang],
        cell: ({ row }) =>
          row.original.booking_number ||
          t.uiComponents.dataTable.emptyCell[lang] ||
          "—",
      },
      {
        accessorKey: "full_name",
        header: t.overdueBookings.columns.customer[lang],
        cell: ({ row }) => (
          <div>
            <div>
              {row.original.full_name ||
                t.uiComponents.dataTable.emptyCell[lang] ||
                "—"}
            </div>
            <div className="text-xs text-gray-500">
              {row.original.user_email ||
                t.uiComponents.dataTable.emptyCell[lang] ||
                "—"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "earliest_due_date",
        header: t.overdueBookings.columns.dueDate[lang],
        cell: ({ row }) =>
          row.original.earliest_due_date ||
          t.uiComponents.dataTable.emptyCell[lang] ||
          "—",
      },
      {
        accessorKey: "days_overdue",
        header: t.overdueBookings.columns.daysOverdue[lang],
        cell: ({ row }) =>
          row.original.days_overdue ||
          t.uiComponents.dataTable.emptyCell[lang] ||
          "—",
      },
    ],
    [lang],
  );

  if (
    authLoading ||
    (loading && !scopeOverdue) ||
    (overdueLoading && scopeOverdue)
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8 mr-2" />
        <span>{t.bookingList.loading[lang]}</span>
      </div>
    );
  }

  if ((!scopeOverdue && error) || (scopeOverdue && overdueError)) {
    return (
      <div className="text-red-500 text-center p-4">
        {scopeOverdue ? overdueError : error}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl">{t.bookingList.title[lang]}</h1>
          <Button
            onClick={() => {
              if (scopeOverdue) {
                setOverdueLoading(true);
                bookingsApi
                  .getOverdueBookings(currentPage, 10)
                  .then((res) => {
                    setOverdueRows(res.data as unknown as OverdueBookingRow[]);
                    setOverduePageCount(res.metadata?.totalPages ?? 1);
                  })
                  .catch((err: unknown) => {
                    const anyErr = err as {
                      response?: { data?: { message?: string } };
                    };
                    const msg =
                      anyErr?.response?.data?.message ||
                      (err instanceof Error ? err.message : String(err));
                    setOverdueError(msg);
                  })
                  .finally(() => setOverdueLoading(false));
              } else {
                void dispatch(
                  getOrderedBookings({
                    ordered_by: orderBy,
                    ascending: getAscending(orderBy),
                    page: currentPage,
                    limit: 10,
                    searchquery: debouncedSearchQuery,
                    status_filter:
                      statusFilter !== "all" ? statusFilter : undefined,
                  }),
                );
              }
            }}
            className="bg-background rounded-2xl text-primary/80 border-primary/80 border-1 hover:text-white hover:bg-primary/90"
          >
            {t.bookingList.buttons.refresh[lang]}
          </Button>
        </div>
        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center relative">
            <Search
              aria-hidden
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4"
            />
            <Input
              type="text"
              placeholder={t.bookingList.filters.search[lang]}
              value={searchQuery}
              size={50}
              onChange={(e) => handleSearchQuery(e)}
              className={`w-full text-sm pl-10 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)] ${scopeOverdue ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={scopeOverdue}
            />
            <select
              aria-label={t.bookingList.aria.labels.filters.status[lang]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus)}
              className={`select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)] ${scopeOverdue ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={scopeOverdue}
            >
              {statusFilterOptions.map((option) => (
                <option key={`option-${option}`} value={option}>
                  {
                    t.bookingList.filters.status[
                      option as keyof typeof t.bookingList.filters.status
                    ]?.[lang]
                  }
                </option>
              ))}
            </select>
            {(searchQuery || statusFilter !== "all" || scopeOverdue) && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setScopeOverdue(false);
                }}
                size={"sm"}
                className="px-2 py-0 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
              >
                {t.bookingList.filters.clear[lang]}
              </Button>
            )}
          </div>

          {/* Ordering/Scope Toggle Buttons */}
          <div className="flex gap-2 items-center">
            <Label className="text-sm italic text-primary/70">
              {t.bookingList.filters.filterBy[lang]}
            </Label>
            {/* Recent Button */}
            <Button
              onClick={() => handleOrderToggle("created_at")}
              variant={
                !scopeOverdue && orderBy === "created_at"
                  ? "secondary"
                  : "default"
              }
              size="sm"
              aria-label={t.bookingList.aria.labels.filters.recent[lang]}
              aria-disabled={!scopeOverdue && orderBy === "created_at"}
              className={`flex items-center gap-2 ${
                !scopeOverdue && orderBy === "created_at"
                  ? "cursor-not-allowed opacity-75"
                  : "cursor-pointer"
              }`}
            >
              <Clock aria-hidden className="h-4 w-4" />
              {t.bookingList.filters.recent[lang]}
            </Button>
            {/* Upcoming Button */}
            <Button
              onClick={() => handleOrderToggle("start_date")}
              variant={
                !scopeOverdue && orderBy === "start_date"
                  ? "secondary"
                  : "default"
              }
              size="sm"
              aria-label={t.bookingList.aria.labels.filters.upcoming[lang]}
              aria-disabled={!scopeOverdue && orderBy === "start_date"}
              className={`flex items-center gap-2 ${
                !scopeOverdue && orderBy === "start_date"
                  ? "cursor-not-allowed opacity-75"
                  : "cursor-pointer"
              }`}
            >
              <Calendar aria-hidden className="h-4 w-4" />
              {t.bookingList.filters.upcoming[lang]}
            </Button>
            {/* Overdue Button */}
            <Button
              onClick={() => {
                if (!scopeOverdue) setCurrentPage(1);
                setScopeOverdue(true);
              }}
              variant={scopeOverdue ? "secondary" : "default"}
              size="sm"
              aria-label={t.bookingList.aria.labels.filters.overdue[lang]}
              disabled={scopeOverdue}
              className={`flex items-center gap-2 ${
                scopeOverdue
                  ? "cursor-not-allowed opacity-75"
                  : "cursor-pointer"
              }`}
            >
              <AlertTriangle aria-hidden className="h-4 w-4" />
              {t.bookingList.filters.overdue[lang]}
            </Button>
          </div>
        </div>
        {/* Table of Bookings */}
        {scopeOverdue ? (
          <PaginatedDataTable
            columns={overdueColumns}
            data={overdueRows}
            pageIndex={currentPage - 1}
            pageCount={overduePageCount}
            onPageChange={(page) => handlePageChange(page + 1)}
            rowProps={(row) => ({
              style: { cursor: "pointer" },
              onClick: () =>
                navigate(`/admin/bookings/${row.original.booking_id}`),
            })}
          />
        ) : (
          <PaginatedDataTable
            columns={columns}
            data={bookings}
            pageIndex={currentPage - 1}
            pageCount={totalPages}
            onPageChange={(page) => handlePageChange(page + 1)}
            rowProps={(row) => {
              return {
                style: { cursor: "pointer" },
                onClick: () => navigate(`/admin/bookings/${row.original.id}`),
              };
            }}
          />
        )}
      </div>
    </>
  );
};

export default BookingList;
