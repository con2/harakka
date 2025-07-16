import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { roleApi } from "@/api/services/roles";
import {
  CreateUserRoleDto,
  UpdateUserRoleDto,
  RolesState,
} from "@/types/roles";
import { extractErrorMessage } from "@/store/utils/errorHandlers";

const initialState: RolesState = {
  currentUserRoles: [],
  currentUserOrganizations: [],
  isSuperVera: false,
  allUserRoles: [],
  loading: false,
  adminLoading: false,
  error: null,
  adminError: null,
  errorContext: null,
  availableRoles: [],
};

// Async thunks
export const fetchCurrentUserRoles = createAsyncThunk(
  "roles/fetchCurrentUserRoles",
  async (_, { rejectWithValue }) => {
    try {
      const [rolesData, orgsData, superVeraData] = await Promise.all([
        roleApi.getCurrentUserRoles(),
        roleApi.getUserOrganizations(),
        roleApi.isSuperVera(),
      ]);

      return {
        roles: rolesData,
        organizations: orgsData,
        isSuperVera: superVeraData.isSuperVera,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch current user roles"),
      );
    }
  },
);

export const fetchAllUserRoles = createAsyncThunk(
  "roles/fetchAllUserRoles",
  async (_, { rejectWithValue }) => {
    try {
      return await roleApi.getAllUserRoles();
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch all user roles"),
      );
    }
  },
);

export const fetchAvailableRoles = createAsyncThunk(
  "roles/fetchAvailableRoles",
  async (_, { rejectWithValue }) => {
    try {
      return await roleApi.getAvailableRoles();
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch available roles"),
      );
    }
  },
);

export const createUserRole = createAsyncThunk(
  "roles/createUserRole",
  async (roleData: CreateUserRoleDto, { rejectWithValue }) => {
    try {
      return await roleApi.createUserRole(roleData);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to create user role"),
      );
    }
  },
);

export const updateUserRole = createAsyncThunk(
  "roles/updateUserRole",
  async (
    {
      tableKeyId,
      updateData,
    }: { tableKeyId: string; updateData: UpdateUserRoleDto },
    { rejectWithValue },
  ) => {
    try {
      return await roleApi.updateUserRole(tableKeyId, updateData);
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to update user role"),
      );
    }
  },
);

export const deleteUserRole = createAsyncThunk(
  "roles/deleteUserRole",
  async (tableKeyId: string, { rejectWithValue }) => {
    try {
      await roleApi.deleteUserRole(tableKeyId);
      return tableKeyId;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to delete user role"),
      );
    }
  },
);

export const permanentDeleteUserRole = createAsyncThunk(
  "roles/permanentDeleteUserRole",
  async (tableKeyId: string, { rejectWithValue }) => {
    try {
      await roleApi.permanentDeleteUserRole(tableKeyId);
      return tableKeyId;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to permanently delete user role"),
      );
    }
  },
);

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearRoleErrors: (state) => {
      state.error = null;
      state.adminError = null;
      state.errorContext = null;
    },

    // Reset all roles data
    resetRoles: (state) => {
      state.currentUserRoles = [];
      state.currentUserOrganizations = [];
      state.isSuperVera = false;
      state.allUserRoles = [];
      state.error = null;
      state.adminError = null;
      state.errorContext = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current user roles
      .addCase(fetchCurrentUserRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(fetchCurrentUserRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUserRoles = action.payload.roles;
        state.currentUserOrganizations = action.payload.organizations;
        state.isSuperVera = action.payload.isSuperVera;
      })
      .addCase(fetchCurrentUserRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.errorContext = "fetch-current-user-roles";
      })

      // Fetch all user roles (admin)
      .addCase(fetchAllUserRoles.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAllUserRoles.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.allUserRoles = action.payload;
      })
      .addCase(fetchAllUserRoles.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
        state.errorContext = "fetch-all-user-roles";
      })

      // Create user role
      .addCase(createUserRole.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(createUserRole.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.allUserRoles.push(action.payload);
      })
      .addCase(createUserRole.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
        state.errorContext = "create-user-role";
      })

      // Fetch available roles
      .addCase(fetchAvailableRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorContext = null;
      })
      .addCase(fetchAvailableRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.availableRoles = action.payload;
      })
      .addCase(fetchAvailableRoles.rejected, (state, action) => {
        state.loading = false;
        state.adminError = action.payload as string;
        state.errorContext = "fetch-available-roles";
      })

      // Update user role
      .addCase(updateUserRole.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.adminLoading = false;
        const index = state.allUserRoles.findIndex(
          (role) => role.id === action.payload.id,
        );
        if (index !== -1) {
          state.allUserRoles[index] = action.payload;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
        state.errorContext = "update-user-role";
      })

      // Delete user role
      .addCase(deleteUserRole.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(deleteUserRole.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.allUserRoles = state.allUserRoles.filter(
          (role) => role.id !== action.payload,
        );
      })
      .addCase(deleteUserRole.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
        state.errorContext = "delete-user-role";
      })

      // Permanent delete user role
      .addCase(permanentDeleteUserRole.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(permanentDeleteUserRole.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.allUserRoles = state.allUserRoles.filter(
          (role) => role.id !== action.payload,
        );
      })
      .addCase(permanentDeleteUserRole.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
        state.errorContext = "permanent-delete-user-role";
      });
  },
});

// Helper functions for role checking
export const hasRole = (
  state: RootState,
  roleName: string,
  organizationId?: string,
): boolean => {
  return state.roles.currentUserRoles.some((role) => {
    const roleMatch = role.role_name === roleName;
    const orgMatch = organizationId
      ? role.organization_id === organizationId
      : true;
    return roleMatch && orgMatch && role.is_active;
  });
};

export const hasAnyRole = (
  state: RootState,
  roleNames: string[],
  organizationId?: string,
): boolean => {
  return roleNames.some((roleName) => hasRole(state, roleName, organizationId));
};

// Selectors
export const selectCurrentUserRoles = (state: RootState) =>
  state.roles.currentUserRoles;
export const selectCurrentUserOrganizations = (state: RootState) =>
  state.roles.currentUserOrganizations;
export const selectIsSuperVera = (state: RootState) => state.roles.isSuperVera;
export const selectAllUserRoles = (state: RootState) =>
  state.roles.allUserRoles;
export const selectRolesLoading = (state: RootState) => state.roles.loading;
export const selectAdminLoading = (state: RootState) =>
  state.roles.adminLoading;
export const selectRolesError = (state: RootState) => state.roles.error;
export const selectAdminError = (state: RootState) => state.roles.adminError;
export const selectErrorContext = (state: RootState) =>
  state.roles.errorContext;

export const selectAvailableRoles = (state: RootState) =>
  state.roles.availableRoles;

// Computed selectors
export const selectIsAdmin = (state: RootState) => {
  return (
    hasRole(state, "admin") ||
    hasRole(state, "superVera") ||
    state.roles.isSuperVera
  );
};

export const selectUserRolesByOrganization = (
  state: RootState,
  organizationId: string,
) => {
  return state.roles.currentUserRoles.filter(
    (role) => role.organization_id === organizationId,
  );
};

// Export actions
export const { clearRoleErrors, resetRoles } = rolesSlice.actions;
export default rolesSlice.reducer;
