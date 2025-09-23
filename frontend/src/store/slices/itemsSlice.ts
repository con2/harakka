import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { itemsApi } from "../../api/services/items";
import {
  ItemState,
  Item,
  Tag,
  RootState,
  ValidItemOrder,
  ManageItemViewRow,
} from "@/types";
import { extractErrorMessage } from "@/store/utils/errorHandlers";
import { ApiResponse } from "@common/response.types";
import { AxiosResponse } from "axios";
import { CreateItemType, ItemFormData } from "@common/items/form.types";
import { UpdateItem, UpdateResponse } from "@common/items/storage-items.types";
import { formatErrors, formatParsedItems } from "../utils/helper.utils";

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
  itemCreation: {
    org: null,
    location: undefined,
    items: [],
    errors: {},
  },
  isEditingItem: false,
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
    category: string;
    availability_min?: number;
    availability_max?: number;
    org_ids?: string[] | string;
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
      category,
      availability_min,
      availability_max,
      org_ids,
    }: {
      ordered_by: ValidItemOrder;
      page: number;
      limit: number;
      searchquery: string;
      ascending?: boolean;
      tag_filters?: string[];
      activity_filter?: "active" | "inactive";
      location_filter: string[];
      category?: string;
      availability_min?: number;
      availability_max?: number;
      org_ids?: string[] | string;
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
        category,
        availability_min,
        availability_max,
        org_ids,
      );
      return response as AxiosResponse["data"];
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch items"),
      );
    }
  },
);

// Fetch all ordered organization items (admin)
export const fetchAllAdminItems = createAsyncThunk<
  ApiResponse<ManageItemViewRow>,
  {
    ordered_by?: ValidItemOrder;
    ascending?: boolean;
    page: number;
    limit: number;
    searchquery?: string;
    tag_filters?: string[];
    activity_filter?: "active" | "inactive";
    location_filter?: string[];
    category?: string;
  }
>(
  "items/fetchAllAdminItems",
  async (
    {
      ordered_by = "created_at",
      ascending = true,
      page = 1,
      limit = 10,
      searchquery,
      tag_filters,
      activity_filter,
      location_filter,
      category,
    }: {
      ordered_by?: ValidItemOrder;
      ascending?: boolean;
      page: number;
      limit: number;
      searchquery?: string;
      tag_filters?: string[];
      activity_filter?: "active" | "inactive";
      location_filter?: string[];
      category?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await itemsApi.getAllAdminItems(
        page,
        limit,
        ascending ?? true,
        ordered_by ?? "created_at",
        searchquery,
        tag_filters,
        activity_filter,
        location_filter,
        category,
      );
      return response as AxiosResponse["data"];
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch admin items"),
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
      const result = await itemsApi.createItems(itemData);
      if (result.error) throw new Error("Failed to create items");
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to create item"),
      );
    }
  },
);

// Delete item by ID
export const deleteItem = createAsyncThunk<
  { success: boolean; id: string },
  { org_id: string; item_id: string },
  { rejectValue: string }
>("items/deleteItem", async ({ org_id, item_id }, { rejectWithValue }) => {
  try {
    const response = await itemsApi.deleteItem(org_id, item_id);
    if (!response || !response.success || !response.id) {
      return rejectWithValue("Failed to delete item");
    }
    return { success: true, id: response.id };
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, "Failed to delete item"));
  }
});

// Update item
export const updateItem = createAsyncThunk<
  UpdateResponse,
  { item_id: string; data: UpdateItem; orgId: string }
>("items/updateItem", async ({ item_id, data, orgId }, { rejectWithValue }) => {
  try {
    const response = await itemsApi.updateItem(item_id, data, orgId);
    return response;
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

/**
 * Parse storage items from a CSV
 */
export const uploadCSV = createAsyncThunk(
  "items/parseCSV",
  async (file: File, { rejectWithValue }) => {
    try {
      return await itemsApi.parseCSV(file);
    } catch (error) {
      console.error(error);
      return rejectWithValue(extractErrorMessage(error, "Failed to parse CSV"));
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
      // Immutably update the array to trigger consumers (e.g., DataTable) that rely on referential equality
      state.items = state.items.map((it) => {
        if (it.id !== itemId) return it;
        if ("storage_item_tags" in it) {
          return { ...(it as Item), storage_item_tags: tags } as Item;
        }
        return it;
      });
      // Keep selectedItem in sync if it's the same item
      if (
        state.selectedItem &&
        state.selectedItem.id === itemId &&
        "storage_item_tags" in state.selectedItem
      ) {
        state.selectedItem = {
          ...(state.selectedItem as Item),
          storage_item_tags: tags,
        } as Item;
      }
    },
    selectOrgLocation: (state, action) => {
      state.itemCreation.location = action.payload;
    },
    selectOrg: (state, action) => {
      state.itemCreation.org = action.payload;
    },
    addToItemCreation: (state, action) => {
      state.itemCreation.items.push(action.payload);
      localStorage.setItem(
        "itemsInProgress",
        JSON.stringify(state.itemCreation),
      );
    },
    removeFromItemCreation: (state, action) => {
      const id = action.payload;
      state.itemCreation.items = state.itemCreation.items.filter(
        (item) => item.id !== id,
      );
      delete state.itemCreation.errors[id];
      localStorage.setItem(
        "itemsInProgress",
        JSON.stringify(state.itemCreation),
      );
    },
    loadItemsFromStorage: (state) => {
      const storage = localStorage.getItem("itemsInProgress");
      if (storage) state.itemCreation = JSON.parse(storage);
    },
    editLocalItem: (state, action) => {
      const id = action.payload;
      const editItem = state.itemCreation.items.find((item) => item.id === id);
      if (editItem) state.selectedItem = editItem;
    },
    toggleIsEditing: (state, action) => {
      state.isEditingItem = action.payload;
    },
    updateLocalItem: (state, action) => {
      const { item } = action.payload;
      const index = state.itemCreation.items.findIndex((i) => i.id === item.id);
      state.itemCreation.items[index] = item;
      localStorage.setItem(
        "itemsInProgress",
        JSON.stringify(state.itemCreation),
      );
    },
    clearLocalItemError: (state, action) => {
      const itemId = action.payload;
      delete state.itemCreation.errors[itemId];
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
      .addCase(fetchAllAdminItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(fetchAllAdminItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data ?? [];
        state.item_pagination = action.payload.metadata;
      })
      .addCase(fetchAllAdminItems.rejected, (state, action) => {
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
      .addCase(createItem.fulfilled, (state) => {
        state.loading = false;
        state.itemCreation = {
          org: null,
          location: undefined,
          items: [],
          errors: {},
        };
        localStorage.removeItem("itemsInProgress");
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

        state.items = state.items.filter(
          (item) => item.id !== action.payload.id,
        );
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
        const { item: updatedItem } = action.payload as {
          item: Partial<Item> & {
            id?: string;
          };
        };
        const targetId = updatedItem.id;
        if (!targetId) return;

        const idx = state.items.findIndex((i) => i.id === targetId);
        if (idx !== -1) {
          const existing = state.items[idx] as Item;
          // Shallow-merge to preserve view-only fields (e.g., location_name) that may be omitted in the update response
          const { location_details } = updatedItem;
          const merged = {
            ...existing,
            ...updatedItem,
          } as Item;
          state.items[idx] = {
            ...merged,
            location_id: location_details?.id ?? "",
            location_name: location_details?.name,
          };
          // If a details view is open for this item, keep it in sync too
          if (state.selectedItem && state.selectedItem.id === targetId) {
            state.selectedItem = {
              ...(state.selectedItem as Item),
              ...updatedItem,
            } as Item;
          }
        }
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
      .addCase(uploadCSV.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadCSV.fulfilled, (state, action) => {
        const { data: parsedItems, errors } = action.payload;
        const location = state.itemCreation.location!;

        // Transform the uploaded items to the correct type
        const formattedItems = formatParsedItems(parsedItems, location);
        const itemIds = new Set(formattedItems.map((item) => item.id));

        const formattedErrors = formatErrors(errors, itemIds);
        state.itemCreation.errors = {
          ...state.itemCreation.errors,
          ...formattedErrors,
        };

        // Push the items with any current items
        state.itemCreation.items = [
          ...state.itemCreation.items,
          ...formattedItems,
        ];

        localStorage.setItem(
          "itemsInProgress",
          JSON.stringify(state.itemCreation),
        );

        state.loading = false;
      })
      .addCase(uploadCSV.rejected, (state, action) => {
        state.error = action.payload as string;
        state.errorContext = "create";
        state.loading = false;
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

// Pagination data
export const selectItemsPagination = (state: RootState) =>
  state.items.item_pagination;
export const selectTotalItemsCount = (state: RootState) =>
  state.items.itemCount;
export const selectItemCreation = (state: RootState) =>
  state.items.itemCreation;
export const selectIsEditing = (state: RootState) => state.items.isEditingItem;

// Actions
export const {
  clearSelectedItem,
  updateItemTags,
  selectOrgLocation,
  selectOrg,
  addToItemCreation,
  removeFromItemCreation,
  loadItemsFromStorage,
  editLocalItem,
  toggleIsEditing,
  updateLocalItem,
  clearLocalItemError,
} = itemsSlice.actions;

export default itemsSlice.reducer;
