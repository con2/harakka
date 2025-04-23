import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'; 
import { tagsApi } from '../../api/services/tags'; 
import { Tag, TagState } from '../../types/tag'; 
import { RootState } from '../store'; 

const initialState: TagState = {
  tags: [],
  loading: false,
  error: null,
  selectedTags: [], // initialized as an empty array
};

// Async Thunks (API Calls)
// get all tags
export const fetchAllTags = createAsyncThunk(
  'tags/fetchAllTags',
  async (_, { rejectWithValue }) => {
    try {
      return await tagsApi.getAllTags();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tags');
    }
  }
);

// Create a new tag
export const createTag = createAsyncThunk(
  'tags/createTag',
  async (tag: Partial<Tag>, { rejectWithValue }) => {
    try {
      return await tagsApi.createTag(tag);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create tag');
    }
  }
);

// Update an existing tag
export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async ({ id, tagData }: { id: string; tagData: Partial<Tag> }, { rejectWithValue }) => {
    try {
      return await tagsApi.updateTag(id, tagData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tag');
    }
  }
);

// Delete a tag
export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (id: string, { rejectWithValue }) => {
    try {
      await tagsApi.deleteTag(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to delete tag');
    }
  }
);

// Assign a tag to an item
export const assignTagToItem = createAsyncThunk(
  'tags/assignTagToItem',
  async ({ itemId, tagIds }: { itemId: string; tagIds: string[] }, { rejectWithValue }) => {
    try {
      await tagsApi.assignTagToItem(itemId, tagIds);
      return { itemId, tagIds };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign tags');
    }
  }
);

// Remove a tag from an item
export const removeTagFromItem = createAsyncThunk(
  'tags/removeTagFromItem',
  async ({ itemId, tagId }: { itemId: string; tagId: string }, { rejectWithValue }) => {
    try {
      await tagsApi.removeTagFromItem(itemId, tagId);
      return { itemId, tagId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove tag');
    }
  }
);

// Fetch tags for a specific item
export const fetchTagsForItem = createAsyncThunk(
  'tags/fetchTagsForItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const data = await tagsApi.getTagsByItem(itemId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch tags for item');
    }
  }
);

export const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearSelectedTags: (state) => {
      state.selectedTags = []; // Clear selected tags
      state.error = null;
    },
    selectTag: (state, action: PayloadAction<Tag>) => {
      state.selectedTags = [action.payload]; // Assuming one tag can be selected at a time
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All tags
      .addCase(fetchAllTags.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchAllTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // create a new tag
      .addCase(createTag.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.tags.push(action.payload);
      })
      .addCase(createTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      // update tag
      .addCase(updateTag.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        state.tags = state.tags.map((tag) =>
          tag.id === action.payload.id ? action.payload : tag
        );
        state.loading = false;
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      //delete tag
      .addCase(deleteTag.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        const tagId = action.payload;
        state.tags = state.tags.filter((tag) => tag.id !== tagId);
        state.selectedTags = state.selectedTags ? state.selectedTags.filter((tag) => tag.id !== tagId) : [];
        state.loading = false;
      })      
      .addCase(deleteTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // assign tag to item
      .addCase(assignTagToItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignTagToItem.fulfilled, (state, action) => {
        state.loading = false;
        const { tagIds } = action.payload;
        state.selectedTags = state.tags.filter((tag) => tagIds.includes(tag.id));
      })      
      .addCase(assignTagToItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // fetch tags for item
      .addCase(fetchTagsForItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTagsForItem.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTags = action.payload; // Store the fetched tags in the Redux state
      })
      .addCase(fetchTagsForItem.rejected, (state, action) => {
        state.error = action.payload as string | null;
      })
      // remove tag from item
      .addCase(removeTagFromItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeTagFromItem.fulfilled, (state, action) => {
        const { itemId, tagId } = action.payload;
        state.tags = state.tags.map((tag) => {
          if (tag.id === tagId) {
            return { ...tag, assignedTo: null }; // Assuming we want to clear the assignedTo property
          }
          return tag;
        });
        state.selectedTags = state.selectedTags ? state.selectedTags.filter((tag) => tag.id !== tagId) : []; // Remove the tag from selected tags
        state.loading = false;
      })
      .addCase(removeTagFromItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Selectors
export const selectAllTags = (state: RootState) => state.tags.tags;
export const selectLoading = (state: RootState) => state.tags.loading;
export const selectError = (state: RootState) => state.tags.error;
export const selectSelectedTags = (state: RootState) => state.tags.selectedTags;

// Export actions
export const { clearSelectedTags, selectTag } = tagSlice.actions;

// Export the reducer
export default tagSlice.reducer;