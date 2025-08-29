import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, LoaderCircle } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { Tag, TagAssignmentFilter, TagWithUsage } from "@/types";
import {
  fetchFilteredTags,
  selectAllTags,
  selectError,
  selectTagsLoading,
  selectTagsPage,
  selectTagsTotalPages,
  updateTag,
} from "@/store/slices/tagSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
// import { fetchAllItems, selectAllItems } from "@/store/slices/itemsSlice";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import TagDelete from "@/components/Admin/Items/TagDelete";
import AddTagModal from "@/components/Admin/Items/AddTagModal";

const TagList = () => {
  const dispatch = useAppDispatch();
  const tags = useAppSelector(selectAllTags);
  // const items = useAppSelector(selectAllItems);
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

  // Edit modal state
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [editNameFi, setEditNameFi] = useState("");
  const [editNameEn, setEditNameEn] = useState("");

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

  // Fetch items once
  /*   useEffect(() => {
    if (items.length === 0) {
      void dispatch(fetchAllItems({ page: 1, limit: 10 }));
    }
  }, [dispatch, items.length]); */

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

  const handleEditClick = (tag: Tag) => {
    setEditTag(tag);
    setEditNameFi(tag.translations?.fi?.name || "");
    setEditNameEn(tag.translations?.en?.name || "");
  };

  const handleUpdate = async () => {
    if (!editTag) return;

    const updatedTag = {
      ...editTag,
      translations: {
        fi: { name: editNameFi },
        en: { name: editNameEn },
      },
    };

    try {
      await dispatch(
        updateTag({ id: editTag.id, tagData: updatedTag }),
      ).unwrap();
      toast.success(t.tagList.editModal.messages.success[lang]);
      // Refresh the current page
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
      setEditTag(null);
    } catch {
      toast.error(t.tagList.editModal.messages.error[lang]);
    }
  };

  const columns: ColumnDef<Tag>[] = [
    {
      header: t.tagList.columns.nameFi[lang],
      accessorFn: (row) => row.translations?.fi?.name ?? "—",
      cell: ({ row }) => row.original.translations?.fi?.name ?? "—",
      enableSorting: false,
    },
    {
      header: t.tagList.columns.nameEn[lang],
      accessorFn: (row) => row.translations?.en?.name ?? "—",
      cell: ({ row }) => row.original.translations?.en?.name ?? "—",
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
      header: t.tagList.columns.assigned[lang],
      id: "assigned",
      cell: ({ row }) => {
        const tag = row.original as TagWithUsage;
        const isUsed = tag.usageCount > 0;
        return isUsed ? (
          <span className="text-highlight2 font-medium">
            {t.tagList.assignment.yes[lang]}
          </span>
        ) : (
          <span className="text-red-400 font-medium">
            {t.tagList.assignment.no[lang]}
          </span>
        );
      },
      enableSorting: false,
    },
    {
      header: t.tagList.columns.assignedTo[lang],
      id: "assignedTo",
      accessorFn: (row) => (row as TagWithUsage).usageCount ?? 0,
      cell: ({ row }) => {
        const count = (row.original as TagWithUsage).usageCount ?? 0;
        return (
          <span className="text-sm">
            {t.tagList.assignment.count[lang].replace(
              "{count}",
              count.toString(),
            )}
          </span>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const tag = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleEditClick(tag)}
              title={t.tagList.buttons.edit[lang]}
              className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <TagDelete
              id={tag.id}
              onDeleted={() => {
                // Calculate if we need to go to previous page after deletion
                const isLastItemOnPage = (tags?.length ?? 0) === 1;
                const shouldGoToPreviousPage =
                  isLastItemOnPage && currentPage > 1;
                const targetPage = shouldGoToPreviousPage
                  ? currentPage - 1
                  : currentPage;

                // Update the current page if needed
                if (shouldGoToPreviousPage) {
                  setCurrentPage(targetPage);
                }

                void dispatch(
                  fetchFilteredTags({
                    page: targetPage,
                    limit: 10,
                    search: debouncedSearchTerm,
                    assignmentFilter,
                    sortBy,
                    sortOrder,
                  }),
                );
              }}
            />
          </div>
        );
      },
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
              <AddTagModal
                onCreated={() => {
                  // When a new tag is created, go to the first page to see it
                  // (especially important if filters are applied)
                  setCurrentPage(1);
                  void dispatch(
                    fetchFilteredTags({
                      page: 1,
                      limit: 10,
                      search: debouncedSearchTerm,
                      assignmentFilter,
                      sortBy,
                      sortOrder,
                    }),
                  );
                }}
              >
                <Button variant="outline" size={"sm"}>
                  {t.tagList.buttons.add[lang]}
                </Button>
              </AddTagModal>
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
          />

          {/* Edit Modal */}
          {editTag && (
            <Dialog open onOpenChange={() => setEditTag(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t.tagList.editModal.title[lang]}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-sm font-medium">
                      {t.tagList.editModal.labels.fiName[lang]}
                    </label>
                    <Input
                      value={editNameFi}
                      onChange={(e) => setEditNameFi(e.target.value)}
                      placeholder={
                        t.tagList.editModal.placeholders.fiName[lang]
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {t.tagList.editModal.labels.enName[lang]}
                    </label>
                    <Input
                      value={editNameEn}
                      onChange={(e) => setEditNameEn(e.target.value)}
                      placeholder={
                        t.tagList.editModal.placeholders.enName[lang]
                      }
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    size={"sm"}
                    className="px-3 py-0 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
                    onClick={handleUpdate}
                  >
                    {t.tagList.editModal.buttons.save[lang]}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
};

export default TagList;
