/**
 * Utility function to handle empty or null values in table cells
 * Returns a default placeholder for empty values
 */
export const formatCellValue = (
  value: unknown,
  placeholder: string = "–",
): string => {
  // Check for null, undefined, empty string, or whitespace-only strings
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return placeholder;
  }

  // Check for arrays and objects that might be empty
  if (Array.isArray(value) && value.length === 0) {
    return placeholder;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    Object.keys(value).length === 0
  ) {
    return placeholder;
  }

  // For numbers, check if it's NaN
  if (typeof value === "number" && isNaN(value)) {
    return placeholder;
  }

  // Handle different types appropriately
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (typeof value === "boolean") {
    return value.toString();
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }

  // Fallback for other types
  return placeholder;
};
