import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { useLanguage } from "@/context/LanguageContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteCategory,
  fetchAllCategories,
  selectCategories,
  selectCategoriesError,
  selectCategoriesLoading,
  selectCategoriesPagination,
  setSelectedCategory,
} from "@/store/slices/categoriesSlice";
import { Category } from "@common/items/categories";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ListFilter, Plus, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { t } from "@/translations";
import { toastConfirm } from "@/components/ui/toastConfirm";
import { Input } from "@/components/ui/input";
import MobileTable from "@/components/ui/MobileTable";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Categories() {
  const { width } = useIsMobile();
  const isMobile = width <= 600;
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const loading = useAppSelector(selectCategoriesLoading);
  const error = useAppSelector(selectCategoriesError);
  const { totalPages } = useAppSelector(selectCategoriesPagination);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [order, setOrder] = useState("");
  const [ascending, setAscending] = useState<boolean | null>(null);

  const handleAscending = (ascending: boolean | null) =>
    setAscending(ascending);
  const handleSortOrder = (order: string) => setOrder(order.toLowerCase());

  const handlePageChange = (newPage: number) => setCurrentPage(newPage);

  const handleDelete = async (id: string) => {
    await dispatch(deleteCategory(id));
    if (error) {
      return toast.error(t.categories.messages.delete.fail[lang]);
    }
    toast.success(t.categories.messages.delete.success[lang]);
    void dispatch(
      fetchAllCategories({
        page: currentPage,
        limit: 10,
        search: debouncedSearchTerm,
        order,
        ascending: ascending ? "asc" : "desc",
      }),
    );
  };

  useEffect(() => {
    void dispatch(
      fetchAllCategories({
        page: currentPage,
        limit: 10,
        search: debouncedSearchTerm,
        order,
        ascending: ascending ? "asc" : "desc",
      }),
    );
  }, [currentPage, dispatch, debouncedSearchTerm, order, ascending]);

  const SORT_BY = [
    { label: t.categories.table.name, value: "name" },
    { label: t.categories.table.assignedTo, value: "assigned_to" },
  ];
  const SORT_ORDERS = [
    { label: t.common.filters.ascending, value: true },
    { label: t.common.filters.descending, value: false },
  ];
  const categoryColumns: ColumnDef<Category>[] = [
    {
      id: "name",
      header: t.categories.table.name[lang],
      cell: ({ row }) => {
        const name = row.original.translations[lang];
        return name;
      },
    },
    {
      id: "assigned_to",
      header: t.categories.table.assignedTo[lang],
      cell: ({ row }) => {
        const count = row.original.assigned_to;
        return `${count} items`;
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="w-full flex justify-end pr-4">
          <span>{t.categories.table.actions[lang]}</span>
        </div>
      ),
      cell: ({ row }) => {
        const { id } = row.original;
        const category_name = row.original.translations[lang];
        return (
          // Delete category button
          <div className="text-right">
            <Button
              variant="destructive"
              className="w-fit p-2"
              aria-label={t.categories.aria.labels.deleteCategory[lang].replace(
                "{category_name}",
                category_name,
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toastConfirm({
                  title: t.categories.messages.delete.title[lang].replace(
                    "{category_name}",
                    category_name,
                  ),
                  confirmText: t.categories.messages.delete.confirmText[lang],
                  cancelText: t.categories.messages.delete.cancelText[lang],
                  onConfirm: () => handleDelete(id) as Promise<void>,
                });
              }}
            >
              <Trash aria-hidden />
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) return <Spinner />;

  return (
    <>
      <h1 className="text-xl mb-4">
        {t.categories.headings.manageCategories[lang]}
      </h1>

      <div className="flex flex-wrap md:justify-between items-center mb-4 gap-4">
        <div className="flex gap-4 items-center relative sm:max-w-xs min-w-[250px]">
          <Search
            aria-hidden
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4"
          />
          <Input
            type="text"
            size={50}
            className="w-full pl-10 sm:max-w-sm text-sm bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            placeholder={t.categories.placeholders.search[lang]}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isMobile && (
          <>
            <Select onValueChange={(val) => setOrder(val)} value={order}>
              <SelectTrigger>
                <ListFilter />
                <SelectValue placeholder={t.common.filters.sortBy[lang]}>
                  {SORT_BY.find((o) => o.value === order)?.label[lang] ||
                    t.common.filters.sortBy[lang]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SORT_BY.map((order) => {
                  const { value, label } = order;
                  return (
                    <SelectItem value={value} key={`sort-${value}`}>
                      {label[lang]}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(val) => setAscending(val === "true")}
              value={ascending ? "true" : "false"}
            >
              <SelectTrigger>
                <ArrowUpDown />
                <SelectValue placeholder={t.common.filters.sortOrder[lang]}>
                  {SORT_ORDERS.find((o) => o.value === ascending)?.label[lang]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SORT_ORDERS.map((order) => {
                  const { value, label } = order;
                  return (
                    <SelectItem
                      key={`sort-order-${value}`}
                      value={value.toString()}
                    >
                      {label[lang]}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </>
        )}
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => navigate("/admin/categories/new")}
        >
          <Plus />
          {t.categories.buttons.addNew[lang]}
        </Button>
      </div>

      {isMobile ? (
        <MobileTable
          columns={categoryColumns}
          data={categories}
          pageIndex={currentPage - 1}
          pageCount={totalPages}
          onPageChange={(page) => handlePageChange(page + 1)}
          rowClick={(row) => {
            void dispatch(setSelectedCategory(row.original));
            void navigate(`/admin/categories/${row.original.id}`);
          }}
        />
      ) : (
        <PaginatedDataTable
          columns={categoryColumns}
          data={categories}
          pageIndex={currentPage - 1}
          pageCount={totalPages}
          handleAscending={handleAscending}
          handleOrder={handleSortOrder}
          order={order}
          ascending={ascending}
          onPageChange={(page) => handlePageChange(page + 1)}
          rowProps={(row) => ({
            style: { cursor: "pointer" },
            onClick: () => {
              void dispatch(setSelectedCategory(row.original));
              void navigate(`/admin/categories/${row.original.id}`);
            },
          })}
        />
      )}
    </>
  );
}

export default Categories;
