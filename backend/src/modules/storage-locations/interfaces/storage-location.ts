import { Database } from "../../../../../common/database.types";
export type StorageLocationsTable =
  Database["public"]["Tables"]["storage_locations"];
export type StorageLocationsRow = StorageLocationsTable["Row"];
export type StorageLocationsUpdate = StorageLocationsTable["Update"];
export type StorageLocationsFilter = Extract<keyof StorageLocationsRow, string>;
