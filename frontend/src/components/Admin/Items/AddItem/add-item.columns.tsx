// add-item-columns.tsx

import { Button } from "@/components/ui/button";
import { CreateItemType } from "@common/items/form.types";
import { ColumnDef } from "@tanstack/react-table";
import { ClipboardPen, Trash } from "lucide-react";

export const getItemColumns = (
  onEdit: (id: CreateItemType["id"]) => void,
  onDelete: (item: CreateItemType) => void,
): ColumnDef<CreateItemType>[] => [
  {
    header: "Item name",
    id: "item_name",
    cell: ({ row }) => (
      <div className="truncate max-w-[150px] justify-self-end">
        {row.original.translations.en.item_name}
      </div>
    ),
  },
  {
    header: "Quantity",
    id: "quantity",
    cell: ({ row }) => row.original.quantity,
  },
  {
    header: "Storage",
    id: "organization-location",
    cell: ({ row }) => row.original.location.name,
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex gap-2 justify-self-end">
          <Button
            size="sm"
            onClick={() => onEdit(item.id)}
            className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
          >
            <ClipboardPen className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => onDelete(item)}
            variant="ghost"
            className="text-red-600 hover:text-red-800 hover:bg-red-100"
            aria-label={`Delete ${item.translations.en.item_name}`}
          >
            <Trash className="!h-4 !w-4" />
          </Button>
        </div>
      );
    },
  },
];
