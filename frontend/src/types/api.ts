export type ApiResponse<T> = {
  data: T;
  metadata?: {
    total: number;
    page: number;
    totalPages: number;
  };
};