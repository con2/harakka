import Spinner from "@/components/Spinner";
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
  getOrgBookings,
  selectBookingLoading,
  selectBookingPagination,
  selectOrgBookings,
} from "@/store/slices/bookingsSlice";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import { t } from "@/translations";
import { BookingStatus } from "@/types";
import { formatBookingStatus } from "@/utils/format";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRequestColumns } from "./requests.columns";
import { Role } from "@common/role.types";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileTable from "@/components/ui/MobileTable";

function Requests() {
  const { lang } = useLanguage();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  // Bookings
  const bookingsLoading = useAppSelector(selectBookingLoading);
  const bookings = useAppSelector(selectOrgBookings);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all",
  );
  const debouncedSearchQuery = useDebouncedValue(searchTerm, 200);

  const { organizationId: activeOrgId, roleName: activeRole } = useAppSelector(
    selectActiveRoleContext,
  );

  const columns = getRequestColumns(lang, activeRole as Role["role"]);

  // Pagination
  const { totalPages, limit } = useAppSelector(selectBookingPagination);
  const [currentPage, setCurrentPage] = useState(1);
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
    if (!activeOrgId) return;
    void dispatch(
      getOrgBookings({
        org_id: activeOrgId,
        page: currentPage,
        limit,
        status: statusFilter,
        search: debouncedSearchQuery,
      }),
    );
  }, [currentPage, statusFilter, activeOrgId, debouncedSearchQuery]); //eslint-disable-line

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <h1 className="text-2xl md:text-xl mb-2">{t.requests.title[lang]}</h1>
        <p className="text-muted-foreground">{t.requests.description[lang]}</p>
      </div>
      <div className="flex flex-wrap gap-4 items-center relative mb-8">
        <div className="relative w-full md:w-fit">
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
            className="pl-10 pr-9 rounded-md w-full focus:outline-none focus:ring-0 focus:ring-secondary focus:border-secondary focus:bg-white md:max-w-[300px]"
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
        </div>

        <Select
          onValueChange={(value) => setStatusFilter(value as BookingStatus)}
        >
          <SelectTrigger aria-label={t.requests.aria.labels.filter[lang]}>
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
      {bookingsLoading && <Spinner containerClasses="mt-30" />}

      {isMobile ? (
        <MobileTable
          columns={columns}
          data={bookings}
          rowClick={(row) => navigate(`/admin/requests/${row.original.id}`)}
          pageIndex={currentPage - 1}
          pageCount={totalPages}
          onPageChange={(page) => handlePageChange(page + 1)}
        />
      ) : (
        <PaginatedDataTable
          columns={columns}
          data={bookings}
          pageIndex={currentPage - 1}
          pageCount={totalPages}
          onPageChange={(page) => handlePageChange(page + 1)}
          rowProps={(row) => ({
            style: { cursor: "pointer" },
            onClick: () => navigate(`/admin/requests/${row.original.id}`),
          })}
        />
      )}
    </div>
  );
}

export default Requests;
