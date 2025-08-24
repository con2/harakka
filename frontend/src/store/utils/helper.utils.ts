import { CSVItem } from "@common/items/csv.types";
import { CreateItemType, SelectedStorage } from "@common/items/form.types";

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
