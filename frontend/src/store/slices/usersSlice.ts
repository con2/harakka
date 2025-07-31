import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { usersApi } from "../../api/services/users";

import { RootState } from "../store";
import { supabase } from "../../config/supabase";
import { extractErrorMessage } from "@/store/utils/errorHandlers";
import { Address } from "@/types/address";
import { UserState } from "@/types";
import { CreateUserDto, UpdateUserDto, UserProfile } from "@common/user.types";

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  errorContext: null,
  selectedUser: null,
  selectedUserLoading: false,
  selectedUserAddresses: [],
  userCount: 0,
};

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

// Get current user thunk (for authenticated user's own profile)
export const getCurrentUser = createAsyncThunk(
  "users/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.getCurrentUser();
    } catch (error: unknown) {
      // If we get a 404 or 403 on current user, the session might be invalid
      const axiosError = error as { response?: { status?: number } };
      if (
        axiosError.response?.status === 404 ||
        axiosError.response?.status === 403
      ) {
        // Clear the auth session
        await supabase.auth.signOut();
      }
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch current user"),
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
    { id, data }: { id: string; data: UpdateUserDto },
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

// Get addresses for a specific user thunk
export const getUserAddresses = createAsyncThunk(
  "users/getUserAddresses",
  async (id: string, { rejectWithValue }) => {
    try {
      return await usersApi.getAddresses(id);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch user addresses"),
      );
    }
  },
);

// Create new address thunk
export const addAddress = createAsyncThunk(
  "users/addAddress",
  async (
    { id, address }: { id: string; address: Address },
    { rejectWithValue },
  ) => {
    try {
      return await usersApi.addAddress(id, address);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to add address"),
      );
    }
  },
);

// Update address thunk
export const updateAddress = createAsyncThunk(
  "users/updateAddress",
  async (
    {
      id,
      addressId,
      address,
    }: { id: string; addressId: string; address: Address },
    { rejectWithValue },
  ) => {
    try {
      return await usersApi.updateAddress(id, addressId, address);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to update address"),
      );
    }
  },
);

// Delete address thunk
export const deleteAddress = createAsyncThunk(
  "users/deleteAddress",
  async (
    { id, addressId }: { id: string; addressId: string },
    { rejectWithValue },
  ) => {
    try {
      await usersApi.deleteAddress(id, addressId);
      return addressId; // Return the address ID to remove from state
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to delete address"),
      );
    }
  },
);

// get users count (all users, active and inactive)
export const getUserCount = createAsyncThunk(
  "users/getUserCount",
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.getUserCount();
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch bookings count"),
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
    selectUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearAddresses: (state) => {
      state.selectedUserAddresses = [];
    },
  },

  // handle API call (async thunk) lifecycle actions
  extraReducers: (builder) => {
    builder
      .addCase(getUserCount.fulfilled, (state, action) => {
        state.userCount = action.payload.data;
      })
      .addCase(getUserCount.rejected, (state) => {
        state.error = null;
        state.errorContext = "fetch";
      })
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

      // fetch current user
      .addCase(getCurrentUser.pending, (state) => {
        state.selectedUserLoading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.selectedUserLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
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
        state.users = state.users.filter(
          (user: UserProfile) => user.id !== action.payload,
        );
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
        state.users = state.users.map((user: UserProfile) =>
          user.id === action.payload.id ? action.payload : user,
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "update";
      })

      // fetch user addresses
      .addCase(getUserAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(getUserAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUserAddresses = action.payload;
      })
      .addCase(getUserAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch";
      })

      // Add Address
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUserAddresses = [
          ...(state.selectedUserAddresses || []),
          action.payload,
        ];
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "create";
      })

      // Update Address
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUserAddresses = (state.selectedUserAddresses || []).map(
          (address) =>
            address.id === action.payload.id ? action.payload : address,
        );
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "update";
      })

      // Delete Address
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUserAddresses = (
          state.selectedUserAddresses ?? []
        ).filter((address) => address.id !== action.payload);
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "delete";
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
export const selectSelectedUserLoading = (state: RootState) =>
  state.users.selectedUserLoading;

export const selectUserAddresses = (state: RootState) =>
  state.users.selectedUserAddresses;

export const selectTotalUsersCount = (state: RootState) =>
  state.users.userCount;

// export actions from the slice
export const { clearSelectedUser, selectUser, clearAddresses } =
  usersSlice.actions;

// export the reducer to be used in the store
export default usersSlice.reducer;
