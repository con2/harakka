/**
 * Returns an ISO date string (YYYY-MM-DD) for today with an optional offset in days.
 * @param daysOffset Number of days to add (positive) or subtract (negative) from today. Default is 0 (today).
 * @returns ISO date string in format YYYY-MM-DD
 */

export function getDateISO(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
