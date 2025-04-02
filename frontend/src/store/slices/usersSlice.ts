import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { usersApi } from "../../api/services/users";
import { UserState } from "../../types/user";
import { RootState } from "../store";

// to be updated
const initialState: UserState = {
    users: [],
    loading: false,
    error: null,
    selectedUser: null,
}

export const fetchAllUsers = createAsyncThunk('users/fetchAllUsers', async () => {
    const response = await usersApi.getUsers();
    return response;
})

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearSelectedUser: (state)  => {
            state.selectedUser = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAllUsers.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchAllUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.users = action.payload;
        })
        .addCase(fetchAllUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string || 'Failed to load users' 
        })
    }
})

export const selectAllUsers = (state: RootState) => state.users.users;
export const selectLoading = (state: RootState) => state.users.loading;
export const selectError = (state: RootState) => state.users.error;
export const selectSelectedUser = (state: RootState) => state.users.selectedUser;

export const { clearSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;