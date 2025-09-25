# Translation & Localization Guide

This project supports full English and Finnish localization for all user-facing UI and database content.

## Table of Contents

[Frontend Translations](#1-frontend-translations)  
[Database Translations](#2-database-translations)  
[How DB translations are used in the frontend](#how-db-translations-are-used-in-the-frontend)  
[Usage](#3-usage-in-components)  
[Adding translations](#4-adding-translations)  
[Naming conventions](#5-naming-conventions)  
[Checking coverage](#6-checking-coverage)

## 1. Frontend Translations

- All UI translations are stored in [frontend/src/translations/modules/](frontend/src/translations/modules/).
- Each module (e.g., cart, login, userGuide) exports an object with `fi` and `en` keys for every string.
- The main translation index is [frontend/src/translations/index.ts](frontend/src/translations/index.ts), which aggregates all modules.
- Access translations in components using the translation object, e.g. `t.cart.empty.title[lang]`.

## 2. Database Translations

- Multilingual content for items, compartments, and tags is stored in JSONB fields in the database.
- Each translation field contains an object with language keys (`fi`, `en`) and their respective values.

**Example structure:**

```json
{
  "fi": {
    "item_name": "sotilaskypärä",
    "item_description": "sotilaskypärä musta, iso"
  },
  "en": {
    "item_name": "military helmet",
    "item_description": "military helmet black, large"
  }
}
```

### How DB Translations Are Used in the Frontend

- When fetching data, the API returns the `translations` field as part of the entity.
- The [`useTranslation`](frontend/src/hooks/useTranslation.ts) hook is used to select the correct language from the translations object.
- The hook checks for the current language and, if the translation is missing or empty, automatically falls back to Finnish (`fi`) by default. You can override this fallback by passing `"en"` as the second argument to `getTranslation`.

**Example usage:**

```ts
const { getTranslation, lang } = useTranslation();
const name = getTranslation(item); // Falls back to 'fi' if current language is missing
const nameEn = getTranslation(item, "en"); // Falls back to 'en' if needed
```

- This ensures the UI always displays a translation, preferring the current language but using the fallback if necessary.

### Querying Translations in the Database

To fetch translations for a specific language from the database, use a query like:

```sql
SELECT id, translations->'fi' AS finnish_content FROM storage_items WHERE is_active = TRUE;
```

See [docs/developers/backend/database-schema.md](docs/developers/backend/database-schema.md) for more details.

## 3. Usage in Components

- Use the [`useTranslation`](frontend/src/hooks/useTranslation.ts) hook to access translations in components.
- For static UI strings, use the translation modules directly:

  ```ts
  t.cart.empty.title[lang];
  ```

- For dynamic content from the database, use:

  ```ts
  const { getTranslation, lang } = useTranslation();
  const itemName = getTranslation(item)?.item_name;
  ```

- For translations that should include another value, use the replace function as following:

  ```ts
    titleOrg: {
      en: "Manage Users of {org}",
      fi: "Hallinnoi organisaation {org} käyttäjiä",
    },
  ```

  ```ts
  <p>{t.usersList.titleOrg[lang].replace("{org}", orgName)}</p>
  ```

## 4. Adding Translations

1. Add new keys to the relevant module file in [frontend/src/translations/modules/](frontend/src/translations/modules/).
2. Provide key/value pairs for all supported languages
3. Import the module in [frontend/src/translations/index.ts](frontend/src/translations/index.ts).

## 5. Naming Conventions

### File naming
Each new file should have its own translation module. The module should have the same naming as the file which uses it, but in camelCase

**Example:** The translations for a file called `ItemModal.tsx` would be called -> `itemModal.ts`

### Content Structure
The namings of the key/value pairs should ideally be after the contents of the page, for example all buttons should be under the same "buttons" key, or "labels" for labels, "placeholders" for placeholders, etc.
```ts
// Example
export const addCategory = {
  headings: {
    addNew: {
      en: "Add Category",
      fi: "Lisää kategoria",
    },
    update: {
      en: "Update Category",
      fi: "Päivitä kategoria",
    },
  },
  form: {
    nameFi: {
      en: "Name (fi)",
      fi: "Nimi (fi)",
    },
    nameEn: {
      en: "Name (en)",
      fi: "Nimi (en)",
    },
    parentCategory: {
      en: "Parent Category",
      fi: "Yläkategoria",
    },
  },
  messages: {
    update: {
      fail: {
        fi: "Kategorian päivitys epäonnistui",
        en: "Failed to update category",
      },
      success: {
        en: "Category was updated!",
        fi: "Kategoria päivitetty!",
      },
    },
    create: {
      fail: {
        en: "Failed to create category",
        fi: "Kategorian luominen epäonnistui",
      },
      success: {
        en: "Category was created!",
        fi: "Kategoria luotu!",
      },
    },
    general: {
      fi: "Jotain meni pieleen. Yritä uudelleen myöhemmin tai ota yhteyttä tukeen.",
      en: "Something went wrong. Try again later or contact support",
    },
    loading: {
      en: "Loading...",
      fi: "Ladataan...",
    },
  },
  buttons: {
    cancel: {
      fi: "Peruuta",
      en: "Cancel",
    },
    back: {
      fi: "Peruuta",
      en: "Back",
    },
    save: {
      fi: "Tallenna",
      en: "Save",
    },
  },
  placeholders: {
    noParent: {
      en: "No parent",
      fi: "Ei yläkategoriaa",
    },
  },
};

```


## 6. Checking Coverage

Run the translation checker script to ensure all UI strings are properly translated and highlight any hardcoded text that should be moved to translation files.

From the project root, run:

Default check (relaxed mode):

```sh
npm run check-translation
```

More aggressive detection (catches more, but may include false positives):

```sh
npm run check-translation:strict
```

**What is checked:**

- Every translation object in modules contains both `fi` and `en` keys.
- No hardcoded UI strings inside components.
