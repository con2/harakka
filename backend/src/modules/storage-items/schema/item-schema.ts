import z from "zod";

export const ItemSchema = z
  .object({
    en_item_name: z.string().min(1).max(100),
    en_item_description: z.string().min(1).max(250),
    fi_item_name: z.string().min(1).max(100),
    fi_item_description: z.string().min(1).max(250),
    quantity: z.coerce.number().int().min(1),
    category_id: z.uuid(),
    placement_description: z.string().min(1),
  })
  .strip();

export type Item = z.infer<typeof ItemSchema>;
