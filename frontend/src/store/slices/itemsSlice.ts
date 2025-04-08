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

// Explicitly type the async thunk
export const fetchAllItems = createAsyncThunk<Item[], void>(
  'items/fetchAllItems', 
  async () => {
    const response = await itemsApi.getAllItems();
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
                // Ensure payload is properly typed as Item[]
                state.items = action.payload;
            })
            .addCase(fetchAllItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to load items';
            });
    }
});

// Selectors
export const selectAllItems = (state: RootState) => state.items.items ?? [];
export const selectItemsLoading = (state: RootState) => state.items.loading;
export const selectItemsError = (state: RootState) => state.items.error;

// Actions
export const { 
    clearSelectedItem
} = itemsSlice.actions;

export default itemsSlice.reducer;