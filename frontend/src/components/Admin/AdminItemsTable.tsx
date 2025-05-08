import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  checkItemDeletability,
  deleteItem,
  fetchAllItems,
  selectAllItems,
  selectItemsError,
  selectItemsLoading,
  updateItem,
} from "@/store/slices/itemsSlice";
import { PaginatedDataTable } from "../ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import AddItemModal from "./AddItemModal";
import { toast } from "sonner";
import UpdateItemModal from "./UpdateItemModal";
import { Switch } from "@/components/ui/switch";
import { selectAllTags } from "@/store/slices/tagSlice";
import { Item } from "@/types/item";
import AssignTagsModal from "./AssignTagsModal";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandGroup, CommandItem } from "../ui/command";
import { Checkbox } from "../ui/checkbox";
import { selectIsAdmin, selectIsSuperVera } from "@/store/slices/usersSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const AdminItemsTable = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const tags = useAppSelector(selectAllTags);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isSuperVera = useAppSelector(selectIsSuperVera);

  const [assignTagsModalOpen, setAssignTagsModalOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  // filtering states:
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCloseAssignTagsModal = () => {
    setAssignTagsModalOpen(false);
    setCurrentItemId(null);
  };

  const itemsColumns: ColumnDef<Item>[] = [
    // {
    //   header: 'Image',
    //   accessorKey: 'imageUrl',
    //   cell: ({ row }) => {
    //     const url = row.original.imageUrl || defaultImage;
    //     return (
    //       <img
    //         src={url}
    //         alt="Item"
    //         className="h-12 w-12 object-cover rounded-md"
    //         onError={(e) => {
    //           (e.target as HTMLImageElement).src = defaultImage;
    //         }}
    //       />
    //     );
    //   },
    // },
    {
      header: "Item Name (FI)",
      size: 150,
      accessorFn: (row) => row.translations.fi.item_name,
      sortingFn: "alphanumeric",
      enableSorting: true,
      cell: ({ row }) => row.original.translations.fi.item_name,
    },
    {
      header: "Item Type (FI)",
      size: 150,
      accessorFn: (row) => row.translations.fi.item_type,
      sortingFn: "alphanumeric",
      enableSorting: true,
      cell: ({ row }) => row.original.translations.fi.item_type,
    },
    // {
    //   header: 'Location',
    //   accessorKey: 'location',
    //   cell: ({ row }) => (
    //     <div className="flex items-center gap-1 text-sm text-muted-foreground">
    //       <Box className="h-4 w-4" />
    //       {row.original.location_id_name || 'N/A'}
    //     </div>
    //   ),
    // },
    {
      header: "Price",
      accessorKey: "price",
      cell: ({ row }) => `€${row.original.price.toLocaleString()}`,
    },
    {
      header: "Quantity",
      accessorFn: (row) => row.items_number_available,
      cell: ({ row }) => `${row.original.items_number_available} pcs`,
    },
    {
      id: "status",
      header: "Active",
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
            dispatch(fetchAllItems());
            toast.success(
              `Item ${checked ? "activated" : "deactivated"} successfully`,
            );
          } catch {
            toast.error("Failed to update item status");
          }
        };

        return (
          <Switch checked={item.is_active} onCheckedChange={handleToggle} />
        );
      },
    },
    // {
    //   id: "tags",
    //   header: "Tags",
    //   cell: ({ row }) => {
    //     // Deduplicate tags by ID to prevent React key warnings
    //     const tags = row.original.storage_item_tags ?? [];
    //     const uniqueTags = Array.from(
    //       new Map(tags.map((tag) => [tag.id, tag])).values(),
    //     );

    //     return (
    //       <div className="flex flex-wrap gap-1">
    //         {uniqueTags.map((tag) => (
    //           <span
    //             key={tag.id}
    //             className="text-xs rounded px-2 py-1 text-secondary"
    //           >
    //             {tag.translations?.fi?.name ||
    //               tag.translations?.en?.name ||
    //               "Unnamed"}
    //           </span>
    //         ))}
    //       </div>
    //     );
    //   },
    // },
    {
      id: "actions",
      size: 30,
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const targetUser = row.original;
        const canEdit = isSuperVera || isAdmin;
        const canDelete = isSuperVera || isAdmin;
        const isDeletable = useAppSelector(
          (state) => state.items.deletableItems[targetUser.id] !== false,
        );

        return (
          <div className="flex gap-2">
            {canEdit && (
              <Button
                className="editBtn"
                size="sm"
                onClick={() => handleEdit(targetUser)}
              >
                <Edit size={10} className="mr-1" /> Edit
              </Button>
            )}
            {canDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        className="deleteBtn"
                        size="sm"
                        // variant="destructive"
                        onClick={() => handleDelete(targetUser.id)}
                        disabled={!isDeletable}
                        aria-label={`Delete ${targetUser.translations.fi.item_name}`}
                      >
                        <Trash2 size={10} className="mr-1" /> Delete
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!isDeletable && (
                    <TooltipContent
                      side="top"
                      className="90 text-white border-0 p-2"
                    >
                      <p>Can't delete, it has existing bookings</p>
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

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchAllItems());
    }
  }, [dispatch, items.length]);

  const handleEdit = (item: Item) => {
    setSelectedItem(item); // Set the selected item
    setShowModal(true); // Show the modal
  };

  const deletableItems = useAppSelector((state) => state.items.deletableItems);

  useEffect(() => {
    const newItemIds = items
      .filter(
        (item) =>
          !Object.prototype.hasOwnProperty.call(deletableItems, item.id),
      )
      .map((item) => item.id);

    if (newItemIds.length > 0) {
      newItemIds.forEach((id) => dispatch(checkItemDeletability(id)));
    }
  }, [dispatch, items, deletableItems]);

  const handleDelete = async (id: string) => {
    toast.custom((t) => (
      <Card className="w-[360px] shadow-lg border">
        <CardHeader>
          <CardTitle className="text-lg">Confirm Deletion</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this item?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => toast.dismiss(t)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                toast.dismiss(t); // close the confirm toast
                try {
                  await toast.promise(dispatch(deleteItem(id)).unwrap(), {
                    loading: "Deleting item...",
                    success: "Item has been successfully deleted.",
                    error: "Failed to delete item.",
                  });
                  dispatch(fetchAllItems());
                } catch {
                  toast.error("Error deleting item.");
                }
              }}
            >
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    ));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null); // Reset selected item
  };

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchAllItems());
    }
  }, [dispatch, items.length]);

  useEffect(() => {
    if (selectedItem) {
      dispatch(fetchAllItems());
    }
  }, [selectedItem, dispatch]);

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

  const filteredItems = items
    .filter((item) => {
      if (statusFilter === "active") return item.is_active;
      if (statusFilter === "inactive") return !item.is_active;
      return true;
    })
    .filter((item) => {
      const name = item.translations.fi.item_name.toLowerCase();
      const type = item.translations.fi.item_type.toLowerCase();
      return (
        name.includes(searchTerm.toLowerCase()) ||
        type.includes(searchTerm.toLowerCase())
      );
    })
    .filter((item) => {
      if (tagFilter.length === 0) return true;
      const itemTagIds = (item.storage_item_tags ?? []).map((t) => t.id);
      return tagFilter.every((tag) => itemTagIds.includes(tag));
    });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl">Manage Storage Items</h1>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          {/* Search by item name/type */}
          <input
            type="text"
            size={50}
            className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            placeholder="Search by name or type"
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
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Filter by tags */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="px-3 py-1 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
                size={"sm"}
              >
                {tagFilter.length > 0
                  ? `Filtered by ${tagFilter.length} tag${
                      tagFilter.length > 1 ? "s" : ""
                    }`
                  : "Filter by tags"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandGroup>
                  {tags.map((tag) => {
                    const label =
                      tag.translations?.fi?.name?.toLowerCase() ||
                      tag.translations?.en?.name?.toLowerCase() ||
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
                          onCheckedChange={() =>
                            setTagFilter((prev) =>
                              prev.includes(tag.id)
                                ? prev.filter((t) => t !== tag.id)
                                : [...prev, tag.id],
                            )
                          }
                          className={cn(
                            "mr-2 h-4 w-4 border border-secondary bg-white text-white",
                            "data-[state=checked]:bg-secondary",
                            "data-[state=checked]:text-white",
                          )}
                        />
                        <span>{label}</span>
                      </CommandItem>
                    );
                  })}
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
              Clear Filters
            </Button>
          )}
        </div>
        {/* Add New Item button */}
        <div className="flex gap-4 justify-end">
          <AddItemModal>
            <Button className="addBtn" size={"sm"}>
              Add New Item
            </Button>
          </AddItemModal>
        </div>
      </div>

      <PaginatedDataTable columns={itemsColumns} data={filteredItems} />

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
