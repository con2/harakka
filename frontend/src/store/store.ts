import { configureStore } from '@reduxjs/toolkit';
import usersReducer from "./slices/usersSlice";
import itemsReducer from "./slices/itemsSlice";
import ordersReducer from "./slices/ordersSlice"

// add slices in the reducer object
export const store = configureStore({
  reducer: {
    users: usersReducer,
    items: itemsReducer,
    orders: ordersReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;