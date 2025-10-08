import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  CartItem,
  CartState,
  UpdateDateRangePayload,
  UpdateQuantityPayload,
  ErrorContext,
} from "@/types";

// Utility function to clear past dates from cart items
const clearPastDates = (items: CartItem[]): CartItem[] => {
  // safety check in case items is not an array
  if (!Array.isArray(items)) {
    return [];
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return items.map((item) => {
    const startDate = item.startDate ? new Date(item.startDate) : null;
    const endDate = item.endDate ? new Date(item.endDate) : null;

    // If start date is in the past, clear both dates
    if (startDate && startDate < today) {
      return {
        ...item,
        startDate: undefined,
        endDate: undefined,
      };
    }

    // If end date is in the past but start date is valid, clear both for consistency
    if (endDate && endDate < today) {
      return {
        ...item,
        startDate: undefined,
        endDate: undefined,
      };
    }

    return item;
  });
};

// Load cart from localStorage (if available)
const loadCartFromStorage = (): CartState => {
  try {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      const parsedData = JSON.parse(cartData);
      // clear past dates from loaded items
      const itemsWithValidDates = clearPastDates(parsedData.items || []);

      return {
        ...parsedData,
        items: itemsWithValidDates,
      };
    }
  } catch (e) {
    console.error("Error loading cart from localStorage:", e);
  }
  // Default state if nothing in localStorage
  return {
    items: [],
    loading: false,
    error: null,
    errorContext: null,
  };
};

// Function to save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(
      "cart",
      JSON.stringify({
        items,
        loading: false,
        error: null,
        errorContext: null,
      }),
    );
  } catch (e) {
    console.error("Error saving cart to localStorage:", e);
  }
};

/**
 * Initial state for cart
 */
const initialState: CartState = loadCartFromStorage();

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action: PayloadAction<CartItem>) => {
      state.error = null;
      state.errorContext = null;

      const existingItemIndex = state.items.findIndex(
        (item) => item.item.id === action.payload.item.id,
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        state.items[existingItemIndex].quantity += action.payload.quantity;
      } else {
        // Add new item to cart
        state.items.push(action.payload);
      }

      // Save to localStorage
      saveCartToStorage(state.items);
    },

    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.error = null;
      state.errorContext = null;

      state.items = state.items.filter(
        (item) => item.item.id !== action.payload,
      );

      // Save to localStorage
      saveCartToStorage(state.items);
    },

    // Update item quantity
    updateQuantity: (state, action: PayloadAction<UpdateQuantityPayload>) => {
      state.error = null;
      state.errorContext = null;

      const { id, quantity } = action.payload;
      const itemIndex = state.items.findIndex((item) => item.item.id === id);

      if (itemIndex >= 0) {
        state.items[itemIndex].quantity = quantity;
      }

      // Save to localStorage
      saveCartToStorage(state.items);
    },

    // Clear all items from cart
    clearCart: (state) => {
      state.items = [];
      state.error = null;
      state.errorContext = null;

      // Save to localStorage
      saveCartToStorage(state.items);
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state with context
    setError: (
      state,
      action: PayloadAction<{ message: string | null; context: ErrorContext }>,
    ) => {
      state.error = action.payload.message;
      state.errorContext = action.payload.context;
    },

    // Clear error state
    clearError: (state) => {
      state.error = null;
      state.errorContext = null;
    },

    // Update date range for a cart item
    updateDateRange: (state, action: PayloadAction<UpdateDateRangePayload>) => {
      state.error = null;
      state.errorContext = null;

      const { id, startDate, endDate } = action.payload;
      const itemIndex = state.items.findIndex((item) => item.item.id === id);

      if (itemIndex >= 0) {
        if (startDate !== undefined)
          state.items[itemIndex].startDate = startDate;
        if (endDate !== undefined) state.items[itemIndex].endDate = endDate;
      }

      // Save to localStorage
      saveCartToStorage(state.items);
    },
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setLoading,
  setError,
  clearError,
  updateDateRange,
} = cartSlice.actions;

// Export selectors
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartItemsCount = (state: RootState) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectCartErrorContext = (state: RootState) =>
  state.cart.errorContext;
export const selectCartErrorWithContext = (state: RootState) => ({
  message: state.cart.error,
  context: state.cart.errorContext,
});

export default cartSlice.reducer;
