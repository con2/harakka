// add-item-columns.tsx

import { Button } from "@/components/ui/button";
import { ItemFormData } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

export const getItemColumns = (
  onEdit: (item: ItemFormData) => void,
  onDelete: (item: ItemFormData) => void,
): ColumnDef<ItemFormData>[] => [
  {
    header: "Item name",
    id: "item_name",
    cell: ({ row }) => row.original.translations.en.item_name,
  },
  {
    header: "Quantity",
    id: "quantity",
    cell: ({ row }) => row.original.items_number_total,
  },
  {
    header: "Storage",
    id: "organization-location",
    cell: ({ row }) => row.original.location_details?.name,
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <>
          <Button
            size="sm"
            onClick={() => onEdit(item)}
            className="text-highlight2/80 hover:text-highlight2 hover:bg-highlight2/20"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => onDelete(item)}
            variant="ghost"
            className="text-red-600 hover:text-red-800 hover:bg-red-100"
            aria-label={`Delete ${item.translations.en.item_name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      );
    },
  },
];
