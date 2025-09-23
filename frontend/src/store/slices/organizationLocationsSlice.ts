import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { orgLocationsApi } from "@/api/services/organizationLocations";
import {
  OrgLocationInsert,
  OrgLocationUpdate,
  OrgLocationsState,
  CreateOrgLocationWithStorage,
  UpdateOrgLocationWithStorage,
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
 * Async thunk to fetch a specific org location by org ID
 */
export const fetchOrgLocationByOrgId = createAsyncThunk(
  "orgLocations/fetchLocByOrgId",
  async (id: string) => {
    const response = await orgLocationsApi.getOrgLocByOrgId(id);
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

/**
 * Async thunk to create a new org location with storage location
 */
export const createOrgLocationWithStorage = createAsyncThunk(
  "orgLocations/createWithStorage",
  async (data: CreateOrgLocationWithStorage) => {
    const response = await orgLocationsApi.createOrgLocWithStorage(data);
    return response;
  },
);

/**
 * Async thunk to update an org location with storage location
 */
export const updateOrgLocationWithStorage = createAsyncThunk(
  "orgLocations/updateWithStorage",
  async ({ id, data }: { id: string; data: UpdateOrgLocationWithStorage }) => {
    const response = await orgLocationsApi.updateOrgLocWithStorage(id, data);
    return response;
  },
);

/**
 * Async thunk to delete an org location with storage location
 */
export const deleteOrgLocationWithStorage = createAsyncThunk(
  "orgLocations/deleteWithStorage",
  async (id: string) => {
    await orgLocationsApi.deleteOrgLocWithStorage(id);
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
    clearOrgLocations: (state) => {
      state.orgLocations = [];
      state.currentOrgLocation = null;
      state.error = null;
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

      // Fetch org location by location ID
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
      // Fetch org locations by org ID
      .addCase(fetchOrgLocationByOrgId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrgLocationByOrgId.fulfilled, (state, action) => {
        state.loading = false;
        state.orgLocations = action.payload.data;
      })
      .addCase(fetchOrgLocationByOrgId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch org locations";
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
      })

      // Create org location with storage
      .addCase(createOrgLocationWithStorage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrgLocationWithStorage.fulfilled, (state, action) => {
        state.loading = false;
        state.orgLocations.push(action.payload);
      })
      .addCase(createOrgLocationWithStorage.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to create org location with storage";
      })

      // Update org location with storage
      .addCase(updateOrgLocationWithStorage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrgLocationWithStorage.fulfilled, (state, action) => {
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
      .addCase(updateOrgLocationWithStorage.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to update org location with storage";
      })

      // Delete org location with storage
      .addCase(deleteOrgLocationWithStorage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrgLocationWithStorage.fulfilled, (state, action) => {
        state.loading = false;
        state.orgLocations = state.orgLocations.filter(
          (orgLoc) => orgLoc.id !== action.payload,
        );
        if (state.currentOrgLocation?.id === action.payload) {
          state.currentOrgLocation = null;
        }
      })
      .addCase(deleteOrgLocationWithStorage.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to delete org location with storage";
      });
  },
});

export const {
  clearError,
  setCurrentPage,
  clearCurrentOrgLocation,
  clearOrgLocations,
} = orgLocationsSlice.actions;

// Selectors
export const selectOrgLocations = (state: RootState) =>
  state.orgLocations.orgLocations;
export const selectOrgLocationsLoading = (state: RootState) =>
  state.orgLocations.loading;
export const selectOrgLocationsError = (state: RootState) =>
  state.orgLocations.error;
export const selectCurrentOrgLocation = (state: RootState) =>
  state.orgLocations.currentOrgLocation;
export const selectOrgLocationsTotalPages = (state: RootState) =>
  state.orgLocations.totalPages;
export const selectOrgLocationsCurrentPage = (state: RootState) =>
  state.orgLocations.currentPage;

export default orgLocationsSlice.reducer;
