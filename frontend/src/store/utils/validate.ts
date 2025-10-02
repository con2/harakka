import { z } from "zod";

const translationSchema = z.object({
  item_name: z
    .string({
      required_error: "item_name",
    })
    .min(1, "item_name")
    .max(100, "item_name"),
  item_description: z
    .string({
      required_error: "item_description",
    })
    .min(1, "item_description")
    .max(250, "item_description"),
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
    object_fit: z.enum(["cover", "contain"]),
  }),
});

export type ImageSchemaType = {
  id: string;
  url: string;
  full_path: string;
  path: string;
  metadata: {
    image_Type: string;
    display_order: number;
    alt_text: string;
    is_active: boolean;
    object_fit: "cover" | "contain";
  };
};

export const createItemDto = z.object({
  id: z.string().uuid(),
  category_id: z
    .string({ message: "category_id" })
    .uuid({ message: "category_id" }),
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
  placement_description: z
    .string({ message: "placement_description" })
    .min(1, { message: "placement_description" })
    .max(200, { message: "placement_description" }),
});
