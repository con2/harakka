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

//Create a slice for organization state management
const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
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
      .addCase(
        createOrganization.fulfilled,
        (state: OrganizationState, action) => {
          state.organizations.unshift(action.payload);
        },
      )
      .addCase(
        updateOrganization.fulfilled,
        (state: OrganizationState, action) => {
          const index = state.organizations.findIndex(
            (org) => org.id === action.payload.id,
          );
          if (index !== -1) {
            state.organizations[index] = action.payload;
          }
          // optional:
          if (state.selectedOrganization?.id === action.payload.id) {
            state.selectedOrganization = action.payload;
          }
        },
      )
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.organizations = state.organizations.filter(
          (org) => org.id !== deletedId,
        );
        if (state.selectedOrganization?.id === deletedId) {
          state.selectedOrganization = null;
        }
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

export default organizationSlice.reducer;
