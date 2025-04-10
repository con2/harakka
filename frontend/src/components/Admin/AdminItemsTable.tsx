import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteItem,
  fetchAllItems,
  getItemById,
  selectAllItems,
  selectItemsError,
  selectItemsLoading,
} from "@/store/slices/itemsSlice";
import { PaginatedDataTable } from "../ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { Box, LoaderCircle } from "lucide-react";
import { Button } from "../ui/button";
import AddItemModal from "./AddItemModal";
import { Item } from "@/types/item"; // Ensure you import the correct type
import { toast } from "sonner"; // Make sure you import toast from sonner

// Updated StorageItem type
interface StorageItem extends Item {
  id: string;
  location_id: string;
  compartment_id: string;
  items_number_total: number;
  items_number_available: number;
  price: number;
  is_active: boolean;
  translations: {
    fi: {
      item_name: string;
      item_description: string;
      item_type: string;
    };
    en: {
      item_name: string;
      item_description: string;
      item_type: string;
    };
  };
  average_rating?: number;
  created_at?: string;
  updated_at?: string;
}

const AdminItemsTable = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StorageItem | null>(null);

  const itemsColumns: ColumnDef<StorageItem>[] = [
    {
      header: "Item Name (fi)",
      accessorKey: "translations.fi.item_name",
      cell: ({ row }) => row.original.translations.fi.item_name,
    },
    {
      header: "Item Type (fi)",
      accessorKey: "translations.fi.item_type",
      cell: ({ row }) => row.original.translations.fi.item_type,
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: ({ row }) => `€${row.original.price.toLocaleString()}`,
    },
    {
      header: "Items Total",
      accessorKey: "items_number_total",
      cell: ({ row }) => row.original.items_number_total,
    },
    {
      header: "Items Available",
      accessorKey: "items_number_available",
      cell: ({ row }) => row.original.items_number_available,
    },
    // {
    //   header: "Location ID",
    //   accessorKey: "location_id",
    //   cell: ({ row }) => row.original.location_id,
    // },
    {
      header: "Average Rating",
      accessorKey: "average_rating",
      cell: ({ row }) => (row.original.average_rating ? row.original.average_rating : "N/A"),
    },
    {
      id: "edit",
      header: "Edit",
      cell: ({ row }) => (
        <Button
          className="bg-background rounded-2xl px-6 text-highlight2 border-highlight2 border-1 hover:text-background hover:bg-highlight2"
          onClick={() => handleEdit(row.original)}
        >
          Edit
        </Button>
      ),
    },
    {
      id: "delete",
      header: "Delete",
      cell: ({ row }) => (
        <Button
          className="bg-background rounded-2xl px-6 text-destructive border-destructive border hover:text-background"
          variant="destructive"
          onClick={() => handleDelete(row.original.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const handleEdit = (item: StorageItem) => {
    setSelectedItem(item); // Ensure selectedItem is of type StorageItem
    setShowModal(true);
    dispatch(getItemById(item.id)); // Fetch item by ID to populate form
  };

  const handleDelete = (id: string) => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-primary text-primary dark:text-white border border-zinc-200 dark:border-primary rounded-xl p-4 w-[360px] shadow-lg flex flex-col gap-3">
        <div className="font-semibold text-lg">Confirm Deletion</div>
        <div className="text-sm text-muted-foreground">
          Are you sure you want to delete this item?
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.dismiss(t)}
            className="bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-md"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-md"
            onClick={async () => {
              toast.dismiss(t); // dismiss confirmation toast
              try {
                await toast.promise(dispatch(deleteItem(id)).unwrap(), {
                  loading: "Deleting item...",
                  success: "Item has been successfully deleted.",
                  error: "Failed to delete item.",
                });
                // After successful deletion, refetch or update state
                dispatch(fetchAllItems());
              } catch (error) {
                toast.error("Error deleting item.");
              }
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
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
      // Update the local item data after editing the item
      dispatch(fetchAllItems()); // Optionally, refetch the items
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
    return (
      <div className="p-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl">Manage Storage Items</h1>
        <Button
          className="text-white rounded-2xl bg-highlight2 hover:bg-white hover:text-highlight2"
          onClick={() => {
            setSelectedItem(null); // Reset selected item when adding new item
            setShowModal(true); // Show modal to add a new item
          }}
        >
          Add New Item
        </Button>
      </div>
      <PaginatedDataTable columns={itemsColumns} data={items} />

      {showModal && (
        <AddItemModal
          onClose={handleCloseModal}
          initialData={selectedItem || undefined} // Pass selectedItem or undefined
        />
      )}
    </div>
  );
};

export default AdminItemsTable;