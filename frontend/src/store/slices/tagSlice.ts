import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { tagsApi } from "../../api/services/tags";
import { RootState } from "../store";
import {
  CreateTagDto,
  Tag,
  TagAssignment,
  TagState,
  UpdateTagDto,
} from "@/types";
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
// get all tags
export const fetchAllTags = createAsyncThunk(
  "tags/fetchAllTags",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      return await tagsApi.getAllTags(page, limit);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch tags"),
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
    selectTag: (state, action: PayloadAction<Tag>) => {
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
        state.tags = state.tags.map((tag) =>
          tag.id === action.payload.id ? action.payload : tag,
        );
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
export const selectLoading = (state: RootState) => state.tags.loading;
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
