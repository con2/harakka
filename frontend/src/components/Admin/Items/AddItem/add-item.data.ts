import { SelectedStorage } from "@common/items/form.types";

export const TRANSLATION_FIELDS = [
  {
    lang: "fi",
    fieldKey: "item_name",
    nameValue: "translations.fi.item_name",
    translationKey: "itemNameFi",
  },
  {
    lang: "en",
    fieldKey: "item_name",
    nameValue: "translations.en.item_name",
    translationKey: "itemNameEn",
  },
  {
    lang: "fi",
    fieldKey: "item_description",
    nameValue: "translations.fi.item_description",
    translationKey: "descriptionFi",
  },
  {
    lang: "en",
    fieldKey: "item_description",
    nameValue: "translations.en.item_description",
    translationKey: "descriptionEn",
  },
];

export const getInitialItemData = (storage?: SelectedStorage) => ({
  id: crypto.randomUUID(),
  location: {
    id: storage?.id ?? "",
    name: storage?.name ?? "",
    address: storage?.address ?? "",
  },
  quantity: 1,
  available_quantity: 1,
  is_active: true,
  tags: [],
  translations: {
    fi: {
      item_name: "",
      item_description: "",
    },
    en: {
      item_name: "",
      item_description: "",
    },
  },
  category_id: null,
  images: {
    main: null,
    details: [],
  },
});
