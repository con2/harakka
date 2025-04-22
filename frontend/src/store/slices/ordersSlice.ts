import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ordersApi } from "../../api/services/orders";
import { OrderState, Order } from "../../types/order";
import { RootState } from "../store";

const initialState: OrderState = {
    orders: [],
    loading: false,
    error: null,
    selectedOrder: null
};

// Fetch all orders
export const fetchAllOrders = createAsyncThunk<Order[], void>(
  'orders/fetchAllOrders', 
  async () => {
    const response = await ordersApi.getAllOrders();
    return response;
  }
);

// Fetch single order by ID
export const getOrderById = createAsyncThunk<Order, string>(
  'orders/getOrderById',
  async (id: string) => {
    const response = await ordersApi.getOrderById(id);
    return response;
  }
);

// create Order
export const createOrder = createAsyncThunk<Order, Order>(
    'orders/createOrder',
    async (newOrder) => {
      const response = await ordersApi.createOrder(newOrder);
      return response;
    }
  );

// Delete order by ID
export const deleteOrder = createAsyncThunk<void, string>(
  'orders/deleteOrder',
  async (id: string) => {
    await ordersApi.deleteOrder(id);
  }
);

// Update order
export const updateOrder = createAsyncThunk<Order, { id: string, data: Partial<Order> }>(
  'orders/updateOrder',
  async ({ id, data }) => {
    const response = await ordersApi.updateOrder(id, data);
    return response;
  }
);

export const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearSelectedOrder: (state) => {
            state.selectedOrder = null;
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to load orders';
            })
            .addCase(getOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedOrder = action.payload;
            })
            .addCase(getOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to load order';
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.orders.push(action.payload); // Add the new order to the list
              })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.orders = state.orders.filter(order => order.id !== action.meta.arg);
            })
            .addCase(updateOrder.fulfilled, (state, action) => {
                const updateOrder = action.payload;
                state.orders = state.orders.map(order =>
                    order.id === updateOrder.id ? updateOrder : order
                );
            });
    }
});

// Selectors
export const selectAllOrders = (state: RootState) => state.orders.orders ?? [];
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrdersError = (state: RootState) => state.orders.error;
export const selectSelectedOrder = (state: RootState) => state.orders.selectedOrder;

// Actions
export const { clearSelectedOrder } = ordersSlice.actions;

export default ordersSlice.reducer;