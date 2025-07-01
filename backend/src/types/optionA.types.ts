/**
 * ApiResponse Type either successfully returns an object with data and a message
 * Or returns an error
 */
export type ApiResponse<T> =
  | {
      data: T;
      message: string;
      error: null;
    }
  | {
      error: Error;
      data: null;
      message: string;
    };
