import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"; // Redux Toolkit utilities for async actions and state slices
import { usersApi } from "../../api/services/users"; // API service functions to interact with the backend
import { UserState, UserProfile, CreateUserDto } from "../../types/user";
import { RootState } from "../store"; // rootState type to access global Redux state
import { supabase } from "../../config/supabase";
import { AxiosError } from "axios";

const initialState: UserState = {
  users: [], // users fetched from the backend
  loading: false,
  error: null,
  selectedUser: null,
  selectedUserLoading: false,
};

// Async Thunks (API Calls)

// fetch all users
export const fetchAllUsers = createAsyncThunk(
  "users/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.getAllUsers();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

// Create user thunk
export const createUser = createAsyncThunk(
  "users/createUser",
  async (user: CreateUserDto, { rejectWithValue }) => {
    try {
      return await usersApi.createUser(user);
    } catch (error: unknown) {
      console.error("Create user error:", error);
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        "Failed to create user";

      return rejectWithValue(message);
    }
  },
);

// Get user by ID thunk
export const getUserById = createAsyncThunk(
  "users/getUserById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await usersApi.getUserById(id);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      // If we get a 404 on current user, the session might be invalid
      if (axiosError.response?.status === 404) {
        // Clear the auth session
        await supabase.auth.signOut();
      }
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to fetch user",
      );
    }
  },
);

// Delete user thunk
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await usersApi.deleteUser(id);
      return id; // Return deleted user ID to remove from state
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to delete user",
      );
    }
  },
);

// Update user thunk
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (
    { id, data }: { id: string; data: Partial<UserProfile> },
    { rejectWithValue },
  ) => {
    try {
      return await usersApi.updateUser(id, data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to update user",
      );
    }
  },
);

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.error = null;
    },
    selectUser: (state, action: PayloadAction<UserProfile>) => {
      state.selectedUser = action.payload;
    },
  },

  // handle API call (async thunk) lifecycle actions
  extraReducers: (builder) => {
    builder
      // fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // fetch user by ID
      .addCase(getUserById.pending, (state) => {
        state.selectedUserLoading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.selectedUserLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.selectedUserLoading = false;
        state.error = action.payload as string;
      })

      // create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // update User
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user,
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// selectors for accessing state
export const selectAllUsers = (state: RootState) => state.users.users;
export const selectLoading = (state: RootState) => state.users.loading;
export const selectError = (state: RootState) => state.users.error;
export const selectSelectedUser = (state: RootState) =>
  state.users.selectedUser;
export const selectUserRole = (state: RootState) =>
  state.users.selectedUser?.role || null;
export const selectIsAdmin = (state: RootState) =>
  state.users.selectedUser?.role === "admin";
export const selectIsSuperVera = (state: RootState) =>
  state.users.selectedUser?.role === "superVera";
export const selectIsUser = (state: RootState) =>
  state.users.selectedUser?.role === "user";
export const selectSelectedUserLoading = (state: RootState) =>
  state.users.selectedUserLoading;

// export actions from the slice
export const { clearSelectedUser, selectUser } = usersSlice.actions;

// export the reducer to be used in the store
export default usersSlice.reducer;
