import { z } from "zod";

const translationSchema = z.object({
  item_name: z
    .string({
      required_error: "itemName",
    })
    .min(1, "itemName"),
  item_description: z
    .string({
      required_error: "itemDescription",
    })
    .min(1, "itemDescription"),
});

const itemTranslationsSchema = z.object({
  fi: translationSchema,
  en: translationSchema,
});

const imageSchema = z.object({
  id: z.string(),
  url: z.string(),
  full_path: z.string(),
  path: z.string(),
  metadata: z.object({
    image_type: z.string(),
    display_order: z.number(),
    alt_text: z.string().optional(),
    is_active: z.boolean(),
  }),
});

export const createItemDto = z.object({
  id: z.string().uuid(),
  category_id: z.string().uuid({ message: "category_id" }),
  location: z.object(
    {
      id: z.string().uuid({ message: "location" }),
      name: z.string().min(1, "location"),
      address: z.string().min(1, "location"),
    },
    { message: "location" },
  ),
  quantity: z
    .number({ invalid_type_error: "quantity" })
    .int()
    .min(1, "quantity"),
  available_quantity: z.number().int().min(0),
  is_active: z.boolean(),
  translations: itemTranslationsSchema,
  tags: z.array(z.string()),
  images: z.object({
    main: z.nullable(imageSchema),
    details: z.array(imageSchema),
  }),
});
