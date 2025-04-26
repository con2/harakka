import { ApiErrorResponse } from "../../types";

/**
 * Extract readable message from API errors
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage: string,
): string {
  if (!error) return defaultMessage;

  const apiError = error as ApiErrorResponse;
  return apiError.response?.data?.message || apiError.message || defaultMessage;
}

/**
 * Create a standard error handler for async thunks
 */
export function createThunkErrorHandler(defaultMessage: string) {
  return (error: unknown) => extractErrorMessage(error, defaultMessage);
}
