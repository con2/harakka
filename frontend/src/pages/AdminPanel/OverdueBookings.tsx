import { useEffect, useMemo, useState } from "react";
import { bookingsApi, OverdueBookingRow } from "@/api/services/bookings";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { LoaderCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OverdueBookings() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<OverdueBookingRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchData = async (p = 1) => {
    try {
      setLoading(true);
      const res = await bookingsApi.getOverdueBookings(p, 10);
      setRows(res.data as unknown as OverdueBookingRow[]);
      setTotalPages(res.metadata?.totalPages ?? 1);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData(page);
  }, [page]);

  const columns: ColumnDef<OverdueBookingRow>[] = useMemo(
    () => [
      {
        accessorKey: "booking_number",
        header: t.overdueBookings.columns.bookingNumber[lang],
      },
      {
        accessorKey: "full_name",
        header: t.overdueBookings.columns.customer[lang],
        cell: ({ row }) => (
          <div>
            <div>
              {row.original.full_name ?? t.overdueBookings.status.unknown[lang]}
            </div>
            <div className="text-xs text-gray-500">
              {row.original.user_email ?? "-"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "earliest_due_date",
        header: t.overdueBookings.columns.dueDate[lang],
        cell: ({ row }) => row.original.earliest_due_date,
      },
      {
        accessorKey: "days_overdue",
        header: t.overdueBookings.columns.daysOverdue[lang],
      },
    ],
    [lang],
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <LoaderCircle className="animate-spin h-5 w-5" />
        <span>{t.overdueBookings.loading[lang]}</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          {t.overdueBookings.title[lang]}
        </h1>
        <Button onClick={() => void fetchData(page)}>
          {t.overdueBookings.buttons.refresh[lang]}
        </Button>
      </div>

      <PaginatedDataTable
        columns={columns}
        data={rows}
        pageIndex={page - 1}
        pageCount={totalPages}
        onPageChange={(p) => setPage(p + 1)}
        rowProps={(row) => ({
          style: { cursor: "pointer" },
          onClick: () => navigate(`/admin/bookings/${row.original.booking_id}`),
        })}
      />
    </div>
  );
}
