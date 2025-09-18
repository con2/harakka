import { extractErrorMessage } from "../utils/errorHandlers";
import { organizationApi } from "@/api/services/organizations";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { OrganizationDetails, OrganizationState } from "@/types/organization";
import { RootState } from "../store";

/**
 * Initial state
 */
const initialState: OrganizationState = {
  organizations: [],
  selectedOrganization: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  loading: false,
  error: null,
  count: 0,
};

/**
 * Thunks
 */

/**
 * Fetches a paginated list of storage organizations from the backend.
 *
 * @param {Object} [params={}]               Pagination options.
 * @param {number} [params.page=1]           The page number to retrieve (1‑based).
 * @param {number} [params.limit=10]         The maximum number of organizations to return per page.
 * @returns {AsyncThunk}                     A Redux Toolkit thunk that resolves to an object
 *                                          containing `data` (LocationDetails[]) plus pagination
 *                                          keys (`total`, `page`, `totalPages`).
 *
 * @example
 * ```ts
 * // Fetch organizations, first page, 50 per page
 * dispatch(fetchAllOrganizations({ page: 1, limit: 50 }));
 * ```
 */
export const fetchAllOrganizations = createAsyncThunk(
  "organizations/fetchAllOrganizations",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      return await organizationApi.getAllOrganizations(page, limit);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch organizations"),
      );
    }
  },
);

export const fetchOrganizationById = createAsyncThunk(
  "organizations/fetchOrganizationById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await organizationApi.getOrganizationById(id);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch organization details"),
      );
    }
  },
);

export const fetchOrganizationBySlug = createAsyncThunk(
  "organizations/fetchOrganizationBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      return await organizationApi.getOrganizationBySlug(slug);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch organization by slug"),
      );
    }
  },
);

export const createOrganization = createAsyncThunk(
  "organizations/createOrganization",
  async (data: Partial<OrganizationDetails>, { rejectWithValue }) => {
    try {
      return await organizationApi.createOrganization(data);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to create organization"),
      );
    }
  },
);

export const updateOrganization = createAsyncThunk(
  "organizations/updateOrganization",
  async (
    { id, data }: { id: string; data: Partial<OrganizationDetails> },
    { rejectWithValue },
  ) => {
    try {
      return await organizationApi.updateOrganization(id, data);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to update organization"),
      );
    }
  },
);

export const deleteOrganization = createAsyncThunk(
  "organizations/deleteOrganization",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await organizationApi.deleteOrganization(id);
      return response.id;
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to delete organization"),
      );
    }
  },
);

export const softDeleteOrganization = createAsyncThunk(
  "organizations/softDeleteOrganization",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await organizationApi.softDeleteOrganization(id);
      return response.id;
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to delete organization"),
      );
    }
  },
);

export const uploadOrganizationLogo = createAsyncThunk<
  { id: string; url: string },
  { id: string; file: File },
  { rejectValue: string }
>(
  "organizations/uploadOrganizationLogo",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      // Destructure to get the string url, NOT the whole object
      const { url } = await organizationApi.uploadOrganizationLogo(id, file);
      return { id, url };
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to upload logo picture"),
      );
    }
  },
);

export const getOrganizationsCount = createAsyncThunk(
  "organizations/getOrganizationsCount",
  async () => {
    const res = await organizationApi.getOrganizationsCount();
    return res.count;
  },
);

//Create a slice for organization state management
const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setSelectedOrganization(state, action) {
      state.selectedOrganization = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload.data!;
        state.total = action.payload.metadata.total;
        state.page = action.payload.metadata.page;
        state.totalPages = action.payload.metadata.totalPages;
      })
      .addCase(fetchAllOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrganizationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrganization = action.payload;
      })
      .addCase(fetchOrganizationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrganizationBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrganization = action.payload;
      })
      .addCase(fetchOrganizationBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        updateOrganization.fulfilled,
        (state: OrganizationState, action) => {
          // Only update selectedOrganization if needed
          if (state.selectedOrganization?.id === action.payload.id) {
            state.selectedOrganization = action.payload;
          }
        },
      )
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        const deletedId = action.payload;
        // Remove from current page's organizations list
        state.organizations = state.organizations.filter(
          (org) => org.id !== deletedId,
        );
        if (state.selectedOrganization?.id === deletedId) {
          state.selectedOrganization = null;
        }
      })
      .addCase(softDeleteOrganization.fulfilled, (state, action) => {
        const deletedId = action.payload;
        // Remove from current page's organizations list
        state.organizations = state.organizations.filter(
          (org) => org.id !== deletedId,
        );
        if (state.selectedOrganization?.id === deletedId) {
          state.selectedOrganization = null;
        }
      })
      // upload logo picture
      .addCase(uploadOrganizationLogo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadOrganizationLogo.fulfilled, (state, action) => {
        state.loading = false;
        const { id, url } = action.payload;
        if (
          state.selectedOrganization &&
          state.selectedOrganization.id === id
        ) {
          state.selectedOrganization.logo_picture_url = url;
        }
        // Also update the list entry if present
        const idx = state.organizations.findIndex((o) => o.id === id);
        if (idx !== -1) {
          state.organizations[idx].logo_picture_url = url;
        }
      })
      .addCase(uploadOrganizationLogo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // get organizations count
      .addCase(getOrganizationsCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizationsCount.fulfilled, (state, action) => {
        state.loading = false;
        state.count = action.payload ?? 0;
      })
      .addCase(getOrganizationsCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

//Selectors
export const selectOrganizations = (state: RootState) =>
  state.organizations.organizations;
export const selectOrganizationLoading = (state: RootState) =>
  state.organizations.loading;
export const selectOrganizationError = (state: RootState) =>
  state.organizations.error;
export const selectedOrganization = (state: RootState) =>
  state.organizations.selectedOrganization;
export const selectTotalOrganizationsCount = (state: RootState) =>
  state.organizations.count ?? 0;
export const { setSelectedOrganization } = organizationSlice.actions;

export default organizationSlice.reducer;
