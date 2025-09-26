import { SUPPORTED_LANGUAGES_KEYS } from "../SUPPORTED_LANGUAGES";

export interface TranslationIssue {
  path: string;
  issue: string;
  value?: unknown;
}

function isTranslationLeaf(obj: unknown): boolean {
  if (typeof obj !== "object" || obj === null) return false;
  const keys = Object.keys(obj as Record<string, unknown>);
  // Explicitly cast `lang` to the union type
  return keys.some((lang) => SUPPORTED_LANGUAGES_KEYS.includes(lang));
}

export function checkTranslationObjectStructure(
  obj: unknown,
  pathArr: string[] = [],
): TranslationIssue[] {
  let issues: TranslationIssue[] = [];

  if (typeof obj !== "object" || obj === null) {
    issues.push({
      path: pathArr.join("."),
      issue: "Expected translation object, found string or non-object",
      value: obj,
    });
    return issues;
  }

  const keys = Object.keys(obj as Record<string, unknown>);

  if (isTranslationLeaf(obj)) {
    // If keys do not match SUPPORTED_LANGUAGES, report which are missing
    const missingLangs = SUPPORTED_LANGUAGES_KEYS.filter(
      (lang) => !keys.includes(lang),
    );
    if (missingLangs.length > 0) {
      issues.push({
        path: pathArr.join("."),
        issue: `Translation object missing languages: ${missingLangs.join(", ")}`,
      });
    }

    // --- Required checks below ---
    const translations = SUPPORTED_LANGUAGES_KEYS.map((lang) => {
      return (
        obj as Record<(typeof SUPPORTED_LANGUAGES_KEYS)[number], unknown>
      )[lang] as string;
    }).filter((t) => typeof t === "string" && t.length > 0);

    if (translations.length >= 2) {
      const lengths = translations.map((t) => t.length);
      const minLength = Math.min(...lengths);
      const maxLength = Math.max(...lengths);
      if (minLength > 0 && maxLength / minLength > 3) {
        issues.push({
          path: pathArr.join("."),
          issue: `Significant length disparity between translations (${minLength} vs ${maxLength} chars)`,
        });
      }

      const uniqueTranslations = new Set(translations);
      if (uniqueTranslations.size === 1) {
        issues.push({
          path: pathArr.join("."),
          issue: "All translations are identical - possible copy-paste error",
        });
      }

      const placeholderPattern = /\{[^}]+\}|\$\{[^}]+\}/g;
      const placeholderCounts = translations.map((t) => {
        const matches = t.match(placeholderPattern);
        return matches ? matches.length : 0;
      });
      if (new Set(placeholderCounts).size > 1) {
        issues.push({
          path: pathArr.join("."),
          issue: "Inconsistent placeholder count between translations",
        });
      }
    }

    return issues;
  }

  // Only check key format and recurse for non-leaf objects
  for (const key of keys) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
      issues.push({
        path: [...pathArr, key].join("."),
        issue: "Key name should use camelCase or snake_case format",
      });
    }
    issues = issues.concat(
      checkTranslationObjectStructure((obj as Record<string, unknown>)[key], [
        ...pathArr,
        key,
      ]),
    );
  }
  return issues;
}
