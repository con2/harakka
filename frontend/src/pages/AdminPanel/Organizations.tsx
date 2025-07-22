import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrganizations,
  selectOrganizations,
  selectOrganizationLoading,
  selectOrganizationError,
} from "@/store/slices/organizationSlice";
import { OrganizationDetails } from "@/types/organization";
import { LoaderCircle } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "@/translations";

const OrganizationList = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const organizations = useAppSelector(selectOrganizations);
  const loading = useAppSelector(selectOrganizationLoading);
  const error = useAppSelector(selectOrganizationError);
  const totalPages = useAppSelector((state) => state.organizations.totalPages);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Initial fetch
  useEffect(() => {
    dispatch(fetchAllOrganizations({ page: currentPage, limit }));
  }, [dispatch, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
  };

  // Spalten für Tabelle
  const columns: ColumnDef<OrganizationDetails>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => row.original.name || "—",
    },
    {
      header: "Slug",
      accessorKey: "slug",
      cell: ({ row }) => row.original.slug || "—",
    },
    {
      header: "Beschreibung",
      accessorKey: "description",
      cell: ({ row }) => row.original.description || "—",
    },
    {
      header: "Aktiv",
      accessorKey: "is_active",
      cell: ({ row }) =>
        row.original.is_active ? (
          <span className="text-green-600 font-semibold">
            {t.organizationList.values.isActive.yes[lang]}
          </span>
        ) : (
          <span className="text-red-400 font-semibold">
            {t.organizationList.values.isActive.no[lang]}
          </span>
        ),
    },
    {
      header: "Erstellt am",
      accessorKey: "created_at",
      cell: ({ row }) =>
        row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : "—",
    },
  ];

  // Set language, e.g., from context, user settings, or default to "en"
  const lang: "en" | "fi" = "en";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">
        {t.organizationList.title[lang]}
      </h1>

      {error && <div className="text-destructive">{error}</div>}

      {loading ? (
        <div className="flex justify-center p-8">
          <LoaderCircle className="animate-spin text-muted" />
        </div>
      ) : (
        <PaginatedDataTable
          columns={columns}
          data={organizations}
          pageIndex={currentPage - 1}
          pageCount={totalPages}
          onPageChange={(page) => handlePageChange(page + 1)}
          originalSorting="created_at"
        />
      )}
    </div>
  );
};

export default OrganizationList;
