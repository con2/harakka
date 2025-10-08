import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { Card } from "./card";
import { TableRow, TableCell, TableBody } from "./table";
import { cn } from "@/lib/utils";
import Pagination from "./pagination";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MobileTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowClick?: (row: Row<TData>) => void;
  pageIndex?: number;
  pageCount?: number;
  onPageChange?: (pageIndex: number) => void;
}

function MobileTable<TData, TValue>({
  columns,
  data,
  rowClick,
  pageCount,
  pageIndex,
  onPageChange,
}: MobileTableProps<TData, TValue>) {
  const { lang } = useLanguage();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-8">
      {table.getRowModel().rows.map((row) => (
        <MobileTableEntry
          key={row.id}
          row={row}
          table={table}
          rowClick={rowClick}
        />
      ))}
      {data.length === 0 && (
        <Card className="p-4">{t.uiComponents.dataTable.noResults[lang]}</Card>
      )}
      {pageCount != null &&
        pageIndex != null &&
        onPageChange &&
        data.length > 0 && (
          <Pagination
            pageCount={pageCount}
            pageIndex={pageIndex}
            onPageChange={onPageChange}
          />
        )}
    </div>
  );
}

type MobileTableEntryProps<TData> = {
  row: Row<TData>;
  // use `any` for the table type to avoid complex generic typing here;
  // if you want to be strict you can import the Table type from tanstack and parameterize it.
  table: any;
  rowClick?: (row: Row<TData>) => void;
};

function MobileTableEntry<TData>({
  row,
  table,
  rowClick,
}: MobileTableEntryProps<TData>) {
  return (
    <div className="p-2 bg-white w-full rounded-sm shadow-sm">
      <table
        className={cn("text-sm w-full", rowClick && "hover:cursor-pointer")}
        onClick={() => rowClick?.(row)}
      >
        <TableBody className={cn("[&_tr]:py-1")}>
          {row.getVisibleCells().map((cell) => {
            // Find the Header object that corresponds to this column (if any)
            const header = table
              .getHeaderGroups()
              .flatMap((hg: any) => hg.headers)
              .find((h: any) => h.column.id === cell.column.id);

            // If there is a header object, use its context (correct HeaderContext). Otherwise fall back to a sensible label.
            const headerContent =
              header != null
                ? flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )
                : // fallback: if header def is a string show it, otherwise use column id
                  typeof cell.column.columnDef.header === "string"
                  ? cell.column.columnDef.header
                  : cell.column.id;

            return (
              <TableRow
                key={cell.id}
                className={cn(
                  "flex justify-between items-start hover:bg-white",
                  "", // Last row does not have a border
                )}
              >
                <TableCell className="p-2 my-auto text-gray-500 pr-4">
                  {headerContent}
                </TableCell>
                <TableCell className="p-2 flex-1 text-right text-muted-foreground">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </table>
    </div>
  );
}

export default MobileTable;
