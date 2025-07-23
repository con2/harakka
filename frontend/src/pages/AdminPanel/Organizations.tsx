import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrganizations,
  fetchOrganizationById,
  selectOrganizations,
  selectOrganizationLoading,
  selectOrganizationError,
  updateOrganization,
  createOrganization,
} from "@/store/slices/organizationSlice";
import { OrganizationDetails } from "@/types/organization";
import { Edit, Eye, LoaderCircle } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import OrganizationDelete from "@/components/Admin/Organizations/OrganizationDelete";

const OrganizationList = () => {
  const dispatch = useAppDispatch();

  // global state from Redux
  const organizations = useAppSelector(selectOrganizations);
  const loading = useAppSelector(selectOrganizationLoading);
  const error = useAppSelector(selectOrganizationError);
  const totalPages = useAppSelector((state) => state.organizations.totalPages);

  // local states
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDetails | null>(
    null,
  );
  const { lang } = useLanguage();
  const limit = 10;

  // schema for organization form
  const organizationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    slug: z.string().optional(),
  });

  type OrganizationFormValues = z.infer<typeof organizationSchema>;

  // react hook Form setup
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
    },
  });

  // ftch organizations on mount or page change
  useEffect(() => {
    void dispatch(fetchAllOrganizations({ page: currentPage, limit }));
  }, [dispatch, currentPage]);

  // handle pagination change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
  };

  // open modal for org details
  const openDetailsModal = async (org: OrganizationDetails) => {
    await dispatch(fetchOrganizationById(org.id));
    setSelectedOrg(org);
    setShowDetailsModal(true);
  };

  // open modal for editing
  const openEditModal = async (org: OrganizationDetails) => {
    await dispatch(fetchOrganizationById(org.id));
    setSelectedOrg(org);
    form.reset({
      name: org.name,
      description: org.description ?? "",
      slug: org.slug ?? "",
    });
    setShowDetailsModal(false);
    setIsCreateOpen(true);
  };

  // toggle active/inactive status
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

  // column definitions for PaginatedDataTable
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

  // handle form submit (create or update)
  const onSubmit = async (data: OrganizationFormValues) => {
    try {
      if (isCreateOpen) {
        const { name, description } = data;
        await dispatch(createOrganization({ name, description })).unwrap();
        toast.success(t.organizationList.toasts.created[lang]);
      } else if (selectedOrg) {
        await dispatch(
          updateOrganization({
            id: selectedOrg.id,
            data: { ...data, id: selectedOrg.id },
          }),
        ).unwrap();
        toast.success("Organization updated!");
      }

      setIsCreateOpen(false);
      form.reset();
      void dispatch(fetchAllOrganizations({ page: currentPage, limit }));
    } catch {
      toast.error("Failed to create organization.");
    }
  };

  // ------------------------render section--------------------------------
  return (
    <div className="space-y-4">
      {/* title */}
      <h1 className="text-xl font-semibold">
        {t.organizationList.title[lang]}
      </h1>

      {/* create Button & Modal */}
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="md">
              {t.organizationList.createButton[lang]}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.organizationList.modal.title[lang]}</DialogTitle>
            </DialogHeader>

            {/* create/Edit form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Name field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t.organizationList.modal.labels.name[lang]}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            t.organizationList.modal.placeholders.name[lang]
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* description field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t.organizationList.modal.labels.description[lang]}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            t.organizationList.modal.placeholders.description[
                              lang
                            ]
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* slug field */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t.organizationList.modal.labels.slug[lang]}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="my-org-slug" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* actions */}
                <DialogFooter className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    {t.common.cancel[lang]}
                  </Button>
                  <Button type="submit">{t.common.save[lang]}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* error / loader / table */}
      {error && <div className="text-destructive">{error}</div>}

      {loading ? (
        <div className="flex justify-center p-8">
          <LoaderCircle className="animate-spin text-muted" />
        </div>
      ) : (
        <PaginatedDataTable
          columns={[
            ...columns,
            {
              id: "actions",
              cell: ({ row }) => {
                const org = row.original;
                return (
                  <div className="flex gap-2">
                    {/* view */}
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedOrg(org);
                        setIsCreateOpen(false);
                        setShowDetailsModal(true);
                      }}
                      title={t.organizationList.view[lang]}
                      className="text-gray-500 hover:text-primary hover:bg-primary/10"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* edit */}
                    <Button
                      size="sm"
                      onClick={() => openEditModal(org)}
                      title={t.tagList.buttons.edit[lang]}
                      className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    {/* delete */}
                    <OrganizationDelete
                      id={org.id}
                      onDeleted={() => {
                        void dispatch(
                          fetchAllOrganizations({ page: currentPage, limit }),
                        );
                      }}
                    />
                  </div>
                );
              },
            },
          ]}
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
