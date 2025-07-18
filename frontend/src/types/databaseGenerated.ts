import { Database as DatabaseGenerated } from "@common/supabase.types";
export type { Json } from "@common/supabase.types";

/**
 * Strongly‑typed representation of the JSON column **`tags.translations`**.
 *
 * Each supported language code maps to an object holding the translated
 * strings for that language.  When a particular language has not been
 * localised yet, its entry may be `null`.
 */
export type TagTranslations = {
  en: { name: string };
  fi: { name: string };
};

type ItemTranslations = {
  en: { item_name: string; item_type: string; item_description: string };
  fi: { item_name: string; item_type: string; item_description: string };
};

/**
 * Re‑export of the generated Supabase `Database` type with a *narrowed*
 * definition of `tags.translations`.
 *
 * The override keeps every other table, view and enum exactly as generated,
 * but replaces the loose `Json | null` column type with the concrete
 * {@link TagTranslations} shape so that application code can rely on strict
 * typings without additional casting.
 */
export type Database = {
  public: {
    Tables: {
      tags: {
        Row: Omit<
          DatabaseGenerated["public"]["Tables"]["tags"]["Row"],
          "translations"
        > & {
          translations: TagTranslations | null;
        };
        Insert: Omit<
          DatabaseGenerated["public"]["Tables"]["tags"]["Insert"],
          "translations"
        > & {
          translations?: TagTranslations | null;
        };
        Update: Omit<
          DatabaseGenerated["public"]["Tables"]["tags"]["Update"],
          "translations"
        > & {
          translations?: TagTranslations | null;
        };
      };
    } & Omit<DatabaseGenerated["public"]["Tables"], "tags">;
    Views: DatabaseGenerated["public"]["Views"];
  } & Omit<DatabaseGenerated["public"], "Tables" | "Views">;
} & Omit<DatabaseGenerated, "public">;
