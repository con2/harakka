import { Item } from "@/types";
import { UserOrganization } from "@/types/roles";

export type ItemUpdate = Omit<Item, "created_at" | "compartment_id">;
export type SelectedOrg = Omit<UserOrganization, "roles">;
export type SelectedStorage =
  | {
      name: string;
      id: string;
      address: string;
    }
  | null
  | undefined;
