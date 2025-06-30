// define the row range to fetch
// Add a negative page number error/check here??
export function getPaginationRange(
  page: number,
  limit: number,
): { from: number; to: number } {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}

export function getPaginationMeta(
  count: number | null,
  page: number,
  limit: number,
): {
  total: number;
  totalPages: number;
  page: number;
} {
  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);
  return { total, totalPages, page };
}
