# State Management Guide

This document outlines the state management patterns and practices used in the Storage and Booking Application frontend.

## Table of Contents

- [Overview](#overview)
- [Redux Store Structure](#redux-store-structure)
- [Slices](#slices)
- [Async Thunks](#async-thunks)
- [Selectors](#selectors)
- [React-Redux Hooks](#react-redux-hooks)
- [Best Practices](#best-practices)
- [Debugging](#debugging)

## Overview

The application uses Redux Toolkit for centralized state management. This allows for:

- Predictable state updates with a single source of truth
- Separation of state management logic from UI components
- Simplified async operations with thunks
- Standardized error handling
- Type-safe state with TypeScript integration

## Redux Store Structure

### Store Configuration

The Redux store is set up in `src/store/store.ts`:

```typescript
import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./slices/usersSlice";
import itemsReducer from "./slices/itemsSlice";
// ... other reducers

export const store = configureStore({
  reducer: {
    users: usersReducer,
    items: itemsReducer,
    orders: ordersReducer,
    cart: cartReducer,
    timeframe: timeframeReducer,
    tags: tagReducer,
    itemImages: itemImagesReducer,
    ui: uiReducer,
    locations: locationsReducer,
    logs: logsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Type Definitions

The `RootState` type captures the entire application state structure and `AppDispatch` provides typing for the dispatch function, both defined in `src/types/store.ts`:

```typescript
export interface RootState {
  users: UserState;
  items: ItemState;
  orders: OrdersState;
  cart: CartState;
  timeframe: TimeframeState;
  tags: TagState;
  // ...other state slices
}

export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;
```

### Store Provider

The Redux store is provided to the React application in `src/main.tsx`:

```typescript
import { Provider } from "react-redux";
import { store } from "./store/store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
```

## Slices

Redux Toolkit uses "slices" to organize state into logical domains. Each slice contains the reducer logic, action creators, and selectors for a specific domain.

### Slice Structure

Standard structure for a slice:

```typescript
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { api } from "../../api/service";

// State interface
interface MySliceState {
  data: SomeData[];
  selectedItem: SomeData | null;
  loading: boolean;
  error: string | null;
  errorContext: ErrorContext;
}

// Initial state
const initialState: MySliceState = {
  data: [],
  selectedItem: null,
  loading: false,
  error: null,
  errorContext: null,
};

// Async thunks (covered in next section)

// Create the slice
export const mySlice = createSlice({
  name: "mySlice",
  initialState,
  reducers: {
    // Synchronous reducers
    clearSelectedItem: (state) => {
      state.selectedItem = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle async thunk lifecycle actions
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      });
  },
});

// Export actions and reducer
export const { clearSelectedItem } = mySlice.actions;
export default mySlice.reducer;

// Selectors
export const selectAllItems = (state: RootState) => state.mySlice.data;
export const selectLoading = (state: RootState) => state.mySlice.loading;
```

### Example Slices

The application contains several domain-specific slices:

- **usersSlice**: User authentication and profile management
- **itemsSlice**: Storage items catalog and details
- **ordersSlice**: Order management and history
- **cartSlice**: Shopping cart functionality
- **tagsSlice**: Item categorization tags
- **uiSlice**: UI state like modals and dialogs
- **logsSlice**: System logs for administrators
- **locationsSlice**: Storage location management

### UI State Management

For UI-specific state that doesn't involve API calls, we use a dedicated `uiSlice`:

```typescript
interface UiState {
  itemModalState: {
    isOpen: boolean;
    currentStep: "details" | "images";
    createdItemId: string | null;
  };
}

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openItemModal: (state) => {
      state.itemModalState.isOpen = true;
      state.itemModalState.currentStep = "details";
      state.itemModalState.createdItemId = null;
    },
    closeItemModal: (state) => {
      state.itemModalState.isOpen = false;
      // ...other state updates
    },
    // ...other UI action reducers
  },
});
```

## Async Thunks

For asynchronous operations like API calls, we use Redux Toolkit's `createAsyncThunk`. This simplifies handling loading states, success responses, and error handling.

### Standard Thunk Pattern

```typescript
export const fetchAllItems = createAsyncThunk<Item[], void>(
  "items/fetchAllItems",
  async (_, { rejectWithValue }) => {
    try {
      return await itemsApi.getAllItems();
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch items"),
      );
    }
  },
);
```

### Error Handling

We use a utility function to standardize error extraction:

```typescript
export function extractErrorMessage(
  error: unknown,
  defaultMessage: string,
): string {
  if (typeof error === "string") {
    return error;
  }

  const apiError = error as ApiErrorResponse;

  if (apiError.response?.data?.message) {
    return apiError.response.data.message;
  }

  if (apiError.message) {
    return apiError.message;
  }

  return defaultMessage;
}
```

### Thunk Creation Helper

For even more standardization, we use a helper to create thunks:

```typescript
export function createApiThunk<ReturnType, ArgType = void>(
  typePrefix: string,
  apiCall: (arg: ArgType) => Promise<any>,
  errorMessage: string,
  transformResponse?: (response: any, arg: ArgType) => ReturnType,
) {
  return createAsyncThunk<ReturnType, ArgType, { rejectValue: string }>(
    typePrefix,
    async (arg, { rejectWithValue }) => {
      try {
        const response = await apiCall(arg);
        if (transformResponse) {
          return transformResponse(response, arg);
        }
        return response as unknown as ReturnType;
      } catch (error: unknown) {
        return rejectWithValue(extractErrorMessage(error, errorMessage));
      }
    },
  );
}
```

### Handling Thunk States

Each async thunk has three states: `pending`, `fulfilled`, and `rejected`. These are handled in the `extraReducers` section of the slice:

```typescript
extraReducers: (builder) => {
  builder
    .addCase(fetchAllItems.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchAllItems.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    })
    .addCase(fetchAllItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.errorContext = "fetch";
    });
};
```

## Selectors

Selectors are functions that extract specific pieces of state from the Redux store. We define them in each slice file:

```typescript
export const selectAllItems = (state: RootState) => state.items.items;
export const selectItemsLoading = (state: RootState) => state.items.loading;
export const selectItemsError = (state: RootState) => state.items.error;
export const selectSelectedItem = (state: RootState) =>
  state.items.selectedItem;
```

For more complex selections, we can combine or transform data:

```typescript
export const selectItemsErrorWithContext = (state: RootState) => ({
  message: state.items.error,
  context: state.items.errorContext,
});

export const selectIsAdmin = (state: RootState) =>
  state.users.selectedUser?.role === "tenant_admin" ||
  state.users.selectedUser?.role === "superVera";
```

## React-Redux Hooks

We use typed versions of React-Redux hooks for accessing the Redux store in components:

```typescript
// src/store/hooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Using Hooks in Components

```typescript
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllItems,
  selectAllItems,
  selectItemsLoading,
} from "@/store/slices/itemsSlice";

const ItemList = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);

  useEffect(() => {
    dispatch(fetchAllItems());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};
```

## Best Practices

### 1. Keep State Normalized

For collections of items that are accessed by ID, consider using the `createEntityAdapter` from Redux Toolkit:

```typescript
const ordersAdapter = createEntityAdapter<Order>({
  selectId: (order) => order.id,
  sortComparer: (a, b) => b.created_at.localeCompare(a.created_at),
});

const initialState = ordersAdapter.getInitialState({
  currentOrder: null,
  userOrders: [],
  loading: false,
  error: null,
  errorContext: null,
});
```

### 2. Use Type-Safe Actions

Always define proper types for your state and action payloads:

```typescript
interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

// In reducers
clearSelectedUser: (state) => {
  state.selectedUser = null;
},
selectUser: (state, action: PayloadAction<User>) => {
  state.selectedUser = action.payload;
},
```

### 3. Error Handling Patterns

Use consistent error handling with context:

```typescript
export type ErrorContext =
  | "create"
  | "fetch"
  | "update"
  | "delete"
  | "assign"
  | null;

interface ErrorState {
  message: string | null;
  context: ErrorContext;
}
```

### 4. Use Unwrap for Handle Promise Results

When you need to handle the result of a thunk directly in a component:

```typescript
try {
  const result = await dispatch(createItem(itemData)).unwrap();
  toast.success("Item created successfully!");
  return result;
} catch (error) {
  toast.error("Failed to create item");
  return null;
}
```

### 5. Split Logical Domains

Keep your state organized by logical domains. Don't put everything in one big slice.

### 6. Avoid Duplicate Data

Don't duplicate the same data in multiple parts of the state. Use selectors to derive data from the state.

### 7. Deduplicate Related Entities

When handling arrays of related entities, use deduplication patterns to ensure data consistency:

```typescript
// Example from itemsSlice.ts - deduplicating tags
if (updatedItem.storage_item_tags && updatedItem.storage_item_tags.length > 0) {
  updatedItem.storage_item_tags = Array.from(
    new Map(
      updatedItem.storage_item_tags.map((tag) => [tag.id, tag]),
    ).values(),
  );
}
```

## Debugging

### Redux DevTools

The Redux store is configured to work with the Redux DevTools Extension. Install the extension for your browser to inspect the Redux state and actions.

### Logging

Use selective console logging for debugging specific actions:

```typescript
createOrder: async (orderData) => {
  console.log('Creating order with data:', orderData);
  const response = await api.post("/orders", orderData);
  console.log('Order created:', response);
  return response;
},
```

### Common Issues

1. **Immutability**: Redux Toolkit uses Immer under the hood, so you can write code that looks like it's mutating state directly, but it's actually creating a new state object.

2. **Circular Dependencies**: Avoid importing one slice into another. Instead, use the RootState type for selectors.

3. **Type Errors**: If you're seeing TypeScript errors with your thunks or selectors, make sure you're using the correct types from your state interfaces.

4. **Stale State**: If components aren't re-rendering with state updates, check that you're using selectors correctly and that the component is subscribed to the right part of the state.
