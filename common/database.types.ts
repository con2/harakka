import type { MergeDeep } from "type-fest";
import type { Database as Base } from "@common/supabase.types";
export type { Json } from "@common/supabase.types";

/* ── Concrete shapes for our translations ─────────────── */
type ItemTranslations = {
  en: { item_name: string; item_type: string; item_description: string };
  fi: { item_name: string; item_type: string; item_description: string };
};

type TagTranslations = {
  en: { name: string };
  fi: { name: string };
};
// Helps to override the `Json | null` type in the database schema
/* ── Add the shape of translations here ──────────────────────────── */
export type Database = MergeDeep<
  Base,
  {
    public: {
      Tables: {
        storage_items: {
          Row: { translations: ItemTranslations | null };
          Insert: { translations?: ItemTranslations | null };
          Update: { translations?: ItemTranslations | null };
        };
        tags: {
          Row: { translations: TagTranslations | null };
          Insert: { translations?: TagTranslations | null };
          Update: { translations?: TagTranslations | null };
        };
        storage_item_tags: {
          Row: {
            translations: TagTranslations | null;
          };
          Insert: {
            translations?: TagTranslations | null;
          };
          Update: {
            translations?: TagTranslations | null;
          };
        };
        user_profiles: {
          Row: {
            preferences: Record<string, string> | null;
            saved_lists: string[] | null;
          };
          Insert: {
            preferences?: Record<string, string> | null;
            saved_lists?: string[] | null;
          };
          Update: {
            preferences?: Record<string, string> | null;
            saved_lists?: string[] | null;
          };
        };
      };
    };
  }
>;
