// define the row range to fetch
export function getPaginationRange(
  page: number,
  limit: number,
): { from: number; to: number } {
  // ensure valid numbers - safer fallback
  const safePage = Number.isFinite(page) && page > 0 ? page : 1; // at least 1
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10; // at least 10

  // calculations
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;
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
  const safeLimit = Math.max(1, limit); // prevent division by 0
  const totalPages = Math.ceil(total / safeLimit);
  const safePage = Math.max(1, page); // make sure page >= 1
  return { total, totalPages, page: safePage };
}
