import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { LocationDetails } from "@/types";
import { locationsApi } from "../../api/services/locations";

// Define the state interface
interface LocationsState {
  locations: LocationDetails[];
  loading: boolean;
  error: string | null;
}

const initialState: LocationsState = {
  locations: [],
  loading: false,
  error: null,
};

// Async thunk to fetch all locations
export const fetchAllLocations = createAsyncThunk(
  "locations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await locationsApi.getAllLocations();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch locations",
      );
    }
  },
);

// Create the locations slice
const locationsSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchAllLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectAllLocations = (state: RootState) =>
  state.locations.locations;
export const selectLocationsLoading = (state: RootState) =>
  state.locations.loading;
export const selectLocationsError = (state: RootState) => state.locations.error;

export default locationsSlice.reducer;
