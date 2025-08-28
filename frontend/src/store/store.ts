import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./slices/usersSlice";
import itemsReducer from "./slices/itemsSlice";
import bookingsReducer from "./slices/bookingsSlice";
import cartReducer from "./slices/cartSlice";
import timeframeReducer from "./slices/timeframeSlice";
import tagsReducer from "./slices/tagSlice";
import itemImagesReducer from "./slices/itemImagesSlice";
import uiReducer from "./slices/uiSlice";
import locationsReducer from "./slices/locationsSlice";
import logsReducer from "./slices/logsSlice";
import rolesReducer from "./slices/rolesSlice";
import userBanningReducer from "./slices/userBanningSlice";
import organizationReducer from "./slices/organizationSlice";
import organizationLocationsReducer from "./slices/organizationLocationsSlice";

// add slices in the reducer object
export const store = configureStore({
  reducer: {
    users: usersReducer,
    items: itemsReducer,
    bookings: bookingsReducer,
    cart: cartReducer,
    timeframe: timeframeReducer,
    tags: tagsReducer,
    itemImages: itemImagesReducer,
    ui: uiReducer,
    locations: locationsReducer,
    logs: logsReducer,
    roles: rolesReducer,
    userBanning: userBanningReducer,
    organizations: organizationReducer,
    orgLocations: organizationLocationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
