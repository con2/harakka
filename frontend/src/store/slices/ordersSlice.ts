import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ordersApi } from "../../api/services/orders";
import { RootState } from "../store";
import { BookingOrder } from "../../types/orders";

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
    context?: "create" | "fetch" | null;
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
