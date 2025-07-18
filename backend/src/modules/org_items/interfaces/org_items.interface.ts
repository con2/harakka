import { Database } from "@common/database.types";

// Raw generated row type for organization items
export type OrgItemRow =
  Database["public"]["Tables"]["organization_items"]["Row"];

// Insert type for organization items
export type OrgItemInsert =
  Database["public"]["Tables"]["organization_items"]["Insert"];

// Update type for organization items
export type OrgItemUpdate =
  Database["public"]["Tables"]["organization_items"]["Update"];
