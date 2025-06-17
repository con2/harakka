import { ErrorContext } from "./common";

/**
 * Timeframe state in Redux store
 */
export interface TimeframeState {
  startDate?: string;
  endDate?: string;
  loading: boolean;
  error: string | null;
  errorContext: ErrorContext;
}
