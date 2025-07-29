import { Item } from "@/types";

export type ItemUpdate = Omit<Item, "created_at" | "compartment_id">;
