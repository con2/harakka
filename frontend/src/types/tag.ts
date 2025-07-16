import { Database } from "./database.types";
import { ErrorContext } from "./common";

export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];
export type CreateTag = Database["public"]["Tables"]["tags"]["Insert"];
/**
 * Tag translation content
 */
/* export interface TagTranslation {
  name: string;
} */
import type { Tables } from "./supabase.types";

export type TagTranslation = { en: string; fi: string };
type TagRowBase = Tables<"tags">;
type TagRow = Omit<TagRowBase, "translations"> & {
  translations: TagTranslation | null;
};
/**
 * Tag entity representing a label that can be assigned to items
 */
// export interface Tag extends BaseEntity, Translatable<TagTranslation> {}

/**
 * Tag state in Redux store
 */
export interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  errorContext: ErrorContext;
  selectedTags: Tag[] | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Data required to create a new tag
 */
export type CreateTagDto = Omit<TagRow, "id" | "created_at">;

/**
 * Data for updating an existing tag
 */
export type UpdateTagDto = Partial<
  Omit<TagRow, "id" | "created_at" | "updated_at">
>;

/**
 * Data for assigning tags to an item
 */
export interface TagAssignment {
  itemId: string;
  tagIds: string[];
}

/**
 * Filter options for tag assignment status
 */
export type TagAssignmentFilter = "all" | "assigned" | "unassigned";
