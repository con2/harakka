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
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowClick?: (row: Row<TData>) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  rowClick,
}: DataTableProps<TData, TValue>) {
  const { lang } = useLanguage();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto rounded-md border-none">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="text-sm font-normal">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={rowClick ? () => rowClick(row) : undefined}
                className={rowClick ? "cursor-pointer hover:bg-gray-50" : ""}
              >
                {row.getVisibleCells().map((cell) => {
                  const rawValue = cell.getValue();
                  const isEmpty =
                    rawValue === null ||
                    rawValue === undefined ||
                    rawValue === "" ||
                    (typeof rawValue === "string" && rawValue.trim() === "");

                  if (isEmpty) {
                    return (
                      <TableCell key={cell.id}>
                        {t.uiComponents.dataTable.emptyCell[lang]}
                      </TableCell>
                    );
                  }

                  const cellContent = flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext(),
                  );

                  return <TableCell key={cell.id}>{cellContent}</TableCell>;
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t.uiComponents.dataTable.noResults[lang]}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
