import { Category } from "@common/items/categories";
import { ErrorContext } from "./common";

export type CategoriesState = {
  categories: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
  errorContext: ErrorContext;
  pagination: {
    totalPages: number;
    page: number;
    total: number;
  };
};

export type GetCategoriesDto = {
  page?: number;
  limit?: number;
  order?: string;
  asc?: string;
  search?: string;
};
