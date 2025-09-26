import { BookingWithDetails } from "@/types";
import { CSVItem } from "@common/items/csv.types";
import { CreateItemType, SelectedStorage } from "@common/items/form.types";

/**
 * Used in itemsSlice -> uploadCSV
 * Formats the parsed CSV items into the CreateItemType used for item creation
 * @param items CSVItem
 * @param location The selected location for the items
 */
export function formatParsedItems(
  items: CSVItem[],
  location: SelectedStorage,
): CreateItemType[] {
  return items.map((item) => {
    const {
      en_item_name,
      en_item_description,
      fi_item_description,
      fi_item_name,
      ...rest
    } = item;
    return {
      ...rest,
      id: crypto.randomUUID() as string,
      category_id: "",
      translations: {
        fi: {
          item_name: fi_item_name,
          item_description: fi_item_description,
        },
        en: {
          item_name: en_item_name,
          item_description: en_item_description,
        },
      },
      images: {
        main: null,
        details: [],
      },
      available_quantity: rest.quantity,
      is_active: true,
      tags: [],
      location: location,
    };
  });
}

/**
 * Used in itemsSlice -> uploadCSV
 * Formats the errors returned when uploading a CSV.
 * The errors are formatted to be associated with the item ID
 */
export function formatErrors(
  errors: { row: number; errors: string[] }[],
  itemIds: Set<string>,
) {
  const ids = Array.from(itemIds); // preserve insertion order of the Set
  return errors.reduce<Record<string, string[]>>((acc, { row, errors }) => {
    const itemId = ids[row - 1]; // row is 1-based
    if (itemId) {
      // merge errors if multiple entries point to the same row
      acc[itemId] = acc[itemId] ? [...acc[itemId], ...errors] : errors;
    }
    return acc;
  }, {});
}

/**
 * Sort booking items by status.
 * Pending -> Confirmed -> Picked_up -> Returned -> Cancelled -> Rejected -> Completed
 * @param arr
 * @returns
 */
export function sortByStatus(arr: BookingWithDetails["booking_items"]) {
  if (!arr) return;
  const order = {
    pending: 0,
    confirmed: 1,
    picked_up: 2,
    returned: 3,
    cancelled: 4,
    rejected: 5,
    completed: 7,
  };
  const defaultIndex = 6;
  return arr
    .map((item, idx) => ({ __idx: idx, item }))
    .sort((a, b) => {
      const oa = order[a.item.status] ?? defaultIndex;
      const ob = order[b.item.status] ?? defaultIndex;
      return oa - ob || a.__idx - b.__idx;
    })
    .map((entry) => entry.item);
}
