import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageIndex: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
}

export function PaginatedDataTable<TData, TValue>({
  columns,
  data,
  pageIndex,
  pageCount,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    pageCount,
    manualPagination: true,
    state: {
      pagination: {
        pageIndex,
        pageSize: 10,
      },
      sorting,
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize: 10 })
          : updater;
      onPageChange(newState.pageIndex);
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  // Translation
  const { lang } = useLanguage();

  return (
    <div className="space-y-2">
      <div className="rounded-md border-none overflow-x-auto max-w-full">
        <Table className="w-full min-w-[600px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer select-none hover:text-highlight2 transition-colors items-center gap-1"
                      key={header.id}
                    >
                      <div className="flex items-center gap-1">
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                        {isSorted === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-muted-foreground" />
                        ) : isSorted === "desc" ? (
                          <ArrowDown className="w-3 h-3 text-muted-foreground" />
                        ) : null}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-10"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="truncate">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-center mt-5 space-x-2">
        <Button
          variant={"secondary"}
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
        >
          {t.pagination.previous[lang]}
        </Button>
        <span className="text-sm text-slate-500">
          {t.pagination.pageInfo[lang]
            .replace("{page}", String(pageIndex + 1))
            .replace("{total}", String(pageCount))}
        </span>
        <Button
          variant={"secondary"}
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex + 1 >= pageCount}
        >
          {t.pagination.next[lang]}
        </Button>
      </div>
    </div>
  );
}
