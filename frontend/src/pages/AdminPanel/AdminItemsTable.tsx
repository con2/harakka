import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAllItems,
  selectItemsError,
  selectItemsPagination,
  selectItemsLoading,
  fetchAllAdminItems,
  updateItem,
} from "@/store/slices/itemsSlice";
import { fetchFilteredTags, selectAllTags } from "@/store/slices/tagSlice";
import { t } from "@/translations";
import { Item, ManageItemViewRow, ValidItemOrder } from "@/types/item";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, LoaderCircle, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation, useNavigate } from "react-router-dom";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";
import {
  fetchAllCategories,
  selectCategories,
} from "@/store/slices/categoriesSlice";
import { cn } from "@/lib/utils";

const AdminItemsTable = () => {
  const dispatch = useAppDispatch();
  const [redirectState, setRedirectState] = useState(
    useLocation()?.state || null,
  );
  const items = useAppSelector(selectAllItems);
  const error = useAppSelector(selectItemsError);
  const tags = useAppSelector(selectAllTags);
  const tagsLoading = useAppSelector((state) => state.tags.loading);
  const org_id = useAppSelector(selectActiveOrganizationId);
  const categories = useAppSelector(selectCategories);

  const { lang } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >(redirectState?.statusFilter ?? "all");
  const [tagFilter, setTagFilter] = useState<string[]>(
    redirectState?.tagFilter ?? [],
  );
  const [searchTerm, setSearchTerm] = useState(redirectState?.searchTerm ?? "");
  const debouncedSearchQuery = useDebouncedValue(searchTerm);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [order, setOrder] = useState<ValidItemOrder>(
    redirectState?.order ?? "created_at",
  );
  const [ascending, setAscending] = useState<boolean | null>(
    redirectState?.ascending ?? null,
  );
  const { totalPages } = useAppSelector(selectItemsPagination);
  const loading = useAppSelector(selectItemsLoading);
  const ITEMS_PER_PAGE = 10;

  /*-----------------------handlers-----------------------------------*/
  const handlePageChange = (newPage: number) => {
    if (redirectState) setRedirectState(null);
    setCurrentPage(newPage);
  };

  // Navigation: open item details page on row click
  const handleRowClick = (id: string) => {
    void navigate(`/admin/items/${id}`);
  };

  const handleSortOrder = (order: string) =>
    setOrder(order.toLowerCase() as ValidItemOrder);
  const handleAscending = (ascending: boolean | null) =>
    setAscending(ascending);

  /* ————————————————————— Side Effects ———————————————————————————— */
  useEffect(() => {
    if (!org_id) return;

    void dispatch(
      fetchAllAdminItems({
        ordered_by: order,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        searchquery: debouncedSearchQuery,
        ascending: ascending === false ? false : true,
        tag_filters: tagFilter,
        location_filter: [],
        category: "",
        activity_filter: statusFilter !== "all" ? statusFilter : undefined,
      }),
    );
  }, [
    dispatch,
    ascending,
    order,
    debouncedSearchQuery,
    currentPage,
    tagFilter,
    statusFilter,
    org_id,
  ]);

  //fetch tags list
  useEffect(() => {
    if (tags.length === 0)
      void dispatch(fetchFilteredTags({ limit: 20, sortBy: "assigned_to" }));
    if (categories.length === 0)
      void dispatch(fetchAllCategories({ page: 1, limit: 20 }));
  }, [dispatch, tags.length, items.length, categories.length]);

  /* ————————————————————————— Item Columns ———————————————————————— */
  const itemsColumns: ColumnDef<ManageItemViewRow>[] = [
    {
      id: "view",
      size: 5,
      cell: () => {
        return (
          <div className="flex space-x-1">
            <Button
              variant={"ghost"}
              size="sm"
              title={t.adminItemsTable.columns.viewDetails[lang]}
              className={cn("hover:text-slate-900 hover:bg-slate-300")}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      header: t.adminItemsTable.columns.name[lang],
      size: 120,
      id: `item_name`,
      accessorFn: (row) => row.translations[lang].item_name || "",
      sortingFn: "alphanumeric",
      cell: ({ row }) => {
        const name = row.original.translations[lang].item_name || "";
        return name.charAt(0).toUpperCase() + name.slice(1);
      },
    },
    {
      header: t.adminItemsTable.columns.category[lang],
      size: 120,
      id: `category_id`,
      accessorFn: (row) => row.category_id || "",
      sortingFn: "alphanumeric",
      cell: ({ row }) => {
        const cat =
          lang === "fi"
            ? row.original.category_fi_name
            : row.original.category_en_name;
        if (!cat) return "---";
        return cat;
      },
    },
    {
      header: t.adminItemsTable.columns.location[lang],
      size: 70,
      id: "location_name",
      accessorFn: (row) => row.location_name || "N/A",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm">
          {row.original.location_name || "N/A"}
        </div>
      ),
    },
    {
      header: t.adminItemsTable.columns.quantity[lang],
      size: 30,
      id: "quantity",
      accessorFn: (row) => row.quantity,
      cell: ({ row }) =>
        `${row.original.quantity} ${t.adminItemsTable.messages.units[lang]}`,
    },
    {
      id: "is_active",
      header: t.adminItemsTable.columns.active[lang],
      size: 30,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <Switch
            checked={item.is_active}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onCheckedChange={() => {
              void dispatch(
                updateItem({
                  item_id: item.id,
                  data: { is_active: !item.is_active },
                  orgId: org_id!,
                }),
              );
            }}
          />
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
          <div className="relative w-full sm:max-w-md bg-white rounded-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder={t.adminItemsTable.filters.searchPlaceholder[lang]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && searchTerm) setSearchTerm("");
              }}
              className="pl-10 pr-9 rounded-md w-full focus:outline-none focus:ring-0 focus:ring-secondary focus:border-secondary focus:bg-white"
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
          <Button
            className="addBtn"
            onClick={() => navigate("/admin/items/add")}
            size={"sm"}
          >
            {t.adminItemsTable.buttons.addNew[lang]}
          </Button>
        </div>
      </div>

      <PaginatedDataTable
        columns={itemsColumns}
        data={items as ManageItemViewRow[]}
        pageIndex={currentPage - 1}
        pageCount={totalPages}
        onPageChange={(page) => handlePageChange(page + 1)}
        handleAscending={handleAscending}
        handleOrder={handleSortOrder}
        order={order}
        ascending={ascending}
        originalSorting="quantity"
        highlight={redirectState?.highlight}
        rowProps={(row) => ({
          onClick: () =>
            handleRowClick(String((row.original as unknown as Item).id)),
          className: `cursor-pointer`,
        })}
      />
    </div>
  );
};

export default AdminItemsTable;
