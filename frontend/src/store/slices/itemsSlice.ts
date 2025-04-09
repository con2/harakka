import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { itemsApi } from "../../api/services/items";
import { ItemState, Item } from "../../types/item";
import { RootState } from "../store";

const initialState: ItemState = {
    items: [],
    loading: false,
    error: null,
    selectedItem: null
};

// Fetch all items
export const fetchAllItems = createAsyncThunk<Item[], void>(
  'items/fetchAllItems', 
  async () => {
    const response = await itemsApi.getAllItems();
    return response;
  }
);

// Fetch single item by ID
export const getItemById = createAsyncThunk<Item, string>(
  'items/getItemById',
  async (id: string) => {
    const response = await itemsApi.getItemById(id);
    return response;
  }
);

// create Item
export const createItem = createAsyncThunk<Item, Item>(
    'items/createItem',
    async (newItem) => {
      const response = await itemsApi.createItem(newItem);
      return response;
    }
  );

// Delete item by ID
export const deleteItem = createAsyncThunk<void, string>(
  'items/deleteItem',
  async (id: string) => {
    await itemsApi.deleteItem(id);
  }
);

// Update item
export const updateItem = createAsyncThunk<Item, { id: string, data: Partial<Item> }>(
  'items/updateItem',
  async ({ id, data }) => {
    const response = await itemsApi.updateItem(id, data);
    return response;
  }
);

export const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        clearSelectedItem: (state) => {
            state.selectedItem = null;
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchAllItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchAllItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to load items';
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
                state.error = action.error.message || 'Failed to load item';
            })
            .addCase(createItem.fulfilled, (state, action) => {
                state.items.push(action.payload); // Add the new item to the list
              })
            .addCase(deleteItem.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.meta.arg);
            })
            .addCase(updateItem.fulfilled, (state, action) => {
                const updatedItem = action.payload;
                state.items = state.items.map(item =>
                    item.id === updatedItem.id ? updatedItem : item
                );
            });
    }
});

// Selectors
export const selectAllItems = (state: RootState) => state.items.items ?? [];
export const selectItemsLoading = (state: RootState) => state.items.loading;
export const selectItemsError = (state: RootState) => state.items.error;
export const selectSelectedItem = (state: RootState) => state.items.selectedItem;

// Actions
export const { clearSelectedItem } = itemsSlice.actions;

export default itemsSlice.reducer;