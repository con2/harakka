/** ----------  Shared helpers for paginated API responses  ---------- */
export interface PaginationMeta {
  total: number;
  page: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T;
  metadata: PaginationMeta;
}
