# API Integration Guide

This document outlines how the frontend application integrates with backend APIs in the Harakka App.

## Table of Contents

- [Overview](#overview)
- [API Client Setup](#api-client-setup)
- [Authentication](#authentication)
- [Service Structure](#service-structure)
- [Error Handling](#error-handling)
- [Redux Integration](#redux-integration)
- [Best Practices](#best-practices)

## Overview

The frontend communicates with our backend through a RESTful API architecture following these principles:

- **Centralized Configuration**: All API-related setup is managed in one place
- **Type Safety**: TypeScript interfaces define request and response shapes
- **Service-Based Organization**: API calls are grouped by domain into service modules
- **Automatic Authentication**: JWT tokens are automatically added to requests
- **Standard Error Handling**: Consistent error processing across all API calls
- **Redux Integration**: API state is managed through Redux Toolkit

## API Client Setup

We use Axios as our HTTP client, configured in `src/api/axios.ts`:

```typescript
// Base configuration with environment-specific API URL
const apiUrl = import.meta.env.VITE_API_URL as string;
const baseURL = apiUrl
  ? apiUrl.startsWith("http")
    ? apiUrl
    : `https://${apiUrl}`
  : "http://localhost:3000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Request Interceptors

We use interceptors to automatically include authentication and user information:

```typescript
// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add user ID from localStorage to all requests
  const userId = localStorage.getItem("userId");
  if (userId) {
    config.headers["x-user-id"] = userId;
  }

  return config;
});
```

### Response Interceptors

Our response interceptor automatically extracts the data property and provides error logging:

```typescript
api.interceptors.response.use(
  (response) => {
    return response.data; // Extract data directly
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  },
);
```

## Authentication

Authentication is handled through Supabase, with tokens being managed as follows:

### Token Management

```typescript
// Caching tokens for better performance
let cachedToken: string | null = null;

export async function getAuthToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;

  const { data } = await supabase.auth.getSession();
  cachedToken = data.session?.access_token || null;
  return cachedToken;
}
```

### Auth State Monitoring

We track authentication state changes to handle session events:

```typescript
supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_IN") {
    console.log("User signed in successfully");
    // Additional sign-in logic
  } else if (event === "SIGNED_OUT") {
    console.log("User signed out");
    // Clean up user-specific data
  } else if (event === "USER_UPDATED") {
    console.log("User updated");
  } else if (event === "PASSWORD_RECOVERY") {
    console.log("Password recovery requested");
  }
});
```

## Service Structure

API services are organized by domain in dedicated service modules under `src/api/services/`:

```
src/api/services/
├── items.ts           # Storage items operations
├── locations.ts       # Location operations
├── logs.ts            # System log access
├── orders.ts          # Order management
├── tags.ts            # Tag management
└── users.ts           # User profile management
```

### Example Service Module

Each service module follows the same pattern:

```typescript
import { api } from "../axios";
import { ItemType } from "@/types";

export const itemsApi = {
  // Get all storage items
  getAllItems: (): Promise<ItemType[]> => api.get("/storage-items"),

  // Get a specific item by ID
  getItemById: (id: string): Promise<ItemType> =>
    api.get(`/storage-items/${id}`),

  // Create a new item
  createItem: (item: CreateItemDto): Promise<ItemType> =>
    api.post("/storage-items", item),

  // Update an existing item
  updateItem: (id: string, item: UpdateItemDto): Promise<ItemType> =>
    api.put(`/storage-items/${id}`, item),

  // Delete an item
  deleteItem: (id: string): Promise<void> =>
    api.post(`/storage-items/${id}/soft-delete`),
};
```

## Error Handling

We implement a centralized error extraction utility to standardize error handling:

```typescript
// src/store/utils/errorHandlers.ts
export function extractErrorMessage(
  error: unknown,
  defaultMessage: string,
): string {
  if (typeof error === "string") {
    return error;
  }

  const apiError = error as ApiErrorResponse;

  // Check for API error response format
  if (apiError.response?.data?.message) {
    return apiError.response.data.message;
  }

  if (apiError.response?.data?.error) {
    return apiError.response.data.error;
  }

  if (apiError.message) {
    return apiError.message;
  }

  return defaultMessage;
}
```

Error contexts are typed to provide consistent error handling:

```typescript
export type ErrorContext =
  | "create"
  | "fetch"
  | "update"
  | "delete"
  | "assign"
  | "confirm"
  | "cancel"
  | "reject"
  | "return"
  | "update-payment-status"
  | null;
```

## Redux Integration

### Async Thunks

We use Redux Toolkit's `createAsyncThunk` to integrate API calls with our Redux store:

```typescript
// Example of an async thunk for fetching items
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

### Standard Pattern for API Thunks

We follow a consistent pattern for thunks:

```typescript
export const thunkName = createAsyncThunk<ReturnType, ParamType>(
  "sliceName/actionName",
  async (params, { rejectWithValue }) => {
    try {
      return await apiService.apiMethod(params);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Default error message"),
      );
    }
  },
);
```

### Slice Integration

Thunks are integrated with reducers to manage loading states, data, and errors:

```typescript
extraReducers: (builder) => {
  builder
    .addCase(fetchAllItems.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.errorContext = null;
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

## Best Practices

### 1. Type All Request and Response Data

Always define TypeScript interfaces for API data:

```typescript
// Request type
interface CreateOrderDto {
  user_id: string;
  items: Array<{
    item_id: string;
    quantity: number;
    start_date: string;
    end_date: string;
  }>;
}

// API call with types
createOrder: async (orderData: CreateOrderDto): Promise<BookingOrder> => {
  return api.post("/bookings", orderData);
};
```

### 2. Use Service-Specific Headers When Needed

Some endpoints may require special headers:

```typescript
// Example with custom headers
createOrder: async (orderData: CreateOrderDto): Promise<BookingOrder> => {
  const userId = orderData.user_id;
  return api.post("/bookings", orderData, {
    headers: {
      "x-user-id": userId || "",
    },
  });
};
```

### 3. Handle Authentication Failures

When authentication fails, handle it gracefully:

```typescript
// In getUserById thunk
if (axiosError.response?.status === 404) {
  // Clear the auth session if user not found
  await supabase.auth.signOut();
}
```

### 4. Testing API Integration

When writing tests for components that use API calls:

```typescript
// Mock API responses in tests
jest.mock("@/api/services/items", () => ({
  itemsApi: {
    getAllItems: jest.fn().mockResolvedValue([{ id: "1", name: "Test Item" }]),
  },
}));

test("loads and displays items", async () => {
  render(<ItemList />);
  // Assert loading state shown
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  // Wait for items to load
  await waitFor(() => {
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });
});
```

### 5. Error Handling in Components

Use selectors to access error states in components:

```tsx
const ItemList = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);

  useEffect(() => {
    dispatch(fetchAllItems());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};
```

### 6. Caching Considerations

For frequently used data, consider implementing simple caching:

```typescript
// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

export const getCachedData = async (
  key: string,
  fetchFn: () => Promise<any>,
) => {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, { data, timestamp: now });
  return data;
};
```

### 7. Debouncing API Requests

For user input that triggers API calls, use debouncing:

```typescript
import { useCallback, useState } from "react";
import debounce from "lodash/debounce";

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const debouncedSet = useCallback(
    debounce((value) => {
      setDebouncedValue(value);
    }, delay),
    [delay],
  );

  useEffect(() => {
    debouncedSet(value);
    return () => {
      debouncedSet.cancel();
    };
  }, [value, debouncedSet]);

  return debouncedValue;
}
```

By following these patterns and guidelines, we ensure consistent, maintainable, and type-safe API integration throughout the application.
