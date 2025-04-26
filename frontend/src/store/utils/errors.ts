/**
 * Standard API error response data structure
 */
export interface ApiErrorData {
  message?: string;
  code?: string | number;
  errors?: Record<string, string[]>;
  details?: unknown;
  [key: string]: unknown; // Allow for additional properties
}

export class ApiError extends Error {
  status: number;
  data?: ApiErrorData;

  constructor(message: string, status: number = 500, data?: ApiErrorData) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class AuthError extends Error {
  constructor(message: string = "Authentication failed") {
    super(message);
    this.name = "AuthError";
  }
}
