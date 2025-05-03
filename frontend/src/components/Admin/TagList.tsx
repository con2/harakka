import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, LoaderCircle } from "lucide-react";
import { PaginatedDataTable } from "../ui/data-table-paginated";
import { Tag } from "@/types";
import {
  fetchAllTags,
  selectAllTags,
  selectError,
  selectLoading,
  updateTag,
} from "@/store/slices/tagSlice";
import AddTagModal from "./AddTagModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { toast } from "sonner";
import TagDelete from "./TagDelete";
import { fetchAllItems, selectAllItems } from "@/store/slices/itemsSlice";

const TagList = () => {
  const dispatch = useAppDispatch();
  const tags = useAppSelector(selectAllTags);
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<
    "all" | "assigned" | "unassigned"
  >("all");

  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [editNameFi, setEditNameFi] = useState("");
  const [editNameEn, setEditNameEn] = useState("");

  const tagUsage: Record<string, number> = {};
  items.forEach((item) => {
    (item.storage_item_tags || []).forEach((tag) => {
      tagUsage[tag.id] = (tagUsage[tag.id] || 0) + 1;
    });
  });

  const filteredTags = tags
    .filter((tag) => {
      const fiName = tag.translations?.fi?.name?.toLowerCase() || "";
      const enName = tag.translations?.en?.name?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      return fiName.includes(search) || enName.includes(search);
    })
    .filter((tag) => {
      const isAssigned = !!tagUsage[tag.id];
      if (assignmentFilter === "assigned") return isAssigned;
      if (assignmentFilter === "unassigned") return !isAssigned;
      return true;
    });

  // Fetch tags on mount
  useEffect(() => {
    dispatch(fetchAllTags());
  }, [dispatch]);

  // Fetch items once tags are available
  useEffect(() => {
    if (tags.length > 0 && items.length === 0) {
      dispatch(fetchAllItems());
    }
  }, [dispatch, tags, items.length]);

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
      toast.success("Tag updated successfully");
      dispatch(fetchAllTags());
      setEditTag(null);
    } catch {
      toast.error("Failed to update tag");
    }
  };

  const columns: ColumnDef<Tag>[] = [
    {
      header: "Tag Name (FI)",
      accessorFn: (row) => row.translations?.fi?.name ?? "—",
      cell: ({ row }) => row.original.translations?.fi?.name ?? "—",
    },
    {
      header: "Tag Name (EN)",
      accessorFn: (row) => row.translations?.en?.name ?? "—",
      cell: ({ row }) => row.original.translations?.en?.name ?? "—",
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      header: "Assigned",
      id: "assigned",
      cell: ({ row }) => {
        const tag = row.original;
        const isUsed = !!tagUsage[tag.id];
        return isUsed ? (
          <span className="text-highlight2 font-medium">Yes</span>
        ) : (
          <span className="text-red-400 font-medium">No</span>
        );
      },
    },
    {
      header: "Assigned To",
      id: "assignedTo",
      accessorFn: (row) => tagUsage[row.id] || 0,
      cell: ({ row }) => {
        const count = tagUsage[row.original.id] || 0;
        return <span className="text-sm">{count} items</span>;
      },
      sortingFn: "basic",
      enableSorting: true,
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
              className="editBtn"
            >
              <Edit size={10} className="mr-1" /> Edit
            </Button>
            <TagDelete
              id={tag.id}
              onDeleted={() => {
                dispatch(fetchAllTags());
              }}
            />
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
            <h1 className="text-xl">Manage Tags</h1>
          </div>

          {/* Filters */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                size={50}
                className="w-full sm:max-w-sm text-sm p-2 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
                placeholder="Search by name (FI or EN)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                value={assignmentFilter}
                onChange={(e) =>
                  setAssignmentFilter(
                    e.target.value as "all" | "assigned" | "unassigned",
                  )
                }
                className="text-sm p-2 rounded-md border bg-white focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
              >
                <option value="all">All</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
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
                  Clear Filters
                </Button>
              )}
            </div>
          <div className="flex gap-4">
            <AddTagModal>
                <Button className="addBtn" size={"sm"}>
                  Add New Tag
                </Button>
              </AddTagModal>
          </div>
          </div>

          {/* Table */}
          <PaginatedDataTable columns={columns} data={filteredTags} />

          {/* Edit Modal */}
          {editTag && (
            <Dialog open onOpenChange={() => setEditTag(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Tag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-sm font-medium">Finnish Name</label>
                    <Input
                      value={editNameFi}
                      onChange={(e) => setEditNameFi(e.target.value)}
                      placeholder="Tag name in Finnish"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">English Name</label>
                    <Input
                      value={editNameEn}
                      onChange={(e) => setEditNameEn(e.target.value)}
                      placeholder="Tag name in English"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  {/* <Button size={"sm"} className="" onClick={() => setEditTag(null)}>
                    Cancel
                  </Button> */}
                  <Button size={"sm"} className="px-3 py-0 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl" onClick={handleUpdate}>Save Changes</Button>
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
