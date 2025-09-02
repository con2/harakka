import { Category } from "@common/items/categories";
import { ErrorContext } from "./common";

export type CategoriesState = {
  categories: Category[];
  loading: boolean;
  error: string | null;
  errorContext: ErrorContext;
};
