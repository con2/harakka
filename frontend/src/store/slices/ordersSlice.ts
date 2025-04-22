import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ordersApi } from "../../api/services/orders";
import { RootState } from "../store";
import { BookingOrder, BookingItem } from "../../types/orders";

// DTO type for order creation
interface CreateOrderDto {
  user_id: string;
  items: {
    item_id: string;
    quantity: number;
    start_date: string;
    end_date: string;
  }[];
}

interface OrdersState {
  orders: BookingOrder[];
  loading: boolean;
  error: {
    message: string | null;
    code?: string;
    context?:
      | "create"
      | "fetch"
      | "update"
      | "delete"
      | "confirm"
      | "cancel"
      | "reject"
      | null;
  };
  currentOrder: BookingOrder | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: {
    message: null,
    context: null,
  },
  currentOrder: null,
};

// Create order from cart items
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData: CreateOrderDto, { rejectWithValue }) => {
    try {
      const response = await ordersApi.createOrder(orderData);
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Failed to create order");
      }
      return rejectWithValue("Failed to create order");
    }
  },
);

// Get user orders
export const getUserOrders = createAsyncThunk(
  "orders/getUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getUserOrders();
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Failed to fetch orders");
      }
      return rejectWithValue("Failed to fetch orders");
    }
  },
);

// Get all orders (admin)
export const getAllOrders = createAsyncThunk(
  "orders/getAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getAllOrders();
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Failed to fetch all orders");
      }
      return rejectWithValue("Failed to fetch all orders");
    }
  },
);

// Confirm order (admin)
export const confirmOrder = createAsyncThunk(
  "orders/confirmOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await ordersApi.confirmOrder(orderId);
      return { id: orderId, ...response };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Failed to confirm order");
      }
      return rejectWithValue("Failed to confirm order");
    }
  },
);

// Update order
export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async (
    { orderId, items }: { orderId: string; items: BookingItem[] },
    { rejectWithValue },
  ) => {
    try {
      const response = await ordersApi.updateOrder(orderId, items);
      return { id: orderId, ...response };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Failed to update order");
      }
      return rejectWithValue("Failed to update order");
    }
  },
);

// Reject order (admin)
export const rejectOrder = createAsyncThunk(
  "orders/rejectOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await ordersApi.rejectOrder(orderId);
      return { id: orderId, ...response };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Failed to reject order");
      }
      return rejectWithValue("Failed to reject order");
    }
  },
);

// Cancel order (user)
export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await ordersApi.cancelOrder(orderId);
      return { id: orderId, ...response };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Failed to cancel order");
      }
      return rejectWithValue("Failed to cancel order");
    }
  },
);

// Delete order (admin)
export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await ordersApi.deleteOrder(orderId);
      return { id: orderId, ...response };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Failed to delete order");
      }
      return rejectWithValue("Failed to delete order");
    }
  },
);

// Return items (admin)
export const returnItems = createAsyncThunk(
  "orders/returnItems",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await ordersApi.returnItems(orderId);
      return { id: orderId, ...response };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Failed to process returns");
      }
      return rejectWithValue("Failed to process returns");
    }
  },
);

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.error = {
        message: null,
        context: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = { message: null, context: null };
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: action.payload as string,
          context: "create",
        };
      })

      // Get user orders
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
        state.error = { message: null, context: null };
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: action.payload as string,
          context: "fetch",
        };
      })

      // Get all orders (admin)
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = { message: null, context: null };
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: action.payload as string,
          context: "fetch",
        };
      })

      // Confirm order
      .addCase(confirmOrder.pending, (state) => {
        state.loading = true;
        state.error = { message: null, context: null };
      })
      .addCase(confirmOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id,
        );
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], status: "confirmed" };
        }
      })
      .addCase(confirmOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: action.payload as string,
          context: "confirm",
        };
      })

      // Update order
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = { message: null, context: null };
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id,
        );
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...action.payload };
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: action.payload as string,
          context: "update",
        };
      })

      // Reject order
      .addCase(rejectOrder.pending, (state) => {
        state.loading = true;
        state.error = { message: null, context: null };
      })
      .addCase(rejectOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id,
        );
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], status: "rejected" };
        }
      })
      .addCase(rejectOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: action.payload as string,
          context: "reject",
        };
      })

      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = { message: null, context: null };
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id,
        );
        if (index !== -1) {
          state.orders[index] = {
            ...state.orders[index],
            status: "cancelled by user",
          };
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: action.payload as string,
          context: "cancel",
        };
      })

      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = { message: null, context: null };
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(
          (order) => order.id !== action.payload.id,
        );
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: action.payload as string,
          context: "delete",
        };
      })

      // Return items
      .addCase(returnItems.pending, (state) => {
        state.loading = true;
        state.error = { message: null, context: null };
      })
      .addCase(returnItems.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id,
        );
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], status: "completed" };
        }
      })
      .addCase(returnItems.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: action.payload as string,
          context: "update",
        };
      });
  },
});

export const { clearCurrentOrder } = ordersSlice.actions;

export const selectOrders = (state: RootState) => state.orders.orders;
export const selectCurrentOrder = (state: RootState) =>
  state.orders.currentOrder;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrdersError = (state: RootState) =>
  state.orders.error.message;
export const selectOrdersErrorContext = (state: RootState) =>
  state.orders.error.context;
export const selectOrdersErrorWithContext = (state: RootState) =>
  state.orders.error;

export default ordersSlice.reducer;
