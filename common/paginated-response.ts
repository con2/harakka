type PaginatedResponse<T> = {
  data: T[];
  count: number;
  metadata: {
    page: number;
    totalPages: number;
    limit: number;
  };
};
