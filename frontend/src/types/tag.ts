import { ErrorContext } from "./common";
import { Override } from "./db-helpers";
import { Database, TagTranslations } from "./manualOverride";
import { Tag as BaseTag } from "./tag";

/** Runtime row shape for the `tags` table with typed `translations`. */
export type Tag = Database["public"]["Tables"]["tags"]["Row"];

/** Payload accepted by Supabase when updating an existing tag. */
export type UpdateTagDto = Database["public"]["Tables"]["tags"]["Update"];

/** Payload accepted by Supabase when inserting a new tag. */
export type CreateTagDto = Database["public"]["Tables"]["tags"]["Insert"];

/**
 * A single‑language translation object (alias of one entry in
 * {@link TagTranslations}).
 */
export type TagTranslation = TagTranslations["en"];

/**
 * Normalised slice of the Redux store that caches `Tag` records together
 * with loading/error flags and pagination metadata.
 */
export interface TagState {
  tags: TagWithUsage[];
  loading: boolean;
  error: string | null;
  errorContext: ErrorContext;
  selectedTags: Tag[] | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Association of one item with multiple tag IDs. */
export interface TagAssignment {
  itemId: string;
  tagIds: string[];
}

export type ItemFormTag = { tag_id: string; translations: TagTranslations };

/** UI filter values for tag‑assignment status. */
export type TagAssignmentFilter = "all" | "assigned" | "unassigned";

/** Extra field for counting usage */
interface TagAugmentedFields {
  usageCount: number;
}
/** Final row type */
export type TagWithUsage = Override<BaseTag, TagAugmentedFields>;
