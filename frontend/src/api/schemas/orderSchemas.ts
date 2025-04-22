import { z } from "zod";

// Define schemas for validation
export const orderItemSchema = z.object({
  id: z.string(),
  status: z.enum([
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "rejected",
  ]),
  item_id: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  order_id: z.string(),
  quantity: z.number(),
  subtotal: z.number().nullable(),
  created_at: z.string(),
  total_days: z.number(),
  unit_price: z.number().nullable(),
  location_id: z.string(),
  item_name: z.string().optional(),
  storage_items: z.record(z.any()).optional(),
});

export const userProfileSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
  })
  .nullable();

export const bookingOrderSchema = z.object({
  id: z.string(),
  order_number: z.string(),
  user_id: z.string(),
  status: z.enum([
    "pending",
    "confirmed",
    "paid",
    "completed",
    "cancelled",
    "cancelled by user",
    "rejected",
    "refunded",
  ]),
  total_amount: z.number().nullable(),
  discount_amount: z.number(),
  discount_code: z.string().nullable(),
  final_amount: z.number().nullable(),
  payment_status: z
    .enum(["pending", "partial", "paid", "refunded", "failed"])
    .nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  payment_details: z.any().nullable(),
  order_items: z.array(orderItemSchema),
  user_profile: userProfileSchema,
});

export const bookingOrdersSchema = z.array(bookingOrderSchema);
