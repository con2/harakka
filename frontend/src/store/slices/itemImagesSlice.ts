import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { itemImagesApi } from "@/api/services/itemImages";
import {
  FileWithMetadata,
  ItemImage,
  UploadItemImageDto,
} from "@/types/storage";
import { RootState } from "../store";
import { ErrorContext } from "@/types/common";
import { extractErrorMessage } from "../utils/errorHandlers";

interface ItemImagesState {
  images: ItemImage[];
  itemsWithLoadedImages: string[]; // Track which items have loaded images
  loading: boolean;
  error: string | null;
  currentItemId: string | null;
  errorContext: ErrorContext;
  uploadedImages: {
    imageType?: string;
    urls: string[];
    full_paths: string[];
    paths: string[];
  };
}

const initialState: ItemImagesState = {
  images: [],
  itemsWithLoadedImages: [], // Add this to track loaded items
  loading: false,
  error: null,
  currentItemId: null,
  errorContext: null,
  uploadedImages: {
    full_paths: [],
    paths: [],
    urls: [],
  },
};

export const getItemImages = createAsyncThunk(
  "itemImages/getItemImages",
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
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch item images"),
      );
    }
  },
);

export const uploadToBucket = createAsyncThunk(
  "itemImages/uploadToBucket",
  async (
    {
      files,
      bucket,
      path,
    }: {
      files: File[];
      bucket: string;
      path?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      return await itemImagesApi.uploadToBucket(files, bucket, path);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to upload image"),
      );
    }
  },
);

export const removeFromBucket = createAsyncThunk(
  "itemImages/removeFromBucket",
  async (
    {
      bucket,
      paths,
    }: {
      bucket: string;
      paths: string[];
    },
    { rejectWithValue },
  ) => {
    try {
      return await itemImagesApi.removeFromBucket(bucket, paths);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to upload image"),
      );
    }
  },
);

export const uploadItemImageModal = createAsyncThunk(
  "itemImages/uploadItemImageModal",
  async (
    {
      itemId,
      file,
      metadata,
    }: { itemId: string; file: File; metadata: UploadItemImageDto },
    { rejectWithValue },
  ) => {
    try {
      return await itemImagesApi.uploadItemImageModal(itemId, file, metadata);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to upload image"),
      );
    }
  },
);

export const uploadItemImages = createAsyncThunk(
  "itemImages/uploadItemImage",
  async (
    { itemId, files }: { itemId: string; files: FileWithMetadata[] },
    { rejectWithValue },
  ) => {
    try {
      return await itemImagesApi.uploadItemImages(itemId, files);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to upload image"),
      );
    }
  },
);

export const deleteItemImage = createAsyncThunk(
  "itemImages/deleteItemImage",
  async (imageId: string, { rejectWithValue }) => {
    try {
      await itemImagesApi.deleteItemImage(imageId);
      return imageId;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to delete image"),
      );
    }
  },
);

const itemImagesSlice = createSlice({
  name: "itemImages",
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
    setUploadImageType: (state, action) => {
      state.uploadedImages.imageType = action.payload;
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
      .addCase(uploadItemImageModal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadItemImageModal.fulfilled, (state, action) => {
        state.loading = false;
        state.images.push(action.payload);
        // Make sure we track this item
        if (!state.itemsWithLoadedImages.includes(action.payload.item_id)) {
          state.itemsWithLoadedImages.push(action.payload.item_id);
        }
      })
      .addCase(uploadItemImageModal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Upload to bucket
      .addCase(uploadToBucket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadToBucket.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedImages = {
          ...state.uploadedImages,
          urls: action.payload.urls,
          full_paths: action.payload.full_paths,
          paths: action.payload.paths,
        };
      })
      .addCase(uploadToBucket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Remove from bucket
      .addCase(removeFromBucket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromBucket.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFromBucket.rejected, (state, action) => {
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

export const { resetItemImages, setUploadImageType } = itemImagesSlice.actions;

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
export const selectUploadUrls = (state: RootState) =>
  state.itemImages.uploadedImages;

export default itemImagesSlice.reducer;
