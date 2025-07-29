import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { orgLocationsApi } from "@/api/services/organizationLocations";
import {
  OrgLocationInsert,
  OrgLocationUpdate,
  OrgLocationsState,
} from "@/types/organizationLocation";

const initialState: OrgLocationsState = {
  orgLocations: [],
  currentOrgLocation: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
};

/**
 * Async thunk to fetch all org locations
 */
export const fetchAllOrgLocations = createAsyncThunk(
  "orgLocations/fetchAll",
  async ({
    orgId,
    pageSize = 10,
    currentPage = 1,
  }: {
    orgId: string;
    pageSize?: number;
    currentPage?: number;
  }) => {
    const response = await orgLocationsApi.getAllOrgLocs(
      orgId,
      pageSize,
      currentPage,
    );
    return response;
  },
);

/**
 * Async thunk to fetch a specific org location by ID
 */
export const fetchOrgLocationById = createAsyncThunk(
  "orgLocations/fetchById",
  async (id: string) => {
    const response = await orgLocationsApi.getOrgLocById(id);
    return response;
  },
);

/**
 * Async thunk to create a new org location
 */
export const createOrgLocation = createAsyncThunk(
  "orgLocations/create",
  async (orgLocationData: OrgLocationInsert) => {
    const response = await orgLocationsApi.createOrgLoc(orgLocationData);
    return response;
  },
);

/**
 * Async thunk to update an org location
 */
export const updateOrgLocation = createAsyncThunk(
  "orgLocations/update",
  async ({ id, data }: { id: string; data: OrgLocationUpdate }) => {
    const response = await orgLocationsApi.updateOrgLoc(id, data);
    return response;
  },
);

/**
 * Async thunk to delete an org location
 */
export const deleteOrgLocation = createAsyncThunk(
  "orgLocations/delete",
  async (id: string) => {
    await orgLocationsApi.deleteOrgLoc(id);
    return id;
  },
);

const orgLocationsSlice = createSlice({
  name: "orgLocations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearCurrentOrgLocation: (state) => {
      state.currentOrgLocation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all org locations
      .addCase(fetchAllOrgLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrgLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.orgLocations = action.payload.data;
        state.totalPages = action.payload.metadata.totalPages;
        state.currentPage = action.payload.metadata.page;
      })
      .addCase(fetchAllOrgLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch org locations";
      })

      // Fetch org location by ID
      .addCase(fetchOrgLocationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrgLocationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrgLocation = action.payload;
      })
      .addCase(fetchOrgLocationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch org location";
      })

      // Create org location
      .addCase(createOrgLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrgLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.orgLocations.push(action.payload);
      })
      .addCase(createOrgLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create org location";
      })

      // Update org location
      .addCase(updateOrgLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrgLocation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orgLocations.findIndex(
          (orgLoc) => orgLoc.id === action.payload.id,
        );
        if (index !== -1) {
          state.orgLocations[index] = action.payload;
        }
        if (state.currentOrgLocation?.id === action.payload.id) {
          state.currentOrgLocation = action.payload;
        }
      })
      .addCase(updateOrgLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update org location";
      })

      // Delete org location
      .addCase(deleteOrgLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrgLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.orgLocations = state.orgLocations.filter(
          (orgLoc) => orgLoc.id !== action.payload,
        );
        if (state.currentOrgLocation?.id === action.payload) {
          state.currentOrgLocation = null;
        }
      })
      .addCase(deleteOrgLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete org location";
      });
  },
});

export const { clearError, setCurrentPage, clearCurrentOrgLocation } =
  orgLocationsSlice.actions;

export default orgLocationsSlice.reducer;
