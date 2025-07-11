# 🧩 Unified Supabase Types with `MergeDeep`

We now use a **shared, type-safe Supabase `Database` type** across both the frontend and backend of our application.

---

## ✅ Why This Matters

Supabase generates base types (`Row`, `Insert`, `Update`) from your database schema. However, JSON columns are typed as `Json | null`, which isn’t very informative or useful in a type-safe TypeScript project.

---

## 🔧 Our Solution: `MergeDeep` Overrides

We use [`type-fest`](https://github.com/sindresorhus/type-fest)'s `MergeDeep` utility to *override specific JSON fields* and enrich the types globally.

### 1. Import base types and utilities:

```ts
import type { Database as Base } from "./supabase.types";
import type { MergeDeep } from "type-fest";
```

### 2. Define the expected structure for any `Json` fields:

```ts
type ItemTranslations = {
  en: { item_name: string; item_type: string; item_description: string };
  fi: { item_name: string; item_type: string; item_description: string };
};
```

### 3. Apply overrides to the base type:

```ts
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
      };
    };
  }
>;
```

---

## 📦 Where to Find It

These types live in:

```
common/database.types.ts
```

Import from there when using Supabase types anywhere in your app. You can access them like:

```ts
import type { Database } from "@/common/database.types";

type StorageItem = Database["public"]["Tables"]["storage_items"]["Row"];
```

Now all JSON fields like `translations`, `preferences`, and `saved_lists` have a clearly defined structure.
