import Spinner from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getOwnBookings,
  selectBookingLoading,
  selectBookingPagination,
  selectUserBookings,
} from "@/store/slices/bookingsSlice";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import { t } from "@/translations";
import { BookingStatus } from "@/types";
import { formatBookingStatus } from "@/utils/format";
import { BookingPreviewWithOrgData } from "@common/bookings/booking.types";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

function Requests() {
  const { lang } = useLanguage();
  const dispatch = useAppDispatch();
  const bookingsLoading = useAppSelector(selectBookingLoading);
  const bookings = useAppSelector(selectUserBookings);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all",
  );
  const debouncedSearchQuery = useDebouncedValue(searchTerm);

  const { organizationId: activeOrgId } = useAppSelector(
    selectActiveRoleContext,
  );
  const { totalPages, page, limit } = useAppSelector(selectBookingPagination);
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  const STATUS_OPTIONS: Array<BookingStatus | "all"> = [
    "all",
    "pending",
    "confirmed",
    "rejected",
    "completed",
    "picked_up",
    "cancelled",
  ];

  useEffect(() => {
    void dispatch(getOwnBookings({ page, limit, status: statusFilter }));
  }, [page, statusFilter]);

  const columns: ColumnDef<BookingPreviewWithOrgData>[] = [
    {
      accessorKey: "booking_number",
      header: t.myBookings.columns.bookingNumber[lang],
    },
    {
      accessorKey: "status",
      header: t.myBookings.columns.status[lang],
      cell: ({ row }) => {
        const original = row.original as Record<string, unknown>;
        return (
          <StatusBadge
            status={formatBookingStatus(
              (original.status as BookingStatus) ??
                ("pending" as BookingStatus),
            )}
          />
        );
      },
    },
    {
      accessorKey: "created_at",
      header: t.myBookings.columns.date[lang],
      cell: ({ row }) => {
        const original = row.original as Record<string, unknown>;
        return formatDate(original.created_at as string, "d MMM yyyy");
      },
    },
    {
      id: "actions",
      cell: () => <div className="text-sm" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <h1 className="text-xl mb-2">{t.requests.title[lang]}</h1>
        <p className="text-muted-foreground">{t.requests.description[lang]}</p>
      </div>
      <div className="flex flex-wrap gap-4 items-center relative">
        <Search
          aria-hidden
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4"
        />
        <Input
          placeholder={t.requests.filters.search[lang]}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && searchTerm) setSearchTerm("");
          }}
          className="pl-10 pr-9 rounded-md w-full focus:outline-none focus:ring-0 focus:ring-secondary focus:border-secondary focus:bg-white max-w-[300px]"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <Select
          onValueChange={(value) => setStatusFilter(value as BookingStatus)}
        >
          <SelectTrigger>
            {formatBookingStatus(statusFilter, true)}
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem value={opt} key={`option-${opt}`}>
                {formatBookingStatus(opt, true)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {bookingsLoading ? (
        <Spinner />
      ) : (
        <PaginatedDataTable
          columns={columns}
          data={bookings}
          pageIndex={currentPage - 1}
          pageCount={totalPages}
          onPageChange={handlePageChange}
          rowProps={() => ({
            style: { cursor: "pointer" },
            // If time, implement single view for booking
            // onClick: () => navigate(`/admin/requests/${row.original.id}`),
          })}
        />
      )}
    </div>
  );
}

export default Requests;
