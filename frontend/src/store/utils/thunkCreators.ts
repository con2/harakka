import { createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Creates a standardized async thunk for API calls
 * @param typePrefix The Redux action type prefix
 * @param apiCall The API function to call
 * @param errorMessage Default error message
 * @param transformResponse Optional function to transform the API response
 */
export function createApiThunk<ReturnType, ArgType = void>(
  typePrefix: string,
  apiCall: (arg: ArgType) => Promise<any>,
  errorMessage: string,
  transformResponse?: (response: any, arg: ArgType) => ReturnType,
) {
  return createAsyncThunk<ReturnType, ArgType, { rejectValue: string }>(
    typePrefix,
    async (arg, { rejectWithValue }) => {
      try {
        const response = await apiCall(arg);
        if (transformResponse) {
          return transformResponse(response, arg);
        }
        // Default handling - cast as the expected return type
        return response as unknown as ReturnType;
      } catch (error: unknown) {
        console.error(`API Error in ${typePrefix}:`, error);
        if (error instanceof Error) {
          return rejectWithValue(error.message || errorMessage);
        }
        return rejectWithValue(errorMessage);
      }
    },
  );
}
