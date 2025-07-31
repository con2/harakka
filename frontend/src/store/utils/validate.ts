import { z } from "zod";

const translationSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  item_type: z.string().min(1, "Item type is required"),
  item_description: z.string().min(1, "Item description is required"),
});

const itemTranslationsSchema = z.object({
  fi: translationSchema,
  en: translationSchema,
});

export const createItemDto = z.object({
  id: z.string().uuid(),
  location_id: z.string().uuid(),
  location_details: z.object({
    name: z.string().min(1, "Location name is required"),
    address: z.string().min(1, "Location address is required"),
  }),
  items_number_total: z.number().int().min(1),
  items_number_currently_in_storage: z.number().int().min(0),
  price: z.number().min(0),
  is_active: z.boolean(),
  translations: itemTranslationsSchema,
  tags: z.array(z.string()),
  mainImage: z.string().optional(),
  detailImages: z.array(z.string()).optional(),
});

export type CreateItemType = {
  id: string;
  location_id: string;
  location_details: {
    name: string;
    address: string;
  };
  items_number_total: number;
  items_number_currently_in_storage: number;
  price: number;
  is_active: boolean;
  translations: {
    fi: {
      item_name: string;
      item_type: string;
      item_description: string;
    };
    en: {
      item_name: string;
      item_type: string;
      item_description: string;
    };
  };
  tags: string[];
  mainImage: string;
  detailImages: string[];
};
