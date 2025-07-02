export type PaginationMeta = {
  total: number;
  page: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  data: T;
  metadata?: PaginationMeta;
};