import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { LogMessage } from "@/types";
import { logsApi } from "@/api/services/logs";
import { extractErrorMessage } from "../utils/errorHandlers";

// Define the state interface
interface LogsState {
  logs: LogMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: LogsState = {
  logs: [],
  loading: false,
  error: null,
};

// Async thunk to fetch all logs
export const getAllLogs = createAsyncThunk<LogMessage[], string>(
  "logs/fetchAllLogs",
  async (userId, { rejectWithValue }) => {
    try {
      return await logsApi.getAllLogs(userId);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch all logs"),
      );
    }
  },
);

// Create the logs slice
const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(getAllLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectAllLogs = (state: RootState) => state.logs.logs;
export const selectLogsLoading = (state: RootState) => state.logs.loading;
export const selectLogsError = (state: RootState) => state.logs.error;

export default logsSlice.reducer;
