import {
  createEntityAdapter,
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { ordersApi } from "../../api/services/orders";
import { RootState } from "../store";
import {
  BookingOrder,
  BookingItem,
  OrdersState,
  CreateOrderDto,
  PaymentStatus,
} from "@/types";
import { extractErrorMessage } from "@/store/utils/errorHandlers";

// Create an entity adapter for orders
const ordersAdapter = createEntityAdapter<BookingOrder>({
  sortComparer: (a, b) => {
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    return bTime - aTime;
  },
});

// Create initial state
const initialState = ordersAdapter.getInitialState<
  Omit<OrdersState, "entities" | "ids">
>({
  userOrders: [],
  loading: false,
  error: null,
  errorContext: null,
  currentOrder: null,
});

// Create order thunk
export const createOrder = createAsyncThunk<BookingOrder, CreateOrderDto>(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      return await ordersApi.createOrder(orderData);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to create order"),
      );
    }
  },
);

// Get user orders thunk
export const getUserOrders = createAsyncThunk<BookingOrder[], string>(
  "orders/getUserOrders",
  async (userId, { rejectWithValue }) => {
    try {
      return await ordersApi.getUserOrders(userId);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch user orders"),
      );
    }
  },
);

// Get all orders thunk
export const getAllOrders = createAsyncThunk<BookingOrder[], string>(
  "orders/getAllOrders",
  async (userId, { rejectWithValue }) => {
    try {
      return await ordersApi.getAllOrders(userId);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch all orders"),
      );
    }
  },
);

// Confirm order thunk
export const confirmOrder = createAsyncThunk<
  { message: string; orderId: string },
  string,
  { rejectValue: string }
>("orders/confirmOrder", async (orderId, { rejectWithValue }) => {
  try {
    // The backend returns { message: "Booking confirmed" }
    const response = await ordersApi.confirmOrder(orderId);

    // Make sure we return the expected type
    return {
      ...response, // This contains the message from backend
      orderId: orderId, // add the orderId
    };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to confirm order"),
    );
  }
});

// Update order thunk
export const updateOrder = createAsyncThunk<
  BookingOrder,
  { orderId: string; items: BookingItem[] }
>("orders/updateOrder", async ({ orderId, items }, { rejectWithValue }) => {
  try {
    return await ordersApi.updateOrder(orderId, items);
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to update order"),
    );
  }
});

// Reject order thunk
export const rejectOrder = createAsyncThunk<
  { message: string; orderId: string },
  string,
  { rejectValue: string }
>("orders/rejectOrder", async (orderId, { rejectWithValue }) => {
  try {
    // The backend returns { message: "Booking rejected" }
    const response = await ordersApi.rejectOrder(orderId);

    // Make sure we return the expected type
    return {
      ...response, // This contains the message from backend
      orderId: orderId, // We add the orderId ourselves
    };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to reject order"),
    );
  }
});

// Cancel order thunk
export const cancelOrder = createAsyncThunk<
  { message?: string; orderId: string },
  string,
  { rejectValue: string }
>("orders/cancelOrder", async (orderId, { rejectWithValue }) => {
  try {
    const response = await ordersApi.cancelOrder(orderId);

    // Always add the orderId to the response
    return {
      message: response.message || "Order cancelled successfully",
      orderId: orderId, // add the orderId
    };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Failed to cancel order"),
    );
  }
});

// Delete order thunk
export const deleteOrder = createAsyncThunk<string, string>(
  "orders/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      return await ordersApi.deleteOrder(orderId);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to delete order"),
      );
    }
  },
);

// Return items thunk
export const returnItems = createAsyncThunk<BookingOrder, string>(
  "orders/returnItems",
  async (orderId, { rejectWithValue }) => {
    try {
      return await ordersApi.returnItems(orderId);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to process returns"),
      );
    }
  },
);

// update Payment Status thunk
export const updatePaymentStatus = createAsyncThunk<
  { orderId: string; status: PaymentStatus },
  { orderId: string; status: PaymentStatus }
>(
  "bookings/payment-status",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.updatePaymentStatus(orderId, status);
      // Ensure the returned status is of type PaymentStatus
      return {
        orderId,
        status: response.status as PaymentStatus,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to update the payment status")
      );
    }
  }
);

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.error = null;
      state.errorContext = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.id;
        ordersAdapter.addOne(state, action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "create";
      })
      // Get user orders
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload;
        ordersAdapter.setAll(state, action.payload);
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      // Get all orders
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        ordersAdapter.setAll(state, action.payload);
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })
      // Confirm order
      .addCase(confirmOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(confirmOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Use the orderId from payload
        const orderId = action.payload.orderId;

        // Update the order status in the normalized state
        ordersAdapter.updateOne(state, {
          id: orderId,
          changes: { status: "confirmed" },
        });

        // Also update in the user orders array
        state.userOrders = state.userOrders.map((order) =>
          order.id === orderId ? { ...order, status: "confirmed" } : order,
        );
      })
      .addCase(confirmOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "confirm";
      })
      // Update order
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        ordersAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        });
        state.userOrders = state.userOrders.map((order) =>
          order.id === action.payload.id ? action.payload : order,
        );
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "update";
      })
      // Reject order
      .addCase(rejectOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(rejectOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Use the orderId from payload
        const orderId = action.payload.orderId;

        // Update the order status in the normalized state
        ordersAdapter.updateOne(state, {
          id: orderId,
          changes: { status: "rejected" },
        });

        // Also update in the user orders array
        state.userOrders = state.userOrders.map((order) =>
          order.id === orderId ? { ...order, status: "rejected" } : order,
        );
      })
      .addCase(rejectOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "reject";
      })
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;

        // Use the orderId we added to the payload
        const orderId = action.payload.orderId;

        // Update the order status in the normalized state
        ordersAdapter.updateOne(state, {
          id: orderId,
          changes: { status: "cancelled by user" },
        });

        // Also update in the user orders array
        state.userOrders = state.userOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: "cancelled by user" }
            : order,
        );
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "cancel";
      })
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        ordersAdapter.removeOne(state, action.payload);
        state.userOrders = state.userOrders.filter(
          (order) => order.id !== action.payload,
        );
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "delete";
      })
      // Return items
      .addCase(returnItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(returnItems.fulfilled, (state, action) => {
        state.loading = false;
        ordersAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { status: "completed" },
        });
        state.userOrders = state.userOrders.map((order) =>
          order.id === action.payload.id
            ? { ...order, status: "completed" }
            : order,
        );
      })
      .addCase(returnItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "return";
      })
      // Update payment status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { orderId, status } = action.payload;

        // Update the order in the normalized state
        ordersAdapter.updateOne(state, {
          id: orderId,
          changes: { payment_status: status as BookingOrder["payment_status"] },
        });
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "update-payment-status";
      });
      ;
  },
});

// Export actions
export const { clearCurrentOrder } = ordersSlice.actions;

// Export selectors
const ordersSelectors = ordersAdapter.getSelectors<RootState>(
  (state) => state.orders,
);

// Export selectors
export const selectAllOrders = ordersSelectors.selectAll;
export const selectOrderById = ordersSelectors.selectById;
export const selectOrderIds = ordersSelectors.selectIds;
export const selectCurrentOrder = (state: RootState) =>
  state.orders.currentOrder
    ? selectOrderById(state, state.orders.currentOrder)
    : null;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrdersError = (state: RootState) => state.orders.error;
export const selectOrdersErrorContext = (state: RootState) =>
  state.orders.errorContext;
export const selectOrdersErrorWithContext = (state: RootState) => ({
  message: state.orders.error,
  context: state.orders.errorContext,
});
export const selectOrdersTotal = ordersSelectors.selectTotal;
export const selectUserOrders = (state: RootState) => state.orders.userOrders;

// Export reducer
export default ordersSlice.reducer;
