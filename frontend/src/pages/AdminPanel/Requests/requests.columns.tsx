import { Language } from "@/context/LanguageContext";
import { formatDate } from "date-fns";
import { t } from "@/translations";
import { ColumnDef } from "@tanstack/react-table";
import { BookingPreviewWithOrgData } from "@common/bookings/booking.types";
import { Role } from "@common/role.types";
import { StatusBadge } from "@/components/StatusBadge";

export const getRequestColumns: (
  lang: Language,
  activeRole: Role["role"],
) => ColumnDef<BookingPreviewWithOrgData>[] = (
  lang: Language,
  activeRole: Role["role"],
) => [
  {
    accessorKey: "booking_number",
    header: t.requests.table.headers.bookingNumber[lang],
  },
  {
    accessorKey: "full_name",
    header: t.requests.table.headers.madeBy[lang],
    cell: ({ row }: { row: { original: BookingPreviewWithOrgData } }) => {
      const { full_name, email } = row.original;
      return (
        <>
          <p>{full_name}</p>
          {activeRole === "tenant_admin" && (
            <p className="text-xs text-muted-foreground">{email}</p>
          )}
        </>
      );
    },
  },
  {
    accessorKey: "status",
    header: t.requests.table.headers.status[lang],
    cell: ({ row }: { row: { original: BookingPreviewWithOrgData } }) => {
      const { status } = row.original;
      return <StatusBadge status={status ?? "pending"} />;
    },
  },
  {
    accessorKey: "created_at",
    header: t.requests.table.headers.createdAt[lang],
    cell: ({ row }: { row: { original: BookingPreviewWithOrgData } }) => {
      return formatDate(row.original.created_at, "d MMM yyyy");
    },
  },
  {
    id: "actions",
    cell: () => <div className="text-sm" />,
  },
];
