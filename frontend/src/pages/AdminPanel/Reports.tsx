import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllAdminItems,
  selectAllItems,
  selectItemsError,
  selectItemsLoading,
  selectItemsPagination,
} from "@/store/slices/itemsSlice";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Input } from "@/components/ui/input";

const Reports: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const { totalPages } = useAppSelector(selectItemsPagination);

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Fetch items when the component mounts or filters change
  useEffect(() => {
    void dispatch(
      fetchAllAdminItems({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        searchquery: debouncedSearchTerm,
      }),
    );
  }, [dispatch, currentPage, debouncedSearchTerm]);

  // Define columns for the report table
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => row.original.id,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name || "—",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => row.original.status || "—",
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
      <h1 className="text-2xl font-bold">Items Report</h1>

      {/* Search Input */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {/* Paginated Data Table */}
      <PaginatedDataTable
        columns={columns}
        data={items}
        pageIndex={currentPage - 1}
        pageCount={totalPages}
        onPageChange={(page) => setCurrentPage(page + 1)}
      />
    </div>
  );
};

export default Reports;
