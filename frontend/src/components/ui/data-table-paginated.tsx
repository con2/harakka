import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Row,
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
import { ArrowDown, ArrowUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageIndex: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
  ascending?: boolean | null;
  order?: string;
  handleAscending?: (asc: boolean | null) => void;
  handleOrder?: (order: string) => void;
  originalSorting?: string;
  rowProps?: (row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>;
  highlight?: number[];
}

/**
 * If data table has manual sorting:
 * a value for ascending, order, handleAscending and handleOrder must be provided.
 * These should update the state of the parents component, leading to a new API call.
 * If for some reason the original order is not the first column of the table, originalSorting must be provided
 */
export function PaginatedDataTable<TData, TValue>({
  columns,
  data,
  pageIndex,
  pageCount,
  onPageChange,
  ascending,
  order,
  handleAscending,
  handleOrder,
  originalSorting,
  rowProps,
  highlight,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    manualPagination: true,
    manualSorting: true,
    state: {
      pagination: {
        pageIndex,
        pageSize: 10,
      },
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize: 10 })
          : updater;
      onPageChange(newState.pageIndex);
    },
    getCoreRowModel: getCoreRowModel(),
  });
  // Translation
  const { lang } = useLanguage();

  /**
   * Mimic original sorting behaviour
   * @param id The ID of which to sort by. If ascending is null it will return to original sorting.
   */
  const handleClick = (id: string) => {
    if (id !== order) {
      handleOrder?.(id);
      handleAscending?.(true);
      return;
    }

    if (ascending !== null) {
      handleOrder?.(id);
    }

    if (ascending === true) {
      handleAscending?.(false);
    } else if (ascending === null) {
      handleAscending?.(true);
    } else {
      handleAscending?.(null);
      handleOrder?.(originalSorting ?? table.getHeaderGroups()[0].id);
    }
  };

  return (
    <div className="space-y-2">
      <div className="rounded-md border-none overflow-x-auto max-w-full">
        <Table className="w-full min-w-[600px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isOrder = header.id === order;
                  return (
                    <TableHead
                      onClick={
                        handleOrder ? () => handleClick(header.id) : () => {}
                      }
                      className="cursor-pointer select-none hover:text-highlight2 transition-colors items-center gap-1"
                      key={header.id}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {isOrder && ascending === false ? (
                          <ArrowUp className="w-3 h-3 text-muted-foreground" />
                        ) : isOrder && ascending ? (
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
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    className={`h-10 hover:cursor-pointer ${highlight?.includes(row.index) ? "bg-green-50" : ""}`}
                    data-state={row.getIsSelected() && "selected"}
                    data-higlighted={highlight?.includes(row.index)}
                    {...(rowProps?.(row) ?? {})}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const rawValue = cell.getValue();
                      const isEmpty =
                        rawValue === null ||
                        rawValue === undefined ||
                        rawValue === "" ||
                        (typeof rawValue === "string" &&
                          rawValue.trim() === "");

                      if (isEmpty) {
                        return (
                          <TableCell key={cell.id} className="truncate">
                            {t.uiComponents.dataTable.emptyCell[lang]}
                          </TableCell>
                        );
                      }

                      const cellContent = flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      );

                      return (
                        <TableCell key={cell.id} className="truncate">
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t.uiComponents.dataTable.noResults[lang]}
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
