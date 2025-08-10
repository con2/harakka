import z from "zod";

export const ItemSchema = z.object({
  en_item_name: z.string().min(1).max(300),
  en_item_type: z.string().min(1).max(50),
  en_item_description: z.string().min(1).max(500),
  fi_item_name: z.string().min(1).max(300),
  fi_item_type: z.string().min(1).max(50),
  fi_item_description: z.string().min(1).max(500),
  items_number_total: z.coerce.number().int().min(1),
  price: z.coerce.number().int().min(0),
});

export type Item = z.infer<typeof ItemSchema>;
