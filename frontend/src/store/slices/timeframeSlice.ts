import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface TimeframeState {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const initialState: TimeframeState = {
  startDate: undefined,
  endDate: undefined,
};

const timeframeSlice = createSlice({
  name: 'timeframe',
  initialState,
  reducers: {
    setTimeframe: (
      state,
      action: PayloadAction<{
        startDate: Date | undefined;
        endDate: Date | undefined;
      }>,
    ) => {
      if (action.payload.startDate !== undefined) {
        state.startDate = action.payload.startDate;
      }
      if (action.payload.endDate !== undefined) {
        state.endDate = action.payload.endDate;
      }
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
export const selectTimeframe = (state: RootState) => state.timeframe;

export default timeframeSlice.reducer;
