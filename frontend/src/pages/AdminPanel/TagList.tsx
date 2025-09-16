import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle, Plus } from "lucide-react";
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

const TagList = () => {
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
        ) : null;
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
        <div className="flex justify-center p-8">
          <LoaderCircle className="animate-spin text-muted" />
        </div>
      ) : (
        <>
          {/* Header and actions */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl">{t.tagList.title[lang]}</h1>
          </div>

          {/* Filters */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                size={50}
                className="w-full sm:max-w-sm text-sm p-2 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
                placeholder={t.tagList.filters.search[lang]}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                value={assignmentFilter}
                onChange={(e) =>
                  setAssignmentFilter(e.target.value as TagAssignmentFilter)
                }
                className="text-sm p-2 rounded-md border bg-white focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
              >
                <option value="all">
                  {t.tagList.filters.assignment.all[lang]}
                </option>
                <option value="assigned">
                  {t.tagList.filters.assignment.assigned[lang]}
                </option>
                <option value="unassigned">
                  {t.tagList.filters.assignment.unassigned[lang]}
                </option>
              </select>

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
            <div className="flex gap-4">
              <Button
                variant="outline"
                size={"sm"}
                onClick={() => {
                  void dispatch(fetchFilteredTags({ page: 1, limit: 10 }));
                  void navigate("/admin/tags/new");
                }}
              >
                <Plus className="mr-1" />
                {t.tagList.buttons.add[lang]}
              </Button>
            </div>
          </div>

          {/* Table */}
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
        </>
      )}
    </div>
  );
};

export default TagList;
