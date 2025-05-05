import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import itemsReducer from './slices/itemsSlice';
import ordersReducer from './slices/ordersSlice';
import cartReducer from './slices/cartSlice';
import timeframeReducer from './slices/timeframeSlice';
import tagsReducer from './slices/tagSlice';
import itemImagesReducer from './slices/itemImagesSlice';

// add slices in the reducer object
export const store = configureStore({
  reducer: {
    users: usersReducer,
    items: itemsReducer,
    orders: ordersReducer,
    cart: cartReducer,
    timeframe: timeframeReducer,
    tags: tagsReducer,
    itemImages: itemImagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
