import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { usersApi } from "../../api/services/users";
import { UserState, UserProfile } from "../../types/user";
import { RootState } from "../store";

const initialState: UserState = {
    users: [],
    loading: false,
    error: null,
    selectedUser: null,
}

export const fetchAllUsers = createAsyncThunk('users/fetchAllUsers', async (_, { rejectWithValue }) => {
    try {
        return await usersApi.getAllUsers();
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
});

export const createUser = createAsyncThunk('users/createUser', async (user: UserProfile, { rejectWithValue }) => {
    try {
        return await usersApi.createUser(user);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to create user");
    }
});

export const getUserById = createAsyncThunk('users/getUserById', async (userId: string, { rejectWithValue }) => {
    try {
        return await usersApi.getUserById(userId);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
    }
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (id: string, { rejectWithValue }) => {
    try {
        await usersApi.deleteUser(id);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to delete user");
    }
});

export const updateUser = createAsyncThunk('users/updateUser', async ({ id, data }: { id: string; data: Partial<UserProfile> }, { rejectWithValue }) => {
    try {
        return await usersApi.updateUser(id, data);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
});

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearSelectedUser: (state)  => {
            state.selectedUser = null;
            state.error = null;
        },
        selectUser: (state, action: PayloadAction<UserProfile>) => {
            state.selectedUser = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => { state.loading = true; })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user.id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            .addCase(updateUser.fulfilled, (state, action) => {
                state.users = state.users.map(user => 
                    user.id === action.payload.id ? action.payload : user
                );
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    }
});

export const selectAllUsers = (state: RootState) => state.users.users;
export const selectLoading = (state: RootState) => state.users.loading;
export const selectError = (state: RootState) => state.users.error;
export const selectSelectedUser = (state: RootState) => state.users.selectedUser;

export const { clearSelectedUser, selectUser } = usersSlice.actions;
export default usersSlice.reducer;