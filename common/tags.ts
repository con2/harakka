 import { Database } from "./database.types";

 export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];
export type CreateTag = Database["public"]["Tables"]["tags"]["Insert"];