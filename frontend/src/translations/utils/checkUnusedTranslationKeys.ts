import { getAllComponents } from "./getAllComponents";
import { SUPPORTED_LANGUAGES_KEYS } from "../SUPPORTED_LANGUAGES";
import { t } from "../index.js";
import fs from "fs";

/**
 * Collects all translation keys from the translation object.
 */
function collectAllTranslationKeys(
  obj: unknown,
  pathArr: string[] = [],
): Set<string> {
  const keys = new Set<string>();

  if (typeof obj !== "object" || obj === null) return keys;

  const record = obj as Record<string, unknown>;
  const objKeys = Object.keys(record);

  // Check if this is a translation leaf node
  const isTranslationObj =
    SUPPORTED_LANGUAGES_KEYS.every((lang) => objKeys.includes(lang)) &&
    objKeys.length <= SUPPORTED_LANGUAGES_KEYS.length;

  if (isTranslationObj && pathArr.length > 0) {
    keys.add(pathArr.join("."));
    return keys;
  }

  // Recursively collect keys from nested objects
  for (const key of objKeys) {
    const nestedKeys = collectAllTranslationKeys(record[key], [
      ...pathArr,
      key,
    ]);
    nestedKeys.forEach((k) => keys.add(k));
  }
  return keys;
}

/**
 * Finds all used translation keys in the codebase.
 */
function findUsedTranslationKeys(): Set<string> {
  // Use getAllComponents to get all component files
  const componentFiles = getAllComponents();
  const files = componentFiles.map(({ fullPath }) => fullPath);

  const usedKeys = new Set<string>();
  const translationPattern1 =
    /t\.([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\[/g;
  const translationPattern2 =
    /t\.([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\?\.\[/g;
  const variableAssignmentPattern =
    /(?:const|let|var)\s+\w+\s*=\s*t\.([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)/g;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");
      let match;

      // Check for standard pattern: t.path.to.key[lang]
      while ((match = translationPattern1.exec(content)) !== null) {
        usedKeys.add(match[1]);
      }

      // Reset regex state and check for optional chaining pattern: t.path.to.key?.[lang]
      translationPattern2.lastIndex = 0;
      while ((match = translationPattern2.exec(content)) !== null) {
        usedKeys.add(match[1]);
      }

      // Reset regex state and check for variable assignments: const varName = t.path.to.key
      variableAssignmentPattern.lastIndex = 0;
      while ((match = variableAssignmentPattern.exec(content)) !== null) {
        usedKeys.add(match[1]);
      }
    } catch (error) {
      console.warn(`Warning: Could not read file ${file}:`, error);
    }
  }

  // When a parent object is assigned to a variable (e.g., const aliases = t.currentUserRoles.roleAliases),
  // mark all child keys as used if a parent key is used
  const allKeys = collectAllTranslationKeys(t);
  const parentKeys = Array.from(usedKeys);

  for (const parentKey of parentKeys) {
    // Find all child keys that start with this parent key
    for (const childKey of allKeys) {
      if (childKey.startsWith(parentKey + ".")) {
        usedKeys.add(childKey);
      }
    }
  }
  return usedKeys;
}

/**
 * Main util to check unused translation keys.
 */
export function checkUnusedTranslationKeys() {
  const allKeys = collectAllTranslationKeys(t);
  const usedKeys = findUsedTranslationKeys();

  // Filter out keys from common.ts module as they are used by other translation modules
  const unusedKeys = Array.from(allKeys).filter((key) => {
    // Exclude common module keys from unused detection
    if (key.startsWith("common.")) return false;
    return !usedKeys.has(key);
  });

  return {
    allKeys: Array.from(allKeys),
    usedKeys: Array.from(usedKeys),
    unusedKeys,
  };
}
