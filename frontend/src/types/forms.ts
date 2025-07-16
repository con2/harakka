import { Tag } from "./tag";
import { Item, ItemTranslation } from "./item";
import { UserRole } from "./user";
import { TagTranslations } from "./databaseGenerated";

/**
 * Base form state for all forms in the application
 */
export interface BaseFormState {
  loading: boolean;
  error: string | null;
  errorContext: string | null;
}

/**
 * User form data structure for create/edit operations
 * Used for both AddTeamMemberModal and UserEditModal
 */
export interface UserFormData {
  full_name: string;
  visible_name: string;
  email: string;
  phone: string;
  roles: UserRole[];
  preferences: Record<string, string>;
  saved_lists?: string[];
}

/**
 * Form data with optional password - used when creating a new user
 */
export interface CreateUserFormData extends UserFormData {
  password?: string;
}

// -- Item form types below --

/**
 * Item form data structure for create/edit operations
 */
export interface ItemFormData
  extends Omit<
    Item,
    | "id"
    | "created_at"
    | "updated_at"
    | "storage_item_tags"
    | "tagIds"
    | "average_rating"
  > {
  // Override translations to ensure they always exist with required fields
  translations: {
    fi: ItemTranslation;
    en: ItemTranslation;
  };
  // Add tagIds as a separate field for form handling
  tagIds: string[];

  // Ensure both fields are defined
  items_number_currently_in_storage: number;
}

/**
 * Tag form data for creating/editing tags
 */
export interface TagFormData {
  /** Map of language code → translation (or null if untranslated). */
  translations: TagTranslations;
}

/**
 * Helper function to create tag form data with proper typing
 */
export function createTagPayload(fiName: string, enName: string): TagFormData {
  return {
    translations: {
      fi: { name: fiName },
      en: { name: enName },
    },
  };
}

/**
 * Generic type for form handlers
 */
export type FormChangeHandler = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) => void;

/**
 * Toggle change handler type
 */
export type ToggleChangeHandler = (checked: boolean) => void;

/**
 * Tag selection handler type
 */
export type TagSelectionHandler = (tag: Tag, selected: boolean) => void;

/**
 * Props for TagAssignmentForm component
 */
export interface TagAssignFormProps {
  itemId: string;
}
