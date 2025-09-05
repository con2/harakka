import { Database } from "@common/database.types";
import { StripNullFrom } from "@common/helper.types";

export type CategoryViewRow =
  Database["public"]["Views"]["view_category_details"]["Row"];
export type CategoryTranslations = {
  translations: {
    en: string;
    fi: string;
  };
};

export type Category = Omit<StripNullFrom<CategoryViewRow, "id" | "assigned_to" | "created_at">, "translations"> &
  CategoryTranslations;
export type CategoryInsert =
  Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate =
  Database["public"]["Tables"]["categories"]["Update"];
