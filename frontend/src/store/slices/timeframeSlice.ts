import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { TimeframeState, ErrorContext } from "@/types";

// Load timeframe from localStorage (if available)
const loadTimeframeFromStorage = (): TimeframeState => {
  try {
    const timeframeData = localStorage.getItem("timeframe");
    if (timeframeData) {
      return JSON.parse(timeframeData);
    }
  } catch (e) {
    console.error("Error loading timeframe from localStorage:", e);
  }
  // Default state if nothing in localStorage
  return {
    startDate: undefined,
    endDate: undefined,
    loading: false,
    error: null,
    errorContext: null,
  };
};

// Function to save cart to localStorage
const saveTimeframeToStorage = (
  startDate: string | undefined,
  endDate: string | undefined,
) => {
  try {
    localStorage.setItem(
      "timeframe",
      JSON.stringify({
        startDate,
        endDate,
        loading: false,
        error: null,
        errorContext: null,
      }),
    );
  } catch (e) {
    console.error("Error saving timeframe to localStorage:", e);
  }
};

/**
 * Initial state for timeframe slice
 */
const initialState: TimeframeState = loadTimeframeFromStorage();

const timeframeSlice = createSlice({
  name: "timeframe",
  initialState,
  reducers: {
    /**
     * Set timeframe dates
     */
    setTimeframe: (
      state,
      action: PayloadAction<{
        startDate: string | undefined;
        endDate: string | undefined;
      }>,
    ) => {
      state.error = null;
      state.errorContext = null;
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;

      // Save to localStorage
      saveTimeframeToStorage(state.startDate, state.endDate);
    },

    /**
     * Clear timeframe
     */
    clearTimeframe: (state) => {
      state.startDate = undefined;
      state.endDate = undefined;
      state.error = null;
      state.errorContext = null;

      // Save to localStorage
      saveTimeframeToStorage(undefined, undefined);
    },

    /**
     * Set loading state
     */
    setTimeframeLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set error with context
     */
    setTimeframeError: (
      state,
      action: PayloadAction<{ message: string | null; context: ErrorContext }>,
    ) => {
      state.error = action.payload.message;
      state.errorContext = action.payload.context;
    },

    /**
     * Clear error state
     */
    clearTimeframeError: (state) => {
      state.error = null;
      state.errorContext = null;
    },
  },
});

// Actions:
export const {
  setTimeframe,
  clearTimeframe,
  setTimeframeLoading,
  setTimeframeError,
  clearTimeframeError,
} = timeframeSlice.actions;

// Selectors:
export const selectTimeframe = (state: RootState) => ({
  startDate: state.timeframe.startDate
    ? new Date(state.timeframe.startDate)
    : undefined,
  endDate: state.timeframe.endDate
    ? new Date(state.timeframe.endDate)
    : undefined,
});

export const selectTimeframeLoading = (state: RootState) =>
  state.timeframe.loading;
export const selectTimeframeError = (state: RootState) => state.timeframe.error;
export const selectTimeframeErrorContext = (state: RootState) =>
  state.timeframe.errorContext;
export const selectTimeframeErrorWithContext = (state: RootState) => ({
  message: state.timeframe.error,
  context: state.timeframe.errorContext,
});

export default timeframeSlice.reducer;
