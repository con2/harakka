import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { itemImagesApi } from '@/api/services/itemImages';
import { ItemImage, UploadItemImageDto } from '@/types/storage';
import { RootState } from '../store';
import { ErrorContext } from '@/types/common';

interface ItemImagesState {
  images: ItemImage[];
  itemsWithLoadedImages: string[]; // Track which items have loaded images
  loading: boolean;
  error: string | null;
  currentItemId: string | null;
  errorContext: ErrorContext;
}

const initialState: ItemImagesState = {
  images: [],
  itemsWithLoadedImages: [], // Add this to track loaded items
  loading: false,
  error: null,
  currentItemId: null,
  errorContext: null,
};

export const getItemImages = createAsyncThunk(
  'itemImages/getItemImages',
  async (itemId: string, { rejectWithValue, getState }) => {
    try {
      // Optional: Check if we already have images for this item to avoid unnecessary fetches
      const state = getState() as RootState;
      if (state.itemImages.itemsWithLoadedImages.includes(itemId)) {
        // Return null to indicate we don't need to update the state
        return { images: null, itemId };
      }

      const images = await itemImagesApi.getItemImages(itemId);
      return { images, itemId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch item images',
      );
    }
  },
);

export const uploadItemImage = createAsyncThunk(
  'itemImages/uploadItemImage',
  async (
    {
      itemId,
      file,
      metadata,
    }: { itemId: string; file: File; metadata: UploadItemImageDto },
    { rejectWithValue },
  ) => {
    try {
      return await itemImagesApi.uploadItemImage(itemId, file, metadata);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to upload image',
      );
    }
  },
);

export const deleteItemImage = createAsyncThunk(
  'itemImages/deleteItemImage',
  async (imageId: string, { rejectWithValue, getState }) => {
    try {
      await itemImagesApi.deleteItemImage(imageId);
      return imageId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete image',
      );
    }
  },
);

const itemImagesSlice = createSlice({
  name: 'itemImages',
  initialState,
  reducers: {
    // Add a reducer to reset the state when needed (e.g., on logout)
    resetItemImages: (state) => {
      state.images = [];
      state.itemsWithLoadedImages = [];
      state.loading = false;
      state.error = null;
      state.currentItemId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Item Images
      .addCase(getItemImages.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentItemId = action.meta.arg;
      })
      .addCase(getItemImages.fulfilled, (state, action) => {
        state.loading = false;

        // If we received actual images, add them to the state
        if (action.payload.images) {
          // Filter out any existing images for this item to avoid duplicates
          const otherImages = state.images.filter(
            (img) => img.item_id !== action.payload.itemId,
          );

          // Add the new images to the state
          state.images = [...otherImages, ...action.payload.images];

          // Mark this item as having loaded images
          if (!state.itemsWithLoadedImages.includes(action.payload.itemId)) {
            state.itemsWithLoadedImages.push(action.payload.itemId);
          }
        }
      })
      .addCase(getItemImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Upload Item Image - Fix this to update the correct item's images
      .addCase(uploadItemImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadItemImage.fulfilled, (state, action) => {
        state.loading = false;
        state.images.push(action.payload);

        // Make sure we track this item
        if (!state.itemsWithLoadedImages.includes(action.payload.item_id)) {
          state.itemsWithLoadedImages.push(action.payload.item_id);
        }
      })
      .addCase(uploadItemImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Item Image - This should remain mostly the same
      .addCase(deleteItemImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItemImage.fulfilled, (state, action) => {
        state.loading = false;
        state.images = state.images.filter(
          (image) => image.id !== action.payload,
        );
      })
      .addCase(deleteItemImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetItemImages } = itemImagesSlice.actions;

// Selector to get images for a specific item
export const selectItemImagesById = (state: RootState, itemId: string) =>
  state.itemImages.images.filter((img) => img.item_id === itemId);

// Existing selectors
export const selectItemImages = (state: RootState) => state.itemImages.images;
export const selectItemImagesLoading = (state: RootState) =>
  state.itemImages.loading;
export const selectItemImagesError = (state: RootState) =>
  state.itemImages.error;
export const selectCurrentItemId = (state: RootState) =>
  state.itemImages.currentItemId;

export default itemImagesSlice.reducer;
