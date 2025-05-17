import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
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
}

export function PaginatedDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
    getRowId: (row) => (row as { id?: string | number })?.id?.toString() ?? JSON.stringify(row),
  });
  // Translation
  const { lang } = useLanguage();

  return (
    <div className="space-y-2">
      <div className="rounded-md border-none">
        <Table className="w-full overflow-x-auto">
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
          className="px-2 py-1 bg-background border-1 border-secondary text-secondary hover:bg-secondary hover:text-white"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {t.pagination.previous[lang]}
        </Button>
        <span className="text-sm text-slate-500">
          {t.pagination.pageInfo[lang]
            .replace(
              "{page}",
              String(table.getState().pagination.pageIndex + 1),
            )
            .replace("{total}", String(table.getPageCount()))}
        </span>
        <Button
          className="px-2 py-1 bg-background border-1 border-secondary text-secondary hover:bg-secondary hover:text-white"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t.pagination.next[lang]}
        </Button>
      </div>
    </div>
  );
}
