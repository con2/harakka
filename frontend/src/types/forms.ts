import { Tag } from "./tag";
import { ItemTranslation } from "./item";
import { TagTranslations } from "./manualOverride";
import { Org_Roles } from "@common/role.types";
import { StorageItemRow } from "@common/items/storage-items.types";
import { SelectedStorage } from "@common/items/form.types";

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
  roles: NonNullable<Org_Roles>[]; // Use new role system, exclude null
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
    StorageItemRow,
    "created_at" | "updated_at" | "storage_item_tags" | "average_rating"
  > {
  // Override translations to ensure they always exist with required fields
  translations: {
    fi: ItemTranslation;
    en: ItemTranslation;
  };

  // Ensure both fields are defined
  available_quantity: number;
  location_details: {
    name: string;
    address: string;
  };
  tagIds?: string[];
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

export type AddItemProps = {
  storage: SelectedStorage;
  tags: Tag[];
  handleAdd: (item: ItemFormData) => void;
};
