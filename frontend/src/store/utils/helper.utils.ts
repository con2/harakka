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
      en_item_type,
      fi_item_description,
      fi_item_name,
      fi_item_type,
      ...rest
    } = item;
    return {
      ...rest,
      id: crypto.randomUUID() as string,
      translations: {
        fi: {
          item_name: fi_item_name,
          item_description: fi_item_description,
          item_type: fi_item_type,
        },
        en: {
          item_name: en_item_name,
          item_description: en_item_description,
          item_type: en_item_type,
        },
      },
      images: {
        main: null,
        details: [],
      },
      items_number_currently_in_storage: rest.items_number_total,
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
