import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  deleteItem,
  fetchAllItems,
  selectAllItems,
  selectItemsError,
  selectItemsLoading,
  updateItem,
} from '@/store/slices/itemsSlice';
import { PaginatedDataTable } from '../ui/data-table-paginated';
import { ColumnDef } from '@tanstack/react-table';
import { LoaderCircle } from 'lucide-react';
import { Button } from '../ui/button';
import AddItemModal from './AddItemModal';
import { toast } from 'sonner';
import UpdateItemModal from './UpdateItemModal';
import { Switch } from '@/components/ui/switch';
import { selectAllTags } from '@/store/slices/tagSlice';
import { Item } from '@/types/item';
import AssignTagsModal from './AssignTagsModal';

const AdminItemsTable = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const tags = useAppSelector(selectAllTags);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [assignTagsModalOpen, setAssignTagsModalOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  // filtering states:
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
      header: 'Item Name (FI)',
      accessorFn: (row) => row.translations.fi.item_name,
      sortingFn: 'alphanumeric',
      enableSorting: true,
      cell: ({ row }) => row.original.translations.fi.item_name,
    },
    {
      header: 'Item Type (FI)',
      accessorFn: (row) => row.translations.fi.item_type,
      sortingFn: 'alphanumeric',
      enableSorting: true,
      cell: ({ row }) => row.original.translations.fi.item_type,
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: ({ row }) => `€${row.original.price.toLocaleString()}`,
    },
    // {
    //   header: 'Average Rating',
    //   accessorFn: (row) => row.average_rating,
    //   cell: ({ row }) => row.original.average_rating ?? 'N/A', // Handle if no average rating
    // },
    {
      id: 'status',
      header: 'Active',
      cell: ({ row }) => {
        const item = row.original;
    
        const handleToggle = async (checked: boolean) => {
          try {
            await dispatch(updateItem({
              id: item.id,
              data: {
                is_active: checked,
              },
            })).unwrap();
            dispatch(fetchAllItems());
            toast.success(`Item ${checked ? 'activated' : 'deactivated'} successfully`);
          } catch (error) {
            toast.error('Failed to update item status');
          }
        };
    
        return (
          <Switch
            checked={item.is_active}
            onCheckedChange={handleToggle}
          />
        );
      },
    },
    {
      id: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.original.storage_item_tags ?? [];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <span
                key={tag.id}
                className="text-xs rounded px-2 py-1 text-secondary"
              >
                {tag.translations?.fi?.name || tag.translations?.en?.name || 'Unnamed'}
              </span>
            ))}
          </div>
        );
      },
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

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchAllItems());
    }
  }, [dispatch, items.length]);  
  
  const handleEdit = (item: Item) => {
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

  const filteredItems = items
  .filter(item => {
    if (statusFilter === 'active') return item.is_active;
    if (statusFilter === 'inactive') return !item.is_active;
    return true;
  })
  .filter(item => {
    const name = item.translations.fi.item_name.toLowerCase();
    const type = item.translations.fi.item_type.toLowerCase();
    return (
      name.includes(searchTerm.toLowerCase()) ||
      type.includes(searchTerm.toLowerCase())
    );
  })
  .filter(item => {
    if (tagFilter.length === 0) return true;
    const itemTagIds = (item.storage_item_tags ?? []).map(t => t.id);
    return tagFilter.every(tag => itemTagIds.includes(tag));
  });

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
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search by item name/type */}
        <input
          type="text"
          className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
          placeholder="Search by name or type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Filter by active status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Filter by tags */}
        <div className="flex flex-wrap gap-2">
          {tagFilter.length > 0 && (
            <span className="text-sm text-muted-foreground">
              Filtered by {tagFilter.length} tag{tagFilter.length > 1 ? 's' : ''}
            </span>
          )}
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => {
                setTagFilter(prev => prev.includes(tag.id)
                  ? prev.filter(t => t !== tag.id)
                  : [...prev, tag.id]);
              }}
              className={`px-3 py-2 rounded-2xl text-xs border ${
                tagFilter.includes(tag.id) ? 'bg-secondary text-white' : 'border-secondary text-secondary'
              }`}
            >
              {tag.translations?.fi?.name?.toLowerCase() || tag.translations?.en?.name?.toLowerCase()}
            </button>
          ))}
        </div>
        <Button
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setTagFilter([]);
          }}
          className="ml-4 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
        >
          Clear Filters
        </Button>
    </div>

      <PaginatedDataTable columns={itemsColumns} data={filteredItems} />

      {/* Show UpdateItemModal when showModal is true */}
      {showModal && selectedItem && (
        <UpdateItemModal
          onClose={handleCloseModal}
          initialData={selectedItem}  // Pass the selected item data to the modal
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
