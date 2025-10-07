/* eslint-disable @typescript-eslint/no-explicit-any */

import { CreateItemType } from "@common/items/form.types";
import { FieldErrors } from "react-hook-form";

/**
 * getFirstError
 * Utility for form validation
 * Will take the error object and return the first error it finds
 * @param obj useForm error object thrown onInvalidSubmit
 * @returns { field: string, type: string } | null
 */
export const getErrors = (
  obj: any,
  parentKey: string | null = null,
): { field: string; type: string } | null => {
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object") {
      // Found a validation error
      if ("type" in value && typeof value.type === "string") {
        return {
          field: parentKey ?? key,
          type: value.type,
        };
      }

      // Recurse deeper for nested objects
      const nested = getErrors(value, key);
      if (nested) return nested;
    }
  }

  return null;
};

export function countDeepestFields(
  validationErrors: FieldErrors<CreateItemType>,
) {
  let count = 0;
  if (
    typeof validationErrors !== "object" ||
    validationErrors === null ||
    Array.isArray(validationErrors)
  ) {
    return 0;
  }

  const keys = Object.keys(validationErrors);
  if (keys.includes("message") && keys.includes("type")) {
    return 1;
  }

  for (const key of keys) {
    const value = validationErrors[key as keyof typeof validationErrors];
    if (typeof value === "object" && value !== null) {
      if (value.message === "location") return (count += 1);
      count += countDeepestFields(value as typeof validationErrors);
    }
  }

  return count;
}
