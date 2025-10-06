import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ListFilter, Plus, Search, X } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { TagAssignmentFilter } from "@/types";
import { ExtendedTag } from "@common/items/tag.types";
import {
  fetchFilteredTags,
  selectAllTags,
  selectError,
  selectTagsLoading,
  selectTagsPage,
  selectTagsTotalPages,
  selectTag,
} from "@/store/slices/tagSlice";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import Spinner from "@/components/Spinner";
import MobileTable from "@/components/ui/MobileTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TagList = () => {
  const { isMobile } = useIsMobile();
  const dispatch = useAppDispatch();
  const tags = useAppSelector(selectAllTags);
  const loading = useAppSelector(selectTagsLoading);
  const error = useAppSelector(selectError);
  const page = useAppSelector(selectTagsPage);
  const totalPages = useAppSelector(selectTagsTotalPages);
  // State for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentFilter, setAssignmentFilter] =
    useState<TagAssignmentFilter>("all");
  const [currentPage, setCurrentPage] = useState(page);
  // State for sorting (backend)
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // State for sorting (UI table)
  const [order, setOrder] = useState("created_at");
  const [ascending, setAscending] = useState<boolean | null>(false);
  // Debounced search term
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  // Translation
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const SORT_BY = [
    { label: t.tagList.sorting.recentlyCreated, value: "created_at" },
    { label: t.tagList.sorting.assignmentCount, value: "assigned_to" },
    { label: t.tagList.sorting.popularity, value: "popularity_rank" },
  ];
  const SORT_ORDERS = [
    { label: t.common.filters.ascending, value: "asc" },
    { label: t.common.filters.descending, value: "desc" },
  ];

  // Fetch tags when search term or assignment filter changes
  useEffect(() => {
    void dispatch(
      fetchFilteredTags({
        page: currentPage,
        limit: 10,
        search: debouncedSearchTerm,
        assignmentFilter,
        sortBy,
        sortOrder,
      }),
    );
  }, [
    dispatch,
    currentPage,
    debouncedSearchTerm,
    assignmentFilter,
    sortBy,
    sortOrder,
  ]);

  // Reset page when search term or assignment filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, assignmentFilter, sortBy, sortOrder]);

  // When redux page changes, sync local page
  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // Sorting handlers
  const handleOrder = (newOrder: string) => {
    setOrder(newOrder);
    setSortBy(newOrder);
  };

  const handleAscending = (newAscending: boolean | null) => {
    setAscending(newAscending);
    if (newAscending === null) {
      setSortOrder("desc"); // default sort order
    } else if (newAscending) {
      setSortOrder("asc");
    } else {
      setSortOrder("desc");
    }
  };

  const columns: ColumnDef<ExtendedTag>[] = [
    {
      header: t.tagList.columns.name[lang],
      accessorFn: (row) => row.translations?.[lang]?.name ?? "—",
      cell: ({ row }) => row.original.translations?.[lang].name ?? "—",
      enableSorting: false,
    },
    {
      header: t.tagList.columns.createdAt[lang],
      id: "created_at",
      accessorKey: "created_at",
      cell: ({ row }) =>
        row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : "—",
      enableSorting: true,
    },
    {
      header: t.tagList.columns.assignedTo[lang],
      id: "assigned_to",
      cell: ({ row }) => {
        const count = row.original.assigned_to;
        const countStr = String(count ?? 0);
        return (
          <span className="text-sm">
            {t.tagList.assignment.count[lang].replace("{count}", countStr)}
          </span>
        );
      },
      enableSorting: false,
    },
    {
      id: "popularity_rank",
      header: "Popularity",
      cell: ({ row }) => {
        const rank = row.original.popularity_rank;
        return rank ? (
          <Badge
            variant="outline"
            className={`bg-green-${rank === "very popular" ? "100" : "50"} text-green-800 border-green-300`}
          >
            {rank}
          </Badge>
        ) : (
          "---"
        );
      },
      enableSorting: false,
    },
  ];

  if (error) {
    return <div className="p-4 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Loading state */}
      {loading ? (
        <Spinner containerClasses="my-20" />
      ) : (
        <>
          {/* Header and actions */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-xl">{t.tagList.title[lang]}</h1>
          </div>

          {/* Filters  and searc */}
          <div className="flex justify-between items-center mb-4 gap-4 flex-wrap w-full">
            <div className="flex justify-start gap-4 flex-wrap md:flex-nowrap">
              <div className="relative w-full sm:max-w-xs rounded-md bg-white min-w-[250px]">
                <Search
                  aria-hidden
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4"
                />
                <Input
                  placeholder={t.tagList.filters.search[lang]}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape" && searchTerm) {
                      setSearchTerm("");
                    }
                  }}
                  className="pl-10 pr-9 rounded-md w-full focus:outline-none focus:ring-0 focus:ring-secondary focus:border-secondary focus:bg-white"
                />
                {searchTerm && (
                  <button
                    aria-label={t.tagList.aria.labels.clearSearch[lang]}
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-4 items-center flex-wrap">
                <Select
                  aria-label={t.tagList.aria.labels.filterAssigned[lang]}
                  value={assignmentFilter}
                  onValueChange={(val) =>
                    setAssignmentFilter(val as TagAssignmentFilter)
                  }
                >
                  <SelectTrigger>
                    <SelectValue>
                      {t.tagList.filters.assignment[assignmentFilter][lang]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {["all", "assigned", "unassigned"].map((opt) => (
                      <SelectItem value={opt} key={`select-assigned-${opt}`}>
                        {
                          t.tagList.filters.assignment[
                            opt as keyof typeof t.tagList.filters.assignment
                          ][lang]
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isMobile && (
                  <>
                    <Select
                      onValueChange={(val) => setSortBy(val)}
                      value={sortBy}
                    >
                      <SelectTrigger>
                        <ListFilter />
                        <SelectValue
                          placeholder={t.common.filters.sortOrder[lang]}
                        >
                          {SORT_BY.find((o) => o.value === sortBy)?.label[
                            lang
                          ] || t.common.filters.sortOrder[lang]}
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
                      onValueChange={(val) => setSortOrder(val as "asc")}
                      value={order}
                    >
                      <SelectTrigger>
                        <ArrowUpDown />
                        <SelectValue
                          placeholder={t.common.filters.sortOrder[lang]}
                        >
                          {
                            SORT_ORDERS.find((o) => o.value === sortOrder)
                              ?.label[lang]
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_ORDERS.map((order) => {
                          const { value, label } = order;
                          return (
                            <SelectItem
                              key={`sort-order-${value}`}
                              value={value}
                            >
                              {label[lang]}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </>
                )}

                {(searchTerm || assignmentFilter !== "all") && (
                  <Button
                    size={"sm"}
                    onClick={() => {
                      setSearchTerm("");
                      setAssignmentFilter("all");
                    }}
                    className="text-secondary border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
                  >
                    {t.tagList.filters.clear[lang]}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                size={"sm"}
                onClick={() => {
                  void dispatch(fetchFilteredTags({ page: 1, limit: 10 }));
                  void navigate("/admin/tags/new");
                }}
              >
                <Plus aria-hidden className="mr-1" />
                {t.tagList.buttons.add[lang]}
              </Button>
            </div>
          </div>

          {/* Table */}
          {isMobile ? (
            <MobileTable
              columns={columns}
              data={tags || []}
              rowClick={(row) => {
                void dispatch(selectTag(row.original));
                void navigate(`/admin/tags/${row.original.id}`);
              }}
              pageIndex={currentPage - 1}
              pageCount={totalPages}
              onPageChange={(page) => handlePageChange(page + 1)}
            />
          ) : (
            <PaginatedDataTable
              columns={columns}
              data={tags || []}
              pageIndex={currentPage - 1}
              pageCount={totalPages}
              onPageChange={(page) => handlePageChange(page + 1)}
              order={order}
              ascending={ascending}
              handleOrder={handleOrder}
              handleAscending={handleAscending}
              originalSorting="created_at"
              rowProps={(row) => ({
                style: { cursor: "pointer" },
                onClick: () => {
                  void dispatch(selectTag(row.original));
                  void navigate(`/admin/tags/${row.original.id}`);
                },
              })}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TagList;
