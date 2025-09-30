import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrganizations,
  selectOrganizations,
  selectOrganizationLoading,
  updateOrganization,
} from "@/store/slices/organizationSlice";
import { OrganizationDetails } from "@/types/organization";
import { Building2, LoaderCircle, Plus } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "date-fns";

const Organizations = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const organizations = useAppSelector(selectOrganizations);
  const loading = useAppSelector(selectOrganizationLoading);
  const totalPages = useAppSelector((state) => state.organizations.totalPages);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Fetch organizations on mount & page change
  useEffect(() => {
    void dispatch(fetchAllOrganizations({ page: currentPage, limit }));
  }, [dispatch, currentPage]);

  const openDetailsPage = (org: OrganizationDetails) => {
    void navigate(`/admin/organizations/${org.id}`);
  };

  const openCreatePage = () => {
    void navigate("/admin/organizations/create");
  };

  // Handle toggle active/inactive
  const handleToggle = (id: string, checked: boolean) => {
    // Find the organization to check if it's protected
    const org = organizations.find((o) => o.id === id);
    const isProtected = org?.name === "Global" || org?.name === "High council";

    if (isProtected) return;

    toastConfirm({
      title: checked
        ? t.organizationDetailsPage.confirmation.statusChange.activateTitle[
            lang
          ]
        : t.organizationDetailsPage.confirmation.statusChange.deactivateTitle[
            lang
          ],
      description: checked
        ? t.organizationDetailsPage.confirmation.statusChange
            .activateDescription[lang]
        : t.organizationDetailsPage.confirmation.statusChange
            .deactivateDescription[lang],
      confirmText:
        t.organizationDetailsPage.confirmation.statusChange.confirm[lang],
      cancelText:
        t.organizationDetailsPage.confirmation.statusChange.cancel[lang],
      onConfirm: async () => {
        try {
          await dispatch(
            updateOrganization({ id, data: { is_active: checked } }),
          ).unwrap();
          toast.success(
            checked
              ? t.organizationDetailsPage.toasts.activateSuccess[lang]
              : t.organizationDetailsPage.toasts.deactivateSuccess[lang],
          );
        } catch {
          toast.error(t.organizationDetailsPage.toasts.statusUpdateError[lang]);
        }
      },
      onCancel: () => {},
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
  };

  const columns: ColumnDef<OrganizationDetails>[] = [
    {
      header: t.organizations.columns.logo[lang],
      cell: ({ row }) => (
        <div className="flex justify-start">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={row.original.logo_picture_url ?? undefined}
              alt={`${row.original.name} logo`}
            />
            <AvatarFallback>
              <Building2 className="h-5 w-5 text-gray-400" />
            </AvatarFallback>
          </Avatar>
        </div>
      ),
    },
    {
      header: t.organizations.columns.name[lang],
      accessorKey: "name",
      cell: ({ row }) => (
        <button
          className="text-primary hover:underline font-medium text-left"
          onClick={() => openDetailsPage(row.original)}
        >
          {row.original.name}
        </button>
      ),
      size: 200,
    },
    {
      header: t.organizations.columns.slug[lang],
      accessorKey: "slug",
    },
    {
      header: t.organizations.columns.description[lang],
      accessorKey: "description",
      cell: ({ row }) => (
        <div className="max-w-xs break-words whitespace-normal">
          {row.original.description || "—"}
        </div>
      ),
    },
    {
      header: t.organizations.columns.isActive[lang],
      accessorKey: "is_active",
      cell: ({ row }) => {
        const isProtected =
          row.original.name === "Global" ||
          row.original.name === "High council";
        return (
          <Switch
            checked={row.original.is_active}
            onCheckedChange={(checked) =>
              handleToggle(row.original.id, checked)
            }
            disabled={isProtected}
          />
        );
      },
    },
    {
      header: t.organizations.columns.createdAt[lang],
      accessorKey: "created_at",
      cell: ({ row }) =>
        row.original.created_at
          ? formatDate(new Date(row.original.created_at), "d MMM yyyy")
          : "—",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl">{t.organizations.title[lang]}</h1>

        {/* Add New Org button */}
        <div className="flex gap-4 justify-end">
          <Button
            onClick={openCreatePage}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus aria-hidden />
            {t.organizations.createButton[lang]}
          </Button>
        </div>
      </div>

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
          rowProps={(row) => ({
            onClick: () => openDetailsPage(row.original),
            className: "cursor-pointer hover:bg-muted/50",
          })}
        />
      )}
    </div>
  );
};

export default Organizations;
