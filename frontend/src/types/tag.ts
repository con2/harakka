import { ErrorContext } from "./common";
import { Database } from "@common/database.types";

/**
 * Tag translation content
 */
export interface TagTranslation {
  name: string;
}

/**
 * Basic tag row from Supabase
 */
type TagRow = Database["public"]["Tables"]["tags"]["Row"];

/**
 * Tag entity representing a label that can be assigned to items
 */
export type Tag = TagRow;

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
export type CreateTagDto = Omit<Tag, "id" | "created_at">;

/**
 * Data for updating an existing tag
 */
export type UpdateTagDto = Partial<
  Omit<Tag, "id" | "created_at" | "updated_at">
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
