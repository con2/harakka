// AdminItemsTable.tsx
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllItems,
  selectAllItems,
  selectItemsError,
  selectItemsLoading,
} from "@/store/slices/itemsSlice";
import { PaginatedDataTable } from "../ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { Box, LoaderCircle } from "lucide-react";
import defaultImage from "@/assets/defaultImage.jpg";
import { Button } from "../ui/button";

const AdminItemsTable = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);

  interface StorageItem {
    id: string;
    location: string;
    price: number;
    imageUrl?: string;
  }

  const itemsColumns: ColumnDef<StorageItem>[] = [
    {
      header: "Image",
      accessorKey: "imageUrl",
      cell: ({ row }) => {
        const url = row.original.imageUrl || defaultImage;
        return (
          <img
            src={url}
            alt="Item"
            className="h-12 w-12 object-cover rounded-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />
        );
      },
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: ({ row }) => `€${row.original.price.toLocaleString()}`,
    },
    {
      header: "Location",
      accessorKey: "location",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Box className="h-4 w-4" />
          {row.original.location}
        </div>
      ),
    },
    {
      id: "edit",
      header: "Edit",
      cell: ({ row }) => (
        <Button
          className="bg-background rounded-2xl px-6 text-highlight2 border-highlight2 border-1 hover:text-background hover:bg-highlight2"
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
    <div className="p-6 space-y-4">
      <h1 className="text-xl">Admin Storage Inventory</h1>
      <PaginatedDataTable columns={itemsColumns} data={items} />
    </div>
  );
};

export default AdminItemsTable;
