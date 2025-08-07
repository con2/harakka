import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { itemsApi } from "../../api/services/items";
import {
  ItemState,
  Item,
  UpdateItemDto,
  Tag,
  RootState,
  ItemFormData,
  ValidItemOrder,
  ManageItemViewRow,
} from "@/types";
import { extractErrorMessage } from "@/store/utils/errorHandlers";
import { ApiResponse } from "@common/response.types";
import { AxiosResponse } from "axios";

/**
 * Initial state for items slice
 */
const initialState: ItemState = {
  items: [],
  loading: false,
  error: null,
  errorContext: null,
  selectedItem: null,
  deletableItems: {},
  item_pagination: {
    page: 1,
    totalPages: 0,
    total: 0,
  },
  itemCount: 0,
};

// Fetch all available items
export const fetchAllItems = createAsyncThunk<
  ApiResponse<ManageItemViewRow>,
  { page: number; limit: number }
>(
  "items/fetchAllItems",
  async (
    {
      page = 1,
      limit = 10,
    }: {
      page: number;
      limit: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await itemsApi.getAllItems(page, limit);
      return response as AxiosResponse["data"];
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch items"),
      );
    }
  },
);

// Fetch all ordered items
export const fetchOrderedItems = createAsyncThunk<
  ApiResponse<ManageItemViewRow>,
  {
    ordered_by: ValidItemOrder;
    ascending: boolean;
    page: number;
    limit: number;
    searchquery: string;
    tag_filters: string[];
    activity_filter?: "active" | "inactive";
    location_filter: string[];
    categories: string[];
    availability_min?: number;
    availability_max?: number;
  }
>(
  "items/fetchOrderedItems",
  async (
    {
      ordered_by = "created_at",
      ascending = true,
      page,
      limit,
      searchquery,
      tag_filters,
      activity_filter,
      location_filter,
      categories,
      availability_min,
      availability_max,
    }: {
      ordered_by: ValidItemOrder;
      page: number;
      limit: number;
      searchquery: string;
      ascending?: boolean;
      tag_filters?: string[];
      activity_filter?: "active" | "inactive";
      location_filter: string[];
      categories?: string[];
      availability_min?: number;
      availability_max?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await itemsApi.getOrderedItems(
        ordered_by,
        ascending,
        page,
        limit,
        searchquery,
        tag_filters,
        activity_filter,
        location_filter,
        categories,
        availability_min,
        availability_max,
      );
      return response as AxiosResponse["data"];
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch items"),
      );
    }
  },
);

// get items count (all items, active and inactive)
export const getItemCount = createAsyncThunk(
  "items/getItemCount",
  async (_, { rejectWithValue }) => {
    try {
      return await itemsApi.getItemCount();
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch bookings count"),
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
export const createItem = createAsyncThunk(
  "items/createItem",
  async (itemData: ItemFormData, { rejectWithValue }) => {
    try {
      const createdItem = await itemsApi.createItem(itemData);
      return createdItem;
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
      if (item && "storage_item_tags" in item) {
        item.storage_item_tags = tags;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getItemCount.pending, (state) => {
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getItemCount.fulfilled, (state, action) => {
        state.itemCount = action.payload.data!;
      })
      .addCase(getItemCount.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      .addCase(fetchAllItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(fetchAllItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data ?? [];
        state.item_pagination = action.payload.metadata;
      })
      .addCase(fetchAllItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      .addCase(fetchOrderedItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(fetchOrderedItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data ?? [];
        state.item_pagination = action.payload.metadata;
      })
      .addCase(fetchOrderedItems.rejected, (state, action) => {
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
              updatedItem.storage_item_tags.map((tag: Tag) => [tag.id, tag]),
            ).values(),
          );
        }

        // Find the item in local state, update only necessary properties
        state.items.map((i) => {
          if (i.id === updatedItem.id) Object.assign(i, action.payload);
        });
        const index = state.items.findIndex((i) => i.id === updatedItem.id);
        Object.assign(state.items[index], updatedItem);
        state.selectedItem = updatedItem;
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "update";
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
      })
      .addCase(checkItemDeletability.fulfilled, (state, action) => {
        state.deletableItems[action.payload.id] = action.payload.deletable;
      });
  },
});

export const checkItemDeletability = createAsyncThunk<
  { id: string; deletable: boolean; reason?: string },
  string
>("items/checkItemDeletability", async (id: string, { rejectWithValue }) => {
  try {
    const result = await itemsApi.canDeleteItem(id);
    return { id, ...result };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to check if item can be deleted"),
    );
  }
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

// Pagination data
export const selectItemsPagination = (state: RootState) =>
  state.items.item_pagination;
export const selectTotalItemsCount = (state: RootState) =>
  state.items.itemCount;

// Actions
export const { clearSelectedItem, updateItemTags } = itemsSlice.actions;

export default itemsSlice.reducer;
