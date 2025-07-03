/** ----------  Shared helpers for paginated API responses  ---------- */
export interface PaginationMeta {
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  metadata: PaginationMeta;
}
