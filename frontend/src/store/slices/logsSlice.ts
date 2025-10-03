import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
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
  filters: {
    level?: string;
    logType?: "audit" | "system";
    search?: string;
  };
}

const initialState: LogsState = {
  logs: [],
  total: 0,
  totalPages: 0,
  page: 1,
  loading: false,
  error: null,
  filters: {},
};

// Async thunk to fetch all logs
export const getAllLogs = createAsyncThunk<
  {
    data: LogMessage[];
    total: number;
    page: number;
    totalPages: number;
  },
  {
    page?: number;
    limit?: number;
    level?: string;
    logType?: "audit" | "system";
    search?: string;
  }
>(
  "logs/fetchAllLogs",
  async (
    { page = 1, limit = 10, level, logType, search },
    { rejectWithValue },
  ) => {
    try {
      return await logsApi.getAllLogs(page, limit, level, logType, search);
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
        state.logs = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.filters = {
          level: action.meta.arg.level,
          logType: action.meta.arg.logType,
          search: action.meta.arg.search,
        };
      })
      .addCase(getAllLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
const selectLogsState = (state: RootState) => state.logs;
export const selectAllLogs = (state: RootState) => state.logs.logs;
export const selectLogsPagination = createSelector(
  [selectLogsState],
  (logs) => ({
    page: logs.page,
    total: logs.total,
    totalPages: logs.totalPages,
  }),
);
export const selectLogsLoading = (state: RootState) => state.logs.loading;
export const selectLogsError = (state: RootState) => state.logs.error;
export const selectLogsTotalCount = (state: RootState) => state.logs.total;

export default logsSlice.reducer;
