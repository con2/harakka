import { Tag } from "./tag";

/**
 * Base form state for all forms in the application
 */
export interface BaseFormState {
  loading: boolean;
  error: string | null;
  errorContext: string | null;
}

/**
 * Item form data structure for create/edit operations
 */
export interface ItemFormData {
  location_id: string;
  compartment_id: string;
  items_number_total: number;
  items_number_available: number;
  price: number;
  is_active: boolean;
  translations: {
    fi: {
      item_type: string;
      item_name: string;
      item_description: string;
    };
    en: {
      item_type: string;
      item_name: string;
      item_description: string;
    };
  };
  tagIds: string[];
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
