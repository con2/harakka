import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  itemImagesApi,
  ItemImage,
  UploadItemImageDto,
} from '@/api/services/itemImages';
import { RootState } from '../store';

interface ItemImagesState {
  images: ItemImage[];
  loading: boolean;
  error: string | null;
  currentItemId: string | null;
}

const initialState: ItemImagesState = {
  images: [],
  loading: false,
  error: null,
  currentItemId: null,
};

export const getItemImages = createAsyncThunk(
  'itemImages/getItemImages',
  async (itemId: string, { rejectWithValue }) => {
    try {
      return await itemImagesApi.getItemImages(itemId);
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
  reducers: {},
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
        state.images = action.payload;
      })
      .addCase(getItemImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Upload Item Image
      .addCase(uploadItemImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadItemImage.fulfilled, (state, action) => {
        state.loading = false;
        state.images.push(action.payload);
      })
      .addCase(uploadItemImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Item Image
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

export const selectItemImages = (state: RootState) => state.itemImages.images;
export const selectItemImagesLoading = (state: RootState) =>
  state.itemImages.loading;
export const selectItemImagesError = (state: RootState) =>
  state.itemImages.error;
export const selectCurrentItemId = (state: RootState) =>
  state.itemImages.currentItemId;

export default itemImagesSlice.reducer;
