import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { tagsApi } from "../../api/services/tags";
import { RootState } from "../store";
import { CreateTagDto, TagAssignment, TagState, UpdateTagDto } from "@/types";
import { extractErrorMessage } from "@/store/utils/errorHandlers";

const initialState: TagState = {
  tags: [],
  loading: false,
  error: null,
  errorContext: null,
  selectedTags: [], // initialized as an empty array
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

// Async Thunks (API Calls)
/**
 * Fetches a paginated list of tags from the backend.
 *
 * @param {Object} [params={}]               Pagination options.
 * @param {number} [params.page=1]           The page number to retrieve (1‑based).
 * @param {number} [params.limit=10]         The maximum number of tags to return per page.
 * @param {string} [params.search]           The search term entered by the user.
 * @returns {AsyncThunk}                     A Redux Toolkit thunk that resolves to an object
 *                                          containing `data` (Tag[]) and `metadata`
 *                                          (pagination details).
 *
 * @example
 * ```ts
 * // Retrieve the second page with 25 tags per page
 * dispatch(fetchAllTags({ page: 2, limit: 25 }));
 * ```
 */
export const fetchAllTags = createAsyncThunk(
  "tags/fetchAllTags",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
    }: {
      page?: number;
      limit?: number;
      search?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      return await tagsApi.getAllTags(page, limit, search, "all");
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch tags"),
      );
    }
  },
);

/**
 * Fetches filtered tags from the backend.
 *
 * @param {Object} params                   Filtering and pagination options.
 * @param {number} params.page              The page number to retrieve (1‑based).
 * @param {number} params.limit             The maximum number of tags to return per page.
 * @param {string} params.search            The search term entered by the user.
 * @param {string} params.assignmentFilter  Filter by assignment status ("all", "assigned", "unassigned").
 * @param {string} params.sortBy            Field to sort by ("created_at", "updated_at").
 * @param {string} params.sortOrder         Sort order ("asc", "desc").
 * @returns {AsyncThunk}                    A Redux Toolkit thunk that resolves to an object
 *                                         containing `data` (Tag[]) and `metadata`
 *                                         (pagination details).
 */
export const fetchFilteredTags = createAsyncThunk(
  "tags/fetchFilteredTags",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
      assignmentFilter = "all",
      sortBy = "created_at",
      sortOrder = "desc",
      append = false,
    }: {
      page?: number;
      limit?: number;
      search?: string;
      assignmentFilter?: string;
      sortBy?: string;
      sortOrder?: "desc" | "asc";
      append?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      // Pass all parameters to the backend API
      const result = await tagsApi.getAllTags(
        page,
        limit,
        search,
        assignmentFilter,
        sortBy,
        sortOrder,
      );
      return { ...result, append };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch filtered tags"),
      );
    }
  },
);

// Create a new tag
export const createTag = createAsyncThunk(
  "tags/createTag",
  async (tag: CreateTagDto, { rejectWithValue }) => {
    try {
      return await tagsApi.createTag(tag);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to create tag"),
      );
    }
  },
);

// Update an existing tag
export const updateTag = createAsyncThunk(
  "tags/updateTag",
  async (
    { id, tagData }: { id: string; tagData: UpdateTagDto },
    { rejectWithValue },
  ) => {
    try {
      return await tagsApi.updateTag(id, tagData);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to update tag"),
      );
    }
  },
);

// Delete a tag
export const deleteTag = createAsyncThunk(
  "tags/deleteTag",
  async (id: string, { rejectWithValue }) => {
    try {
      await tagsApi.deleteTag(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to delete tag"),
      );
    }
  },
);

// Assign a tag to an item
export const assignTagToItem = createAsyncThunk(
  "tags/assignTagToItem",
  async ({ itemId, tagIds }: TagAssignment, { rejectWithValue }) => {
    try {
      await tagsApi.assignTagToItem(itemId, tagIds);
      return { itemId, tagIds };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to assign tags"),
      );
    }
  },
);

// Remove a tag from an item
export const removeTagFromItem = createAsyncThunk(
  "tags/removeTagFromItem",
  async (
    { itemId, tagId }: { itemId: string; tagId: string },
    { rejectWithValue },
  ) => {
    try {
      await tagsApi.removeTagFromItem(itemId, tagId);
      return { itemId, tagId };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to remove tag"),
      );
    }
  },
);

// Fetch tags for a specific item
export const fetchTagsForItem = createAsyncThunk(
  "tags/fetchTagsForItem",
  async (itemId: string, { rejectWithValue }) => {
    try {
      const data = await tagsApi.getTagsByItem(itemId);
      return data;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch tags for item"),
      );
    }
  },
);

export const tagSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    clearSelectedTags: (state) => {
      state.selectedTags = []; // Clear selected tags
      state.error = null;
      state.errorContext = null;
    },
    selectTag: (state, action) => {
      state.selectedTags = [action.payload]; // Assuming one tag can be selected at a time
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTags.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(fetchAllTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload.data;
        state.total = action.payload.metadata.total;
        state.page = action.payload.metadata.page;
        state.totalPages = action.payload.metadata.totalPages;
      })
      .addCase(fetchAllTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      .addCase(fetchFilteredTags.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(fetchFilteredTags.fulfilled, (state, action) => {
        state.loading = false;
        // If append is true, add new tags to existing ones, otherwise replace
        if (action.payload.append) {
          // Filter out duplicates by checking if tag.id already exists
          const existingIds = new Set(state.tags.map((tag) => tag.id));
          const newTags = action.payload.data.filter(
            (tag) => !existingIds.has(tag.id),
          );
          state.tags = [...state.tags, ...newTags];
        } else {
          state.tags = action.payload.data;
        }
        state.total = action.payload.metadata.total;
        state.page = action.payload.metadata.page;
        state.totalPages = action.payload.metadata.totalPages;
      })
      .addCase(fetchFilteredTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      .addCase(createTag.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags.push(action.payload);
      })
      .addCase(createTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "create";
      })
      .addCase(updateTag.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        const updatedTag = action.payload;
        if (state.selectedTags) {
          state.selectedTags = state.selectedTags.map((tag) =>
            tag.id === updatedTag.id ? updatedTag : tag,
          );
        }
        state.loading = false;
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "update";
      })
      .addCase(deleteTag.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        const tagId = action.payload;
        state.tags = state.tags.filter((tag) => tag.id !== tagId);
        state.selectedTags = state.selectedTags
          ? state.selectedTags.filter((tag) => tag.id !== tagId)
          : [];
        state.loading = false;
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "delete";
      })
      .addCase(assignTagToItem.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(assignTagToItem.fulfilled, (state, action) => {
        const { tagIds } = action.payload;
        state.selectedTags = state.tags.filter((tag) =>
          tagIds.includes(tag.id),
        );
        state.loading = false;
      })
      .addCase(assignTagToItem.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "assign";
      })
      .addCase(fetchTagsForItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTagsForItem.fulfilled, (state, action) => {
        state.selectedTags = action.payload; // Store the fetched tags in the Redux state
        state.loading = false;
      })
      .addCase(fetchTagsForItem.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "fetch";
        state.loading = false;
      })
      .addCase(removeTagFromItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeTagFromItem.fulfilled, (state, action) => {
        const { tagId } = action.payload;
        state.tags = state.tags.map((tag) => {
          if (tag.id === tagId) {
            return { ...tag, assignedTo: null }; // Assuming we want to clear the assignedTo property
          }
          return tag;
        });
        state.selectedTags = state.selectedTags
          ? state.selectedTags.filter((tag) => tag.id !== tagId)
          : []; // Remove the tag from selected tags
        state.loading = false;
      })
      .addCase(removeTagFromItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "delete";
      });
  },
});

// Selectors
export const selectAllTags = (state: RootState) => state.tags.tags;
export const selectTagsLoading = (state: RootState) => state.tags.loading;
export const selectError = (state: RootState) => state.tags.error;
export const selectSelectedTags = (state: RootState) => state.tags.selectedTags;
// Pagination data
export const selectTagsPage = (state: RootState) => state.tags.page;
export const selectTagsLimit = (state: RootState) => state.tags.limit;
export const selectTagsTotal = (state: RootState) => state.tags.total;
export const selectTagsTotalPages = (state: RootState) => state.tags.totalPages;

// Export actions
export const { clearSelectedTags, selectTag } = tagSlice.actions;

// Export the reducer
export default tagSlice.reducer;
