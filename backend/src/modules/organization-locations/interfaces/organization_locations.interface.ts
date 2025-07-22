import { Database } from "@common/database.types";

export type OrgLocationRow =
  Database["public"]["Tables"]["organization_locations"]["Row"];

export type OrgLocationInsert =
  Database["public"]["Tables"]["organization_locations"]["Insert"];

export type OrgLocationUpdate =
  Database["public"]["Tables"]["organization_locations"]["Update"];
