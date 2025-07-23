import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrganizations,
  fetchOrganizationById,
  selectOrganizations,
  selectOrganizationLoading,
  selectOrganizationError,
  updateOrganization,
} from "@/store/slices/organizationSlice";
import { OrganizationDetails } from "@/types/organization";
import { LoaderCircle } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const OrganizationList = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const organizations = useAppSelector(selectOrganizations);
  const loading = useAppSelector(selectOrganizationLoading);
  const error = useAppSelector(selectOrganizationError);
  const totalPages = useAppSelector((state) => state.organizations.totalPages);

  // State for modal and selected organization
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDetails | null>(
    null,
  );

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

  const openDetailsModal = async (org: OrganizationDetails) => {
    await dispatch(fetchOrganizationById(org.id));
    setSelectedOrg(org);
    setShowDetailsModal(true);
  };

  // set to active and inactive
  const handleToggle = async (id: string, checked: boolean) => {
    try {
      await dispatch(
        updateOrganization({ id, data: { is_active: checked } }),
      ).unwrap();
      toast.success(
        checked
          ? t.adminItemsTable.messages.toast.activateSuccess[lang]
          : t.adminItemsTable.messages.toast.deactivateSuccess[lang],
      );
    } catch {
      toast.error(t.adminItemsTable.messages.toast.statusUpdateFail[lang]);
    }
  };

  const columns: ColumnDef<OrganizationDetails>[] = [
    {
      header: t.organizationList.columns.name[lang],
      accessorKey: "name",
      cell: ({ row }) => (
        <button
          className="text-primary underline"
          onClick={() => openDetailsModal(row.original)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      header: t.organizationList.columns.slug[lang],
      accessorKey: "slug",
    },
    {
      header: t.organizationList.columns.description[lang],
      accessorKey: "description",
    },
    {
      header: t.organizationList.columns.isActive[lang],
      accessorKey: "is_active",
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_active}
          onCheckedChange={(checked) => handleToggle(row.original.id, checked)}
        />
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
