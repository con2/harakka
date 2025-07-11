


# Shared Types: Usage Guide

## 📌 Important Notice

To all team members:

**Please use only the `Database` type from `database.types.ts` moving forward**, and avoid importing directly from `supabase.types.ts`.

### Why?

The types in `supabase.types.ts` come with loose `Json` fields which lack structure. To ensure type safety and clarity, we are **replacing these JSON fields** with fully typed equivalents using the `MergeDeep` utility in `database.types.ts`.

### What to Do

✅ Use:
```ts
import type { Database } from '@/common/database.types';
```

🚫 Avoid:
```ts
import type { Database } from '@/common/supabase.types';
```

This change helps eliminate ambiguous or weakly typed fields and will keep our codebase clean and maintainable.

Thank you!