import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { roleApi } from "@/api/services/roles";
import {
  CreateUserRoleDto,
  UpdateUserRoleDto,
  RolesState,
  UserOrganization,
} from "@/types/roles";
import { extractErrorMessage } from "@/store/utils/errorHandlers";
import { ViewUserRolesWithDetails } from "@common/role.types";
import { refreshSupabaseSession } from "@/store/utils/refreshSupabaseSession";

// Load initial state for chosen role from localStorage (near the top of the file)
const savedContext = localStorage.getItem("activeRoleContext");
const initialActiveContext = savedContext
  ? JSON.parse(savedContext)
  : { organizationId: null, roleName: null, organizationName: null };

const initialState: RolesState = {
  currentUserRoles: [] as ViewUserRolesWithDetails[],
  currentUserOrganizations: [] as UserOrganization[],
  allUserRoles: [] as ViewUserRolesWithDetails[],
  loading: false,
  adminLoading: false,
  error: null,
  adminError: null,
  errorContext: null,
  availableRoles: [],
  activeRoleContext: initialActiveContext,
};

// Async thunks
export const fetchCurrentUserRoles = createAsyncThunk(
  "roles/fetchCurrentUserRoles",
  async (_, { rejectWithValue }) => {
    try {
      const [rolesData, orgsData] = await Promise.all([
        roleApi.getCurrentUserRoles(),
        roleApi.getUserOrganizations(),
      ]);

      return {
        roles: rolesData,
        organizations: orgsData,
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
  async (
    roleData: CreateUserRoleDto,
    { getState, rejectWithValue, dispatch },
  ) => {
    try {
      const result = await roleApi.createUserRole(roleData);

      // If the affected user is the current user, clear refresh session and get new JWT
      const state = getState() as RootState;
      const currentUserId = state.users.selectedUser?.id;
      if (roleData.user_id === currentUserId && currentUserId) {
        await refreshSupabaseSession();
        // Refetch roles
        void dispatch(fetchCurrentUserRoles());
      }

      return result;
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
    { getState, rejectWithValue, dispatch },
  ) => {
    try {
      const result = await roleApi.updateUserRole(tableKeyId, updateData);

      // If the affected user is the current user, clear localStorage and refresh session
      const state = getState() as RootState;
      const currentUserId = state.users.selectedUser?.id;
      if (result.user_id === currentUserId && currentUserId) {
        await refreshSupabaseSession();
        void dispatch(fetchCurrentUserRoles());
      }

      return result;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to update user role"),
      );
    }
  },
);

export const replaceUserRole = createAsyncThunk(
  "roles/replaceUserRole",
  async (
    {
      oldRoleId,
      newRoleData,
    }: { oldRoleId: string; newRoleData: CreateUserRoleDto },
    { getState, rejectWithValue, dispatch },
  ) => {
    try {
      const result = await roleApi.replaceUserRole(oldRoleId, newRoleData);

      // If the affected user is the current user, refresh session
      const state = getState() as RootState;
      const currentUserId = state.users.selectedUser?.id;
      if (newRoleData.user_id === currentUserId && currentUserId) {
        await refreshSupabaseSession();
        void dispatch(fetchCurrentUserRoles());
      }

      return result;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to replace user role"),
      );
    }
  },
);

export const deleteUserRole = createAsyncThunk(
  "roles/deleteUserRole",
  async (tableKeyId: string, { getState, rejectWithValue, dispatch }) => {
    try {
      // Find the role before deleting to check user_id
      const state = getState() as RootState;
      const role = state.roles.allUserRoles.find((r) => r.id === tableKeyId);
      const currentUserId = state.users.selectedUser?.id;

      await roleApi.deleteUserRole(tableKeyId);

      if (role && role.user_id === currentUserId && currentUserId) {
        await refreshSupabaseSession();
        void dispatch(fetchCurrentUserRoles());
      }

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
  async (tableKeyId: string, { getState, rejectWithValue, dispatch }) => {
    try {
      // Find the role before deleting to check user_id
      const state = getState() as RootState;
      const role = state.roles.allUserRoles.find((r) => r.id === tableKeyId);
      const currentUserId = state.users.selectedUser?.id;

      await roleApi.permanentDeleteUserRole(tableKeyId);

      if (role && role.user_id === currentUserId && currentUserId) {
        await refreshSupabaseSession();
        void dispatch(fetchCurrentUserRoles());
      }

      return tableKeyId;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to permanently delete user role"),
      );
    }
  },
);

export const leaveOrg = createAsyncThunk(
  "roles/leaveOrg",
  async (tableKeyId: string, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState() as RootState;
      const role = state.roles.allUserRoles.find((r) => r.id === tableKeyId);
      const currentUserId = state.users.selectedUser?.id;
      const activeOrgId = state.roles.activeRoleContext.organizationId;

      await roleApi.leaveOrg(tableKeyId);

      if (role && role.user_id === currentUserId && currentUserId) {
        await refreshSupabaseSession();
        try {
          // Refresh current user's roles and get the updated list
          const payload = await dispatch(fetchCurrentUserRoles()).unwrap();
          const remainingRoles: ViewUserRolesWithDetails[] =
            payload?.roles ?? [];

          // If the removed role belonged to the currently active organization,
          // update activeRoleContext to fallback to Global 'user' role
          if (role.organization_id === activeOrgId) {
            const globalUserRole = remainingRoles.find((r) => {
              const orgName = r.organization_name?.toLowerCase?.() ?? "";
              const roleName = r.role_name?.toLowerCase?.() ?? "";
              return orgName === "global" && roleName === "user";
            });

            if (globalUserRole) {
              const newContext = {
                organizationId: globalUserRole.organization_id,
                organizationName: globalUserRole.organization_name,
                roleName: globalUserRole.role_name,
              };
              dispatch(setActiveRoleContext(newContext));
            } else if (remainingRoles.length > 0) {
              // Fallback to first remaining role if no Global user role found
              const firstRole = remainingRoles[0];
              const newContext = {
                organizationId: firstRole.organization_id,
                organizationName: firstRole.organization_name,
                roleName: firstRole.role_name,
              };
              dispatch(setActiveRoleContext(newContext));
            } else {
              // No roles left - clear context
              dispatch(clearActiveRoleContext());
            }
          }
        } catch (err) {
          console.error("Failed to refresh roles after leaveOrg:", err);
        }
      }

      return tableKeyId;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to leave organization"),
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
      state.allUserRoles = [];
      state.error = null;
      state.adminError = null;
      state.errorContext = null;

      // Clear active context when resetting roles
      state.activeRoleContext = {
        organizationId: null,
        roleName: null,
        organizationName: null,
      };
      localStorage.removeItem("activeRoleContext");
    },

    // Reducers for active role context
    setActiveRoleContext: (state, action) => {
      state.activeRoleContext = action.payload;
      localStorage.setItem("activeRoleContext", JSON.stringify(action.payload));
    },

    clearActiveRoleContext: (state) => {
      state.activeRoleContext = {
        organizationId: null,
        roleName: null,
        organizationName: null,
      };
      localStorage.removeItem("activeRoleContext");
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

        // Validate or initialize active role context against the fresh roles list.
        // If the persisted context is missing or invalid (not present/active anymore),
        // reset it to a sane default: prefer Global 'user', else the first active role.
        const roles = state.currentUserRoles || [];
        const hasAnyRoles = roles.length > 0;

        const persisted = state.activeRoleContext;
        const persistedValid = Boolean(
          persisted?.organizationId &&
            persisted?.roleName &&
            roles.some(
              (r) =>
                r.is_active &&
                r.organization_id === persisted.organizationId &&
                r.role_name === persisted.roleName,
            ),
        );

        if (!persistedValid && hasAnyRoles) {
          const GLOBAL_ROLE = roles.find(
            (r) =>
              r.is_active && r.organization_name === "Global" && r.role_name,
          );
          const FIRST_ACTIVE = roles.find((r) => r.is_active) ?? roles[0];
          const newContext = {
            organizationId:
              GLOBAL_ROLE?.organization_id ?? FIRST_ACTIVE.organization_id,
            organizationName:
              GLOBAL_ROLE?.organization_name ?? FIRST_ACTIVE.organization_name,
            roleName: GLOBAL_ROLE?.role_name ?? FIRST_ACTIVE.role_name,
          };
          state.activeRoleContext = newContext;
          localStorage.setItem("activeRoleContext", JSON.stringify(newContext));
        }
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

        // If this role belongs to the current user, add it to currentUserRoles too
        const currentUserId = action.meta.arg.user_id;
        const stateUserId = state.currentUserRoles[0]?.user_id;
        if (currentUserId && currentUserId === stateUserId) {
          state.currentUserRoles.push(action.payload);
        }
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
          (role: ViewUserRolesWithDetails) => role.id === action.payload.id,
        );
        if (index !== -1) {
          state.allUserRoles[index] = action.payload;
        }
        // Also update in current user roles if it exists there
        const currentIndex = state.currentUserRoles.findIndex(
          (role) => role.id === action.payload.id,
        );
        if (currentIndex !== -1) {
          state.currentUserRoles[currentIndex] = action.payload;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
        state.errorContext = "update-user-role";
      })

      // Replace old role with new
      .addCase(replaceUserRole.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(replaceUserRole.fulfilled, (state, action) => {
        state.adminLoading = false;

        // Remove old role
        const oldRoleId = action.meta.arg.oldRoleId;
        state.allUserRoles = state.allUserRoles.filter(
          (role) => role.id !== oldRoleId,
        );

        // Add new role
        state.allUserRoles.push(action.payload);
      })
      .addCase(replaceUserRole.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
      })

      // Delete user role
      .addCase(deleteUserRole.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(deleteUserRole.fulfilled, (state, action) => {
        state.adminLoading = false;
        const idx = state.allUserRoles.findIndex(
          (role: ViewUserRolesWithDetails) => role.id === action.payload,
        );
        if (idx !== -1) {
          state.allUserRoles[idx].is_active = false;
        }
        // Also update in current user roles
        const currentIdx = state.currentUserRoles.findIndex(
          (role) => role.id === action.payload,
        );
        if (currentIdx !== -1) {
          state.currentUserRoles[currentIdx].is_active = false;
        }
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
          (role: ViewUserRolesWithDetails) => role.id !== action.payload,
        );
        // Also update in current user roles
        const currentIdx = state.currentUserRoles.findIndex(
          (role) => role.id === action.payload,
        );
        if (currentIdx !== -1) {
          state.currentUserRoles[currentIdx].is_active = false;
        }
      })
      // Leave Org by deleting a role in it (self hard-delete)
      .addCase(leaveOrg.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(leaveOrg.fulfilled, (state, action) => {
        state.adminLoading = false;
        // Remove from allUserRoles
        state.allUserRoles = state.allUserRoles.filter(
          (role: ViewUserRolesWithDetails) => role.id !== action.payload,
        );
        // Also remove from current user roles so UI no longer shows deleted role
        state.currentUserRoles = state.currentUserRoles.filter(
          (role) => role.id !== action.payload,
        );
      })
      .addCase(leaveOrg.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
        state.errorContext = "leave-org";
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

export const selectUserRolesByOrganization = (
  state: RootState,
  organizationId: string,
): ViewUserRolesWithDetails[] => {
  return state.roles.currentUserRoles.filter(
    (role: ViewUserRolesWithDetails) => role.organization_id === organizationId,
  );
};

// Selectors for active roles context
export const selectActiveRoleContext = (state: RootState) =>
  state.roles.activeRoleContext;

export const selectActiveOrganizationId = (state: RootState) =>
  state.roles.activeRoleContext.organizationId;

export const selectActiveRoleName = (state: RootState) =>
  state.roles.activeRoleContext.roleName;

export const selectActiveOrganizationName = (state: RootState) =>
  state.roles.activeRoleContext.organizationName;

// Export actions
export const {
  clearRoleErrors,
  resetRoles,
  setActiveRoleContext,
  clearActiveRoleContext,
} = rolesSlice.actions;
export default rolesSlice.reducer;
