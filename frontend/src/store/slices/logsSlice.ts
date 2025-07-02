import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { LogMessage } from "@/types";
import { logsApi } from "@/api/services/logs";
import { extractErrorMessage } from "../utils/errorHandlers";

// Define the state interface
interface LogsState {
  logs: LogMessage[];
  total: number;
  totalPages: number;
  page: number;
  loading: boolean;
  error: string | null;
}

const initialState: LogsState = {
  logs: [],
  total: 0,
  totalPages: 0,
  page: 1,
  loading: false,
  error: null,
};

// Async thunk to fetch all logs
export const getAllLogs = createAsyncThunk<
  {
    data: LogMessage[];
    total: number;
    page: number;
    totalPages: number;
  },
  { page?: number; limit?: number }
>(
  "logs/fetchAllLogs",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await logsApi.getAllLogs(page, limit);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch all logs")
      );
    }
  }
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
        state.logs = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
      })
      .addCase(getAllLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectAllLogs = (state: RootState) => state.logs.logs;
export const selectLogsPagination = (state: RootState) => ({
  page: state.logs.page,
  total: state.logs.total,
  totalPages: state.logs.totalPages,
});
export const selectLogsLoading = (state: RootState) => state.logs.loading;
export const selectLogsError = (state: RootState) => state.logs.error;
export const selectLogsTotalCount = (state: RootState) => state.logs.total;

export default logsSlice.reducer;
