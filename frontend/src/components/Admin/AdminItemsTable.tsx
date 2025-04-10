import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  deleteItem,
  fetchAllItems,
  getItemById,
  selectAllItems,
  selectItemsError,
  selectItemsLoading,
  selectSelectedItem,
} from '@/store/slices/itemsSlice';
import { PaginatedDataTable } from '../ui/data-table-paginated';
import { ColumnDef } from '@tanstack/react-table';
import { Box, LoaderCircle } from 'lucide-react';
import defaultImage from '@/assets/defaultImage.jpg';
import { Button } from '../ui/button';
import AddItemModal from './AddItemModal';
import { toast } from 'sonner';
import UpdateItemModal from './UpdateItemModal'; // Import UpdateItemModal

interface StorageItem {
  id: string;
  location: string;
  price: number;
  imageUrl?: string;
}

const AdminItemsTable = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StorageItem | null>(null);

  const itemsColumns: ColumnDef<StorageItem>[] = [
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
      header: 'Location',
      accessorKey: 'location',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Box className="h-4 w-4" />
          {row.original.location}
        </div>
      ),
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: ({ row }) => `€${row.original.price.toLocaleString()}`,
    },
    {
      header: 'Item Name (FI)',
      accessorFn: (row) => row.translations.fi.item_name,
      cell: ({ row }) => row.original.translations.fi.item_name,
    },
    {
      header: 'Item Type (FI)',
      accessorFn: (row) => row.translations.fi.item_type,
      cell: ({ row }) => row.original.translations.fi.item_type,
    },
    {
      header: 'Average Rating',
      accessorFn: (row) => row.average_rating,
      cell: ({ row }) => row.original.average_rating ?? 'N/A', // Handle if no average rating
    },
    {
      id: 'edit',
      header: 'Edit',
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
      id: 'delete',
      header: 'Delete',
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
    setSelectedItem(item);  // Set the selected item
    setShowModal(true);      // Show the modal
  };

  const handleDelete = async (id: string) => {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl">Manage Storage Items</h1>
        <AddItemModal>
          <Button className="text-white rounded-2xl bg-highlight2 hover:bg-white hover:text-highlight2">
            Add New Item
          </Button>
        </AddItemModal>
      </div>
      <PaginatedDataTable columns={itemsColumns} data={items} />

      {/* Show UpdateItemModal when showModal is true */}
      {showModal && selectedItem && (
        <UpdateItemModal
          onClose={handleCloseModal}
          initialData={selectedItem}  // Pass the selected item data to the modal
        />
      )}
    </div>
  );
};

export default AdminItemsTable;
