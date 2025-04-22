import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface TimeframeState {
  startDate: string | undefined;
  endDate: string | undefined;
}

const initialState: TimeframeState = {
  startDate: undefined,
  endDate: undefined,
};

const timeframeSlice = createSlice({
  name: "timeframe",
  initialState,
  reducers: {
    setTimeframe: (
      state,
      action: PayloadAction<{
        startDate: string | undefined;
        endDate: string | undefined;
      }>,
    ) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    clearTimeframe: (state) => {
      state.startDate = undefined;
      state.endDate = undefined;
    },
  },
});

// Actions:
export const { setTimeframe, clearTimeframe } = timeframeSlice.actions;

// Selectors:
export const selectTimeframe = (state: RootState) => ({
  startDate: state.timeframe.startDate
    ? new Date(state.timeframe.startDate)
    : undefined,
  endDate: state.timeframe.endDate
    ? new Date(state.timeframe.endDate)
    : undefined,
});

export default timeframeSlice.reducer;
