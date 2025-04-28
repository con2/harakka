import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { itemsApi } from "../../api/services/items";
import {
  ItemState,
  Item,
  CreateItemDto,
  UpdateItemDto,
  Tag,
  RootState,
} from "@/types";
import { extractErrorMessage } from "@/store/utils/errorHandlers";

/**
 * Initial state for items slice
 */
const initialState: ItemState = {
  items: [],
  loading: false,
  error: null,
  errorContext: null,
  selectedItem: null,
};

// Fetch all available items
export const fetchAllItems = createAsyncThunk<Item[], void>(
  "items/fetchAllItems",
  async (_, { rejectWithValue }) => {
    try {
      return await itemsApi.getAllItems();
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch items"),
      );
    }
  },
);

// Fetch single item by ID
export const getItemById = createAsyncThunk<Item, string>(
  "items/getItemById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await itemsApi.getItemById(id);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch item"),
      );
    }
  },
);

// create Item
export const createItem = createAsyncThunk<Item, CreateItemDto>(
  "items/createItem",
  async (newItem, { rejectWithValue }) => {
    try {
      return await itemsApi.createItem(newItem);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to create item"),
      );
    }
  },
);

// Delete item by ID
export const deleteItem = createAsyncThunk<string, string>(
  "items/deleteItem",
  async (id: string, { rejectWithValue }) => {
    try {
      await itemsApi.deleteItem(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to delete item"),
      );
    }
  },
);

// Update item
export const updateItem = createAsyncThunk<
  Item,
  { id: string; data: UpdateItemDto }
>("items/updateItem", async ({ id, data }, { rejectWithValue }) => {
  try {
    const { ...cleanData } = data;
    return await itemsApi.updateItem(id, cleanData);
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, "Failed to update item"));
  }
});

// Get items with a specific tag
export const getItemsByTag = createAsyncThunk<Item[], string>(
  "items/getItemsByTag",
  async (tagId: string, { rejectWithValue }) => {
    try {
      return await itemsApi.getItemsByTag(tagId);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch items by tag"),
      );
    }
  },
);

// Get available items within a timeframe
export const getAvailableItems = createAsyncThunk<
  Item[],
  { startDate?: Date | null; endDate?: Date | null }
>(
  "items/getAvailableItems",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      return await itemsApi.getAvailableItems(startDate, endDate);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch available items"),
      );
    }
  },
);

export const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
      state.error = null;
    },
    updateItemTags: (
      state,
      action: PayloadAction<{ itemId: string; tags: Tag[] }>,
    ) => {
      const { itemId, tags } = action.payload;
      const item = state.items.find((item) => item.id === itemId);
      if (item) {
        item.storage_item_tags = tags;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(fetchAllItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      .addCase(getItemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(getItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      .addCase(createItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "create";
      })
      .addCase(deleteItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "delete";
      })
      .addCase(updateItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        const updatedItem = action.payload;

        // Deduplicate tags if they exist
        if (
          updatedItem.storage_item_tags &&
          updatedItem.storage_item_tags.length > 0
        ) {
          updatedItem.storage_item_tags = Array.from(
            new Map(
              updatedItem.storage_item_tags.map((tag) => [tag.id, tag]),
            ).values(),
          );
        }

        state.loading = false;
        state.items = state.items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        );
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "update";
      })
      .addCase(getAvailableItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getAvailableItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      .addCase(getItemsByTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getItemsByTag.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getItemsByTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      });
  },
});

// Selectors
export const selectAllItems = (state: RootState) => state.items.items ?? [];
export const selectItemsLoading = (state: RootState) => state.items.loading;
export const selectItemsError = (state: RootState) => state.items.error;
export const selectItemsErrorContext = (state: RootState) =>
  state.items.errorContext;
export const selectItemsErrorWithContext = (state: RootState) => ({
  message: state.items.error,
  context: state.items.errorContext,
});
export const selectSelectedItem = (state: RootState) =>
  state.items.selectedItem;

// Actions
export const { clearSelectedItem, updateItemTags } = itemsSlice.actions;

export default itemsSlice.reducer;
