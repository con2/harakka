import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { BookingStatus } from "@/types";
import {
  getOwnBookings,
  selectUserBookings,
  selectBookingPagination,
} from "@/store/slices/bookingsSlice";
import { useRoles } from "@/hooks/useRoles";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef, Row } from "@tanstack/react-table";
import { StatusBadge } from "@/components/StatusBadge";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { formatBookingStatus } from "@/utils/format";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const MyBookingsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const bookings = useAppSelector(selectUserBookings);
  const { totalPages } = useAppSelector(selectBookingPagination);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all",
  );
  const { lang } = useLanguage();
  const { formatDate: formatDateLocalized } = useFormattedDate();
  const STATUS_OPTIONS: Array<BookingStatus | "all"> = [
    "all",
    "pending",
    "confirmed",
    "rejected",
    "completed",
    "picked_up",
    "cancelled",
  ];

  const { activeContext } = useRoles();

  useEffect(() => {
    const status = statusFilter === "all" ? undefined : statusFilter;
    void dispatch(
      getOwnBookings({
        page: currentPage + 1,
        limit: 10,
        status,
        search: searchQuery,
      }),
    );
  }, [dispatch, currentPage, activeContext, statusFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, statusFilter]);

  // Server-side filtering is applied via getOwnBookings; use results as-is
  const filteredBookings = bookings;

  const columns: ColumnDef<unknown, unknown>[] = useMemo(() => {
    const formatDate = (dateString?: string): string => {
      if (!dateString) return "N/A";
      return formatDateLocalized(new Date(dateString), "d MMM yyyy");
    };

    return [
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
              status={
                (original.status as BookingStatus) ??
                ("pending" as BookingStatus)
              }
            />
          );
        },
      },
      {
        accessorKey: "created_at",
        header: t.myBookings.columns.date[lang],
        cell: ({ row }) => {
          const original = row.original as Record<string, unknown>;
          return formatDate(original.created_at as string);
        },
      },
      {
        id: "actions",
        cell: () => <div className="text-sm" />,
      },
    ];
  }, [lang, formatDateLocalized]);

  const handleRowClick = (row: Row<unknown>) => {
    const original = row.original as Record<string, unknown>;
    void navigate(`/my-bookings/${original.id as string}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg min-h-[250px] bg-white">
      <div className="w-full bg-slate-50 p-4 rounded-lg mb-10 min-h-[250px]">
        <div className="mb-4">
          <h1 className="text-xl">{t.myBookings.headings[lang]}</h1>
        </div>
        <div className="flex relative flex-wrap gap-4 items-center mb-4">
          <Search
            aria-hidden
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4"
          />
          <Input
            type="text"
            aria-placeholder={t.myBookings.aria.placeholders.search[lang]}
            placeholder={t.myBookings.filter.searchPlaceholder[lang]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm pl-10 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
          />
          <Select
            value={statusFilter}
            aria-label={t.myBookings.aria.labels.filterByStatus[lang]}
            onValueChange={(value) =>
              setStatusFilter(value as BookingStatus | "all")
            }
          >
            <SelectTrigger>
              {formatBookingStatus(statusFilter, true)}
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={`option-${o}`} value={o}>
                  {t.myBookings.status[o as keyof typeof t.myBookings.status]?.[
                    lang
                  ] ?? o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        {totalPages > 1 ? (
          <PaginatedDataTable
            columns={columns}
            data={filteredBookings}
            pageIndex={currentPage}
            pageCount={totalPages}
            onPageChange={setCurrentPage}
            rowProps={(row) => ({
              onClick: () => handleRowClick(row),
              className: "cursor-pointer hover:bg-gray-50",
            })}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredBookings}
            rowClick={(row) => handleRowClick(row)}
          />
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
