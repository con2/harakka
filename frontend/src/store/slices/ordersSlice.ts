import {
  createEntityAdapter,
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { ordersApi } from "../../api/services/orders";
import { RootState } from "../store";
import { BookingOrder, BookingItem } from "../../types/orders";
import { createApiThunk } from "../utils/thunkCreators";

// Define the DTO type for order creation
interface CreateOrderDto {
  user_id: string;
  items: {
    item_id: string;
    quantity: number;
    start_date: string;
    end_date: string;
  }[];
}

// Create an entity adapter for orders
const ordersAdapter = createEntityAdapter<BookingOrder, string>({
  // Select the order ID as the primary key
  selectId: (order) => order.id,
  // Sort by creation date, newest first
  sortComparer: (a, b) => {
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    return bTime - aTime;
  },
});

// Define the error state interface
interface OrderError {
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
}

// Additional state properties beyond EntityState
interface OrdersAdditionalState {
  orders: BookingOrder[];
  userOrders: BookingOrder[];
  loading: boolean;
  error: OrderError;
  currentOrder: string | null;
}

// Create initial state
const initialState = ordersAdapter.getInitialState<OrdersAdditionalState>({
  orders: [], // All orders (admin)
  userOrders: [], // Single user's orders
  loading: false,
  error: {
    message: null,
    context: null,
  },
  currentOrder: null,
});

// Create order thunk
export const createOrder = createApiThunk<BookingOrder, CreateOrderDto>(
  "orders/createOrder",
  ordersApi.createOrder,
  "Failed to create order",
);

// Get user orders thunk
export const getUserOrders = createAsyncThunk<BookingOrder[], string>(
  "orders/getUserOrders",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getUserOrders(userId);

      // Ensure we return the raw array from the API
      return Array.isArray(response) ? response : [];
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch orders";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  },
);

// Get all orders (admin) thunk
export const getAllOrders = createApiThunk<BookingOrder[], string>(
  "orders/getAllOrders",
  ordersApi.getAllOrders,
  "Failed to fetch all orders",
);

// Confirm order (admin) thunk
export const confirmOrder = createApiThunk<BookingOrder, string>(
  "orders/confirmOrder",
  ordersApi.confirmOrder,
  "Failed to confirm order",
  (response, orderId) => ({ ...response, id: orderId }),
);

// Update order thunk
export const updateOrder = createApiThunk<
  BookingOrder,
  { orderId: string; items: BookingItem[] }
>(
  "orders/updateOrder",
  async ({ orderId, items }) => {
    const response = await ordersApi.updateOrder(orderId, items);
    return response;
  },
  "Failed to update order",
  (response, { orderId }) => ({ ...response, id: orderId }),
);

// Other thunks follow the same pattern...
export const rejectOrder = createApiThunk<BookingOrder, string>(
  "orders/rejectOrder",
  ordersApi.rejectOrder,
  "Failed to reject order",
  (response, orderId) => ({ ...response, id: orderId }),
);

export const cancelOrder = createApiThunk<BookingOrder, string>(
  "orders/cancelOrder",
  ordersApi.cancelOrder,
  "Failed to cancel order",
  (response, orderId) => ({ ...response, id: orderId }),
);

export const deleteOrder = createApiThunk<string, string>(
  "orders/deleteOrder",
  ordersApi.deleteOrder,
  "Failed to delete order",
  (_, orderId) => orderId, // Just return the ID for deletion
);

export const returnItems = createApiThunk<BookingOrder, string>(
  "orders/returnItems",
  ordersApi.returnItems,
  "Failed to process returns",
  (response, orderId) => ({ ...response, id: orderId }),
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
        state.currentOrder = action.payload.id;
        ordersAdapter.addOne(state, action.payload);
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
        state.error = { message: null, context: null };
        state.userOrders = action.payload;
        ordersAdapter.setAll(state, action.payload);
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
        ordersAdapter.setAll(state, action.payload);
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
        const { id, ...changes } = action.payload;
        ordersAdapter.updateOne(state, {
          id,
          changes: { status: "confirmed" },
        });
        state.orders = state.orders.map((order) =>
          order.id === id ? { ...order, status: "confirmed" } : order,
        );
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
        ordersAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        });
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
        ordersAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { status: "rejected" },
        });
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
        ordersAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { status: "cancelled by user" },
        });
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
        ordersAdapter.removeOne(state, action.payload);
        state.orders = state.orders.filter(
          (order) => order.id !== action.payload,
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
        ordersAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { status: "completed" },
        });
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

// Export actions
export const { clearCurrentOrder } = ordersSlice.actions;

// Get the selector functions
const ordersSelectors = ordersAdapter.getSelectors<RootState>(
  (state) => state.orders,
);

// Export selectors
export const selectOrders = ordersSelectors.selectAll;
export const selectOrderById = ordersSelectors.selectById;
export const selectOrderIds = ordersSelectors.selectIds;
export const selectCurrentOrder = (state: RootState) =>
  state.orders.currentOrder
    ? selectOrderById(state, state.orders.currentOrder)
    : null;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrdersError = (state: RootState) =>
  state.orders.error.message;
export const selectOrdersErrorContext = (state: RootState) =>
  state.orders.error.context;
export const selectOrdersErrorWithContext = (state: RootState) =>
  state.orders.error;
export const selectOrdersTotal = ordersSelectors.selectTotal;
export const selectAllOrders = ordersSelectors.selectAll;
export const selectUserOrders = (state: RootState) => state.orders.userOrders;

// Export reducer
export default ordersSlice.reducer;
