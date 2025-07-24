import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteItem,
  fetchAllItems,
  fetchOrderedItems,
  getItemById,
  selectAllItems,
  selectItemsError,
  selectItemsPagination,
  selectItemsLoading,
  updateItem,
  selectSelectedItem,
} from "@/store/slices/itemsSlice";
import {
  fetchAllTags,
  fetchTagsForItem,
  selectAllTags,
} from "@/store/slices/tagSlice";
import { selectIsAdmin, selectIsSuperVera } from "@/store/slices/usersSlice";
import { t } from "@/translations";
import { Item, ValidItemOrder } from "@/types/item";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, LoaderCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import AddItemModal from "@/components/Admin/Items/AddItemModal";
import AssignTagsModal from "@/components/Admin/Items/AssignTagsModal";
import UpdateItemModal from "@/components/Admin/Items/UpdateItemModal";

const AdminItemsTable = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const error = useAppSelector(selectItemsError);
  const tags = useAppSelector(selectAllTags);
  const tagsLoading = useAppSelector((state) => state.tags.loading);
  const [showModal, setShowModal] = useState(false);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isSuperVera = useAppSelector(selectIsSuperVera);
  // Translation
  const { lang } = useLanguage();
  const [assignTagsModalOpen, setAssignTagsModalOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  // filtering states:
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchTerm);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [order, setOrder] = useState<ValidItemOrder>("created_at");
  const [ascending, setAscending] = useState<boolean | null>(null);
  const selectedItem = useAppSelector(selectSelectedItem);
  const { page, totalPages, limit } = useAppSelector(selectItemsPagination);

  /*-----------------------handlers-----------------------------------*/
  const handlePageChange = (newPage: number) => setCurrentPage(newPage);

  const handleEdit = (id: string) => {
    if (!selectedItem || id !== selectedItem.id) {
      void dispatch(getItemById(id));
      void dispatch(fetchTagsForItem(id));
    }
    setShowModal(true); // Show the modal
  };

  const handleDelete = (id: string) => {
    toastConfirm({
      title: t.adminItemsTable.messages.deletion.title[lang],
      description: t.adminItemsTable.messages.deletion.description[lang],
      confirmText: t.adminItemsTable.messages.deletion.confirm[lang],
      cancelText: t.adminItemsTable.messages.deletion.cancel[lang],
      onConfirm: () => {
        try {
          void toast.promise(dispatch(deleteItem(id)).unwrap(), {
            loading: t.adminItemsTable.messages.toast.deleting[lang],
            success: t.adminItemsTable.messages.toast.deleteSuccess[lang],
            error: t.adminItemsTable.messages.toast.deleteFail[lang],
          });
          void dispatch(fetchAllItems({ page: 1, limit: limit }));
        } catch {
          toast.error(t.adminItemsTable.messages.toast.deleteError[lang]);
        }
      },
      onCancel: () => {
        // Optional: handle cancel if needed
      },
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleBooking = (order: string) =>
    setOrder(order.toLowerCase() as ValidItemOrder);
  const handleAscending = (ascending: boolean | null) =>
    setAscending(ascending);

  const handleCloseAssignTagsModal = () => {
    setAssignTagsModalOpen(false);
    setCurrentItemId(null);
  };

  /* ————————————————————— Side Effects ———————————————————————————— */
  useEffect(() => {
    void dispatch(
      fetchOrderedItems({
        ordered_by: order,
        page: currentPage,
        limit: limit,
        searchquery: debouncedSearchQuery,
        ascending: ascending === false ? false : true,
        tag_filters: tagFilter,
        location_filter: [],
        categories: [],
        activity_filter: statusFilter !== "all" ? statusFilter : undefined,
      }),
    );
  }, [
    dispatch,
    ascending,
    order,
    debouncedSearchQuery,
    currentPage,
    limit,
    page,
    tagFilter,
    statusFilter,
  ]);

  //fetch tags list
  useEffect(() => {
    if (tags.length === 0) void dispatch(fetchAllTags({ limit: 20 }));
  }, [dispatch, tags.length, items.length]);

  const deletableItems = useAppSelector((state) => state.items.deletableItems);

  /* ————————————————————————— Item Columns ———————————————————————— */
  const itemsColumns: ColumnDef<Item>[] = [
    {
      header: t.adminItemsTable.columns.namefi[lang],
      size: 120,
      id: "fi_item_name",
      accessorFn: (row) => row.translations.fi.item_name,
      sortingFn: "alphanumeric",
      enableSorting: true,
      cell: ({ row }) => {
        const name = row.original.translations.fi.item_name || "";
        return name.charAt(0).toUpperCase() + name.slice(1);
      },
    },
    {
      header: t.adminItemsTable.columns.typefi[lang],
      size: 120,
      id: "fi_item_type",
      accessorFn: (row) => row.translations.en.item_type,
      sortingFn: "alphanumeric",
      enableSorting: true,
      cell: ({ row }) => {
        const type = row.original.translations.en.item_type || "";
        return type.charAt(0).toUpperCase() + type.slice(1);
      },
    },
    {
      header: t.adminItemsTable.columns.location[lang],
      size: 70,
      id: "location_name",
      accessorFn: (row) => row.location_name || "N/A", // For sorting
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm">
          {row.original.location_name || "N/A"}
        </div>
      ),
    },
    {
      header: t.adminItemsTable.columns.price[lang],
      accessorKey: "price",
      size: 30,
      cell: ({ row }) => `€${row.original.price.toLocaleString()}`,
    },
    {
      header: t.adminItemsTable.columns.quantity[lang], // TODO: add corr. header items total
      size: 30,
      id: "items_number_total",
      accessorFn: (row) => row.items_number_total,
      cell: ({ row }) =>
        `${row.original.items_number_total} ${t.adminItemsTable.messages.units[lang]}`,
    },
    {
      id: "is_active",
      header: t.adminItemsTable.columns.active[lang],
      size: 30,
      cell: ({ row }) => {
        const item = row.original;

        const handleToggle = async (checked: boolean) => {
          try {
            await dispatch(
              updateItem({
                id: item.id,
                data: {
                  is_active: checked,
                },
              }),
            ).unwrap();
            toast.success(
              checked
                ? t.adminItemsTable.messages.toast.activateSuccess[lang]
                : t.adminItemsTable.messages.toast.deactivateSuccess[lang],
            );
          } catch {
            toast.error(
              t.adminItemsTable.messages.toast.statusUpdateFail[lang],
            );
          }
        };

        return (
          <Switch checked={item.is_active} onCheckedChange={handleToggle} />
        );
      },
    },
    {
      id: "actions",
      size: 30,
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const item = row.original;
        const canEdit = isSuperVera || isAdmin;
        const canDelete = isSuperVera || isAdmin;
        const isDeletable = deletableItems[item.id] !== false;
        return (
          <div className="flex gap-2">
            {canEdit && (
              <Button
                size="sm"
                onClick={() => handleEdit(item.id)}
                className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        onClick={() => handleDelete(item.id)}
                        disabled={!isDeletable}
                        aria-label={`Delete ${item.translations.fi.item_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!isDeletable && (
                    <TooltipContent
                      side="top"
                      className="90 text-white border-0 p-2"
                    >
                      <p>{t.adminItemsTable.tooltips.cantDelete[lang]}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-destructive">{error}</div>;
  }

  /*————————————————————————————— Main Render —————————————————————————————*/
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl">{t.adminItemsTable.title[lang]}</h1>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          {/* Search by item name/type */}
          <input
            type="text"
            size={50}
            className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            placeholder={t.adminItemsTable.filters.searchPlaceholder[lang]}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filter by active status */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
            className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
          >
            <option value="all">
              {t.adminItemsTable.filters.status.all[lang]}
            </option>
            <option value="active">
              {t.adminItemsTable.filters.status.active[lang]}
            </option>
            <option value="inactive">
              {t.adminItemsTable.filters.status.inactive[lang]}
            </option>
          </select>

          {/* Filter by tags */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="px-3 py-1 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
                size={"sm"}
              >
                {tagFilter.length > 0
                  ? t.adminItemsTable.filters.tags.filtered[lang].replace(
                      "{count}",
                      tagFilter.length.toString(),
                    )
                  : t.adminItemsTable.filters.tags.filter[lang]}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandGroup>
                  {tagsLoading ? (
                    <div className="flex justify-center p-4">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    </div>
                  ) : tags.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      {t.adminItemsTable.filters.tags.noTags[lang] ||
                        "No tags found"}
                    </div>
                  ) : (
                    tags.map((tag) => {
                      const label =
                        tag.translations?.[lang]?.name?.toLowerCase() || // Try current language first
                        tag.translations?.[
                          lang === "fi" ? "en" : "fi"
                        ]?.name?.toLowerCase() || // Fall back to other language
                        t.adminItemsTable.filters.tags.unnamed[lang] ||
                        "Unnamed";

                      function cn(...classes: (string | undefined)[]): string {
                        return classes.filter(Boolean).join(" ");
                      }
                      return (
                        <CommandItem
                          key={tag.id}
                          onSelect={() =>
                            setTagFilter((prev) =>
                              prev.includes(tag.id)
                                ? prev.filter((t) => t !== tag.id)
                                : [...prev, tag.id],
                            )
                          }
                          className="cursor-pointer"
                        >
                          <Checkbox
                            checked={tagFilter.includes(tag.id)}
                            className={cn(
                              "mr-2 h-4 w-4 border border-secondary bg-white text-white",
                              "data-[state=checked]:bg-secondary",
                              "data-[state=checked]:text-white",
                              "relative",
                              "z-10",
                            )}
                          />
                          <span>{label}</span>
                        </CommandItem>
                      );
                    })
                  )}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Clear filters button */}
          {(searchTerm || statusFilter !== "all" || tagFilter.length > 0) && (
            <Button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTagFilter([]);
              }}
              size={"sm"}
              className="px-2 py-1 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
            >
              {t.adminItemsTable.filters.clear[lang]}
            </Button>
          )}
        </div>
        {/* Add New Item button */}
        <div className="flex gap-4 justify-end">
          <AddItemModal>
            <Button className="addBtn" size={"sm"}>
              {t.adminItemsTable.buttons.addNew[lang]}
            </Button>
          </AddItemModal>
        </div>
      </div>

      <PaginatedDataTable
        columns={itemsColumns}
        data={items}
        pageIndex={currentPage - 1}
        pageCount={totalPages}
        onPageChange={(page) => handlePageChange(page + 1)}
        handleAscending={handleAscending}
        handleBooking={handleBooking}
        booking={order}
        ascending={ascending}
        originalSorting="items_number_total"
      />

      {/* Show UpdateItemModal when showModal is true */}
      {showModal && selectedItem && (
        <UpdateItemModal
          onClose={handleCloseModal}
          initialData={selectedItem} // Pass the selected item data to the modal
        />
      )}
      {assignTagsModalOpen && currentItemId && (
        <AssignTagsModal
          open={assignTagsModalOpen}
          itemId={currentItemId}
          onClose={handleCloseAssignTagsModal}
        />
      )}
    </div>
  );
};

export default AdminItemsTable;
