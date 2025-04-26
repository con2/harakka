import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { usersApi } from "../../api/services/users";
import { UserState, UserProfile, CreateUserDto } from "../../types/user";
import { RootState } from "../store";
import { supabase } from "../../config/supabase";
import { extractErrorMessage } from "@/store/utils/errorHandlers";

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  errorContext: null,
  selectedUser: null,
  selectedUserLoading: false,
};

// fetch all users
export const fetchAllUsers = createAsyncThunk(
  "users/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.getAllUsers();
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch users"),
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
      return rejectWithValue(
        extractErrorMessage(error, "Failed to create user"),
      );
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
      // If we get a 404 on current user, the session might be invalid
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        // Clear the auth session
        await supabase.auth.signOut();
      }
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch user"),
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
      return rejectWithValue(
        extractErrorMessage(error, "Failed to delete user"),
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
      return rejectWithValue(
        extractErrorMessage(error, "Failed to update user"),
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
      state.errorContext = null;
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
        state.error = null;
        state.errorContext = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })

      // fetch user by ID
      .addCase(getUserById.pending, (state) => {
        state.selectedUserLoading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.selectedUserLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.selectedUserLoading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })

      // create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "create";
      })

      // delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "delete";
      })

      // update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user,
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "update";
      });
  },
});

// selectors for accessing state
export const selectAllUsers = (state: RootState) => state.users.users;
export const selectLoading = (state: RootState) => state.users.loading;
export const selectError = (state: RootState) => state.users.error;
export const selectErrorContext = (state: RootState) =>
  state.users.errorContext;
export const selectErrorWithContext = (state: RootState) => ({
  message: state.users.error,
  context: state.users.errorContext,
});
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
