import { MergeDeep } from "type-fest";
import { Database as DatabaseGenerated } from "./supabase.types";
export type { Json } from "./supabase.types";

/* ── Concrete shapes for our translations ─────────────── */
type TagTranslations = {
  en: { name: string };
  fi: { name: string };
};
// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Views: {
        tags: {
          Row: {
            translations: TagTranslations;
          };
        };
      };
    };
  }
>;
