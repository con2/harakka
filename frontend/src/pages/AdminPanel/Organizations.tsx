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
import { useLanguage } from "@/context/LanguageContext";

const OrganizationList = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const organizations = useAppSelector(selectOrganizations);
  const loading = useAppSelector(selectOrganizationLoading);
  const error = useAppSelector(selectOrganizationError);
  const totalPages = useAppSelector((state) => state.organizations.totalPages);

  // Translation
  const { lang } = useLanguage();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Initial fetch
  useEffect(() => {
    void dispatch(fetchAllOrganizations({ page: currentPage, limit }));
  }, [dispatch, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
  };

  // columns for table
  const columns: ColumnDef<OrganizationDetails>[] = [
    {
      header: t.organizationList.columns.name[lang],
      accessorKey: "name",
      cell: ({ row }) => row.original.name,
    },
    {
      header: t.organizationList.columns.slug[lang],
      accessorKey: "slug",
      cell: ({ row }) => row.original.slug,
    },
    {
      header: t.organizationList.columns.description[lang],
      accessorKey: "description",
      cell: ({ row }) => row.original.description,
    },
    {
      header: t.organizationList.columns.isActive[lang],
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
      header: t.organizationList.columns.createdAt[lang],
      accessorKey: "created_at",
      cell: ({ row }) =>
        row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : "—",
    },
  ];

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
