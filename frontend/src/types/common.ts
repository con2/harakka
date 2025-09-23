/**
 * Common types used throughout the application
 */

/**
 * Multilingual content structure with support for Finnish and English
 */
export interface Translatable<T> {
  translations: {
    fi: T;
    en: T;
  };
}

/**
 * Basic information about dates
 */
export interface DateRange {
  startDate: string | undefined;
  endDate: string | undefined;
}

/**
 * Status for filtering
 */
export type FilterStatus = "all" | "active" | "inactive";

/**
 * Base entity properties that most domain objects have
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Common API error response
 */
export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
  message?: string;
  statusCode?: number;
  name?: string;
}

// Add this interface to your common types
export type ErrorContext =
  | "create"
  | "fetch"
  | "update"
  | "delete"
  | "assign"
  | "confirm"
  | "cancel"
  | "reject"
  | "return"
  | "update-payment-status"
  | "patch"
  | null;

export interface ErrorState {
  message: string | null;
  context: ErrorContext;
}

export type FilterValue =
  | boolean
  | number[]
  | [number, number]
  | string[]
  | string;

export interface FiltersState {
  isActive: boolean;
  averageRating: number[];
  itemsNumberAvailable: [number, number];
  categories: string[];
  tagIds: string[];
  locationIds: string[];
  orgIds?: string[];
}
