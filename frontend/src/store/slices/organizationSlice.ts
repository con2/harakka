//import { Organization } from "@common/role.types";
import { extractErrorMessage } from "../utils/errorHandlers";
import { organizationApi } from "@/api/services/organizations";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { OrganizationDetails } from "@/types/organization";
import { RootState } from "../store";

/**
 * Initial state
 */
const initialState: OrganizationDetails = {
  organizations: [],
  total: 0,
  page: 1,
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
      });
  },
});

//Selectors
export const selectOrganizations = (state: RootState) =>
  state.organization.organizations;
export const selectOrganizationLoading = (state: RootState) =>
  state.organization.loading;
export const selectOrganizationError = (state: RootState) =>
  state.organization.error;

export default organizationSlice.reducer;
