/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * getFirstErrorMessage
 * Utility for form validation
 * Will take the error object and return the first error it finds
 * @param obj useForm error object thrown onInvalidSubmit
 * @returns
 */
export const getFirstErrorMessage = (obj: any): string | null => {
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      if ("message" in value && typeof value.message === "string") {
        return value.message;
      }
      const nested = getFirstErrorMessage(value);
      if (nested) return nested;
    }
  }
  return null;
};
