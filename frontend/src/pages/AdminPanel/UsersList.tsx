import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrderedUsers,
  fetchAllUsers,
  selectAllUsers,
  selectError,
  selectLoading,
  clearUsersList,
  fetchAllOrderedUsersList,
} from "@/store/slices/usersSlice";
import {
  fetchAvailableRoles,
  selectActiveRoleContext,
  selectActiveRoleName,
  selectAvailableRoles,
  selectAllUserRoles,
} from "@/store/slices/rolesSlice";
import { t } from "@/translations";
import { UserProfile } from "@common/user.types";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, LoaderCircle } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { formatRoleName } from "@/utils/format";
import { refreshSupabaseSession } from "@/store/utils/refreshSupabaseSession";
import { toast } from "sonner";

const UsersList = () => {
  // ————————————— Hooks & Selectors —————————————
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { authLoading } = useAuth();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const allUserRoles = useAppSelector(selectAllUserRoles);
  const { organizationId: activeOrgId, organizationName: activeOrgName } =
    useAppSelector(selectActiveRoleContext);
  const activeRoleName = useAppSelector(selectActiveRoleName);
  const { refreshAllUserRoles, hasRole, hasAnyRole, createRole } = useRoles();
  const rolesCatalog = useAppSelector(selectAvailableRoles);
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();

  // ————————————— State —————————————
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddUser, setShowAddUser] = useState(false);
  const [addSearchInput, setAddSearchInput] = useState("");
  const [addSearchLoading, setAddSearchLoading] = useState(false);
  const [addLoadMoreLoading, setAddLoadMoreLoading] = useState(false);
  const [addSearchPage, setAddSearchPage] = useState(0);
  const [addTotalPages, setAddTotalPages] = useState(1);
  const [addUsersAccum, setAddUsersAccum] = useState<
    Pick<UserProfile, "id" | "full_name" | "email">[]
  >([]);
  const [selectedAddUserId, setSelectedAddUserId] = useState<string | null>(
    null,
  );
  const [selectedAddUserRole, setSelectedAddUserRole] =
    useState<string>("user");
  const [assigningRole, setAssigningRole] = useState(false);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 500);

  // ————————————— Derived Values —————————————
  const isAuthorized = hasAnyRole(["tenant_admin", "super_admin"]);
  const isSuper = hasRole("super_admin");
  const isActiveRoleSuper = activeRoleName === "super_admin";
  const shouldFetchAllUsers = isSuper && (!activeOrgId || isActiveRoleSuper);

  // ————————————— Helper Functions —————————————
  const getOrgFilter = useCallback(() => {
    if (shouldFetchAllUsers) {
      return undefined; // No filter - fetch all users
    }
    return activeOrgId ?? undefined; // Use selected org or undefined
  }, [shouldFetchAllUsers, activeOrgId]);

  // Get available roles for filtering - only show roles from current org context
  const availableRoles = useMemo(() => {
    const uniqueRoles = new Set<string>();
    allUserRoles.forEach((role) => {
      if (role.is_active && role.role_name) {
        // If super admin with no org selected, show all roles
        if (isActiveRoleSuper && !activeOrgId) {
          uniqueRoles.add(role.role_name);
        }
        // Otherwise, show roles from active org AND Global roles
        else if (activeOrgId) {
          if (
            role.organization_id === activeOrgId ||
            role.organization_name === "Global"
          ) {
            uniqueRoles.add(role.role_name);
          }
        } else if (role.organization_name === "Global") {
          uniqueRoles.add(role.role_name);
        }
      }
    });

    return Array.from(uniqueRoles).map((role) => ({ id: role, role }));
  }, [allUserRoles, activeOrgId, isActiveRoleSuper]);

  // Helper function to get user's roles for display based on admin permissions
  const getUserRolesForDisplay = useCallback(
    (userId: string) => {
      const userRoles = allUserRoles.filter((role) => role.user_id === userId);

      // If the current user is super_admin and no org is selected, show all active roles
      if (isActiveRoleSuper && !activeOrgId) {
        return userRoles
          .filter((role) => role.is_active)
          .map((role) => ({
            role: role.role_name,
            org: role.organization_name,
          }));
      }

      let filteredRoles;
      if (activeOrgId) {
        // When viewing a specific org context
        const activeOrgRoles = userRoles.filter(
          (role) => role.organization_id === activeOrgId,
        );
        const globalRoles = userRoles.filter(
          (role) => role.organization_name === "Global" && role.is_active,
        );

        // If user has ANY role (active or inactive) in the active org, show those
        if (activeOrgRoles.length > 0) {
          // For active org roles, show them even if inactive (for banned users)
          // But for global roles, only show active ones
          filteredRoles = [...activeOrgRoles, ...globalRoles];
        } else {
          // If no roles in active org, show only active global roles
          filteredRoles = globalRoles;
        }
      } else {
        // If no active org selected, show Global roles only (and only active ones)
        filteredRoles = userRoles.filter(
          (role) => role.organization_name === "Global" && role.is_active,
        );
      }

      return filteredRoles.map((role) => ({
        role: role.role_name,
        org: role.organization_name,
      }));
    },
    [allUserRoles, isActiveRoleSuper, activeOrgId],
  );

  // derive the organization name for a given user for this view
  const getUserOrgName = useCallback(
    (userId: string) => {
      // Get all user roles (active and inactive)
      const allRoles = allUserRoles.filter((r) => r.user_id === userId);
      // If we're viewing in the context of a specific organization
      if (activeOrgId) {
        // First, try to find a role in the active organization
        const activeOrgRole = allRoles.find(
          (r) => r.organization_id === activeOrgId,
        );
        if (activeOrgRole?.organization_name) {
          return activeOrgRole.organization_name;
        }
      }

      // If no role found in active org, fall back to active roles only
      const activeRoles = allRoles.filter((r) => r.is_active);

      // If super admin with no org selected, show Global first if present
      if (isActiveRoleSuper && !activeOrgId) {
        const global = activeRoles.find(
          (r) => r.organization_name === "Global",
        );
        if (global) return "Global";
      }

      // Fallback to Global if user has an active Global role
      const global = activeRoles.find((r) => r.organization_name === "Global");
      if (global) return "Global";

      // Otherwise, show the first active org name if any
      return activeRoles[0]?.organization_name ?? "";
    },
    [allUserRoles, activeOrgId, isActiveRoleSuper],
  );

  // Filter users based on role filter
  const filteredUsers = useMemo(() => {
    if (!users.data || roleFilter === "all") {
      return users.data || [];
    }

    return users.data.filter((user) => {
      const userRoles = getUserRolesForDisplay(user.id);
      return userRoles.some((roleInfo) => roleInfo.role === roleFilter);
    });
  }, [users.data, roleFilter, getUserRolesForDisplay]);

  // ————————————— API Actions —————————————
  const loadUserData = useCallback(() => {
    if (authLoading || !isAuthorized) return;

    return dispatch(
      fetchAllOrderedUsers({
        org_filter: getOrgFilter(),
        page: 1,
        limit: 10,
        ascending: true,
        ordered_by: "created_at",
        searchquery: debouncedSearchQuery || undefined,
      }),
    );
  }, [dispatch, authLoading, isAuthorized, getOrgFilter, debouncedSearchQuery]);

  const handleAddSearch = async () => {
    if (!addSearchInput || addSearchInput.trim().length === 0) return;

    setAddSearchLoading(true);
    try {
      const resp = await dispatch(
        fetchAllOrderedUsersList({
          searchquery: addSearchInput.trim(),
          org_filter: getOrgFilter(),
          page: 1,
          limit: 10,
        }),
      ).unwrap();

      setAddUsersAccum(resp.data ?? []);
      setAddSearchPage(1);
      setAddTotalPages(resp.metadata?.totalPages ?? 1);
    } catch (err) {
      console.error("Error searching for users:", err);
    } finally {
      setAddSearchLoading(false);
    }
  };

  const handleLoadMore = async () => {
    const nextPage = addSearchPage + 1;
    setAddLoadMoreLoading(true);

    try {
      const resp = await dispatch(
        fetchAllOrderedUsersList({
          searchquery: addSearchInput.trim(),
          org_filter: getOrgFilter(),
          page: nextPage,
          limit: 10,
        }),
      ).unwrap();

      const incoming = resp.data ?? [];
      setAddUsersAccum((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const item of incoming) {
          if (!seen.has(item.id)) {
            merged.push(item);
            seen.add(item.id);
          }
        }
        return merged;
      });

      setAddSearchPage(nextPage);
      setAddTotalPages(resp.metadata?.totalPages ?? addTotalPages);
    } catch (err) {
      console.error("Error loading more users:", err);
    } finally {
      setAddLoadMoreLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedAddUserId) return;

    if (!activeOrgId) {
      toast.error(t.usersList.addUser.noOrgSelected[lang]);
      return;
    }

    // Find role definition from available roles
    const roleRow = rolesCatalog.find((r) => r.role === selectedAddUserRole);
    if (!roleRow) {
      toast.error(t.usersList.addUser.roleNotAvailable[lang]);
      return;
    }

    try {
      setAssigningRole(true);

      // Step 1: Create the role assignment
      await createRole({
        user_id: selectedAddUserId,
        organization_id: activeOrgId,
        role_id: roleRow.id,
      });

      // Step 2: Refresh JWT token to update permissions immediately
      await refreshSupabaseSession();

      // Step 3: Refresh role data with force=true to bypass cache
      await refreshAllUserRoles(true);

      // Step 4: Refresh user list with latest data
      await loadUserData();

      // Step 5: Reset UI state
      setShowAddUser(false);
      setAddSearchInput("");
      setSelectedAddUserId(null);
      setAddUsersAccum([]);
      setAddSearchPage(0);
      void dispatch(clearUsersList());

      // Show success message
      toast.success(t.usersList.addUser.success[lang]);
    } catch (error) {
      console.error("Failed to assign role:", error);
      toast.error(t.usersList.addUser.error[lang]);
    } finally {
      setAssigningRole(false);
    }
  };

  // clear previous search results when opening the panel
  const toggleAddUser = useCallback(() => {
    if (!showAddUser) {
      void dispatch(clearUsersList());
      setAddSearchInput("");
      setSelectedAddUserId(null);
      setAddUsersAccum([]);
    }
    setShowAddUser((s) => !s);
  }, [dispatch, showAddUser]);

  // ————————————— Side Effects —————————————
  // Load user roles once when authorized
  useEffect(() => {
    if (!authLoading && isAuthorized) {
      if (!allUserRoles.length) {
        void refreshAllUserRoles(true);
      }
      if (rolesCatalog.length === 0) {
        void dispatch(fetchAvailableRoles());
      }
    }
  }, [
    authLoading,
    isAuthorized,
    allUserRoles.length,
    refreshAllUserRoles,
    dispatch,
    rolesCatalog.length,
  ]);

  // Load super admin users
  useEffect(() => {
    if (isSuper) {
      void dispatch(fetchAllUsers());
    }
  }, [isSuper, dispatch]);

  // Reset role filter when active organization changes
  useEffect(() => {
    setRoleFilter("all");
  }, [activeOrgId, activeRoleName]);

  // Fetch users when key dependencies change
  useEffect(() => {
    void loadUserData();
  }, [loadUserData]);

  // ————————————— Columns —————————————
  const columns: ColumnDef<UserProfile>[] = [
    {
      id: "view",
      size: 5,
      cell: () => (
        <div className="flex space-x-1">
          <Button
            variant={"ghost"}
            size="sm"
            title={t.bookingList.buttons.viewDetails[lang]}
            className="hover:text-slate-900 hover:bg-slate-300"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "full_name",
      header: t.usersList.columns.name[lang],
      size: 100,
    },
    {
      accessorKey: "phone",
      header: t.usersList.columns.phone[lang],
      size: 100,
    },
    {
      accessorKey: "email",
      header: t.usersList.columns.email[lang],
      size: 350,
      cell: ({ row }) => {
        const email = row.original.email;
        return email ? (
          email
        ) : (
          <span className="text-red-500">
            {t.usersList.status.unverified[lang]}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: t.usersList.columns.userSince[lang],
      size: 100,
      cell: ({ row }) =>
        formatDate(new Date(row.original.created_at ?? ""), "d MMM yyyy"),
    },
    {
      id: "orgName",
      header: isSuper ? t.usersList.columns.organization[lang] : undefined,
      size: 120,
      cell: ({ row }) =>
        isSuper ? getUserOrgName(row.original.id) : undefined,
    },
    {
      id: "roles",
      header: t.usersList.columns.role[lang],
      size: 150,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const userId = row.original.id;
        const userRoles = allUserRoles.filter(
          (r) => r.user_id === userId && r.role_name,
        );
        const orgRole = activeOrgId
          ? userRoles.find(
              (r) => r.organization_id === activeOrgId && r.is_active,
            )
          : undefined;
        const globalRole = userRoles.find(
          (r) => r.organization_name === "Global" && r.is_active,
        );
        const roleToShow = orgRole ?? globalRole ?? userRoles[0];

        return roleToShow ? (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {formatRoleName(roleToShow.role_name as string)}
          </span>
        ) : (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            User
          </span>
        );
      },
    },
  ];

  // ————————————— Render —————————————
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8 mr-2" />
        <span>{t.usersList.loading[lang]}</span>
      </div>
    );
  }

  if (!authLoading && !isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">
          {isSuper
            ? t.usersList.titleSuper[lang]
            : t.usersList.titleOrg[lang].replace(
                "{org}",
                activeOrgName ?? "Organization",
              )}
        </h1>
      </div>

      {loading && (
        <p>
          <LoaderCircle className="animate-spin" />
        </p>
      )}

      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder={t.usersList.filters.search[lang]}
            value={searchQuery}
            size={50}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
          >
            <option value="all">{t.usersList.filters.roles.all[lang]}</option>
            {availableRoles.map((role) => (
              <option key={role.id} value={role.role}>
                {role.role}
              </option>
            ))}
          </select>

          {(searchQuery || roleFilter !== "all") && (
            <Button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
              }}
              size={"sm"}
              className="px-2 py-0 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
            >
              {t.usersList.filters.clear[lang]}
            </Button>
          )}
        </div>

        {/* Add a new member to an org section */}
        <div className="relative">
          {!isSuper ? (
            <Button variant={"outline"} onClick={toggleAddUser}>
              {t.usersList.addUser.title[lang]}
            </Button>
          ) : (
            ""
          )}

          {showAddUser && (
            <div className="absolute right-0 mt-2 p-4 w-96 bg-white border rounded shadow-lg z-50">
              <div className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  placeholder={t.usersList.filters.search[lang]}
                  value={addSearchInput}
                  onChange={(e) => setAddSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (addSearchInput && addSearchInput.trim().length > 0) {
                        void handleAddSearch();
                      }
                    }
                  }}
                  required
                  aria-required="true"
                  className="flex-1 text-sm p-2 bg-white rounded-md border"
                />
                <Button
                  variant={"outline"}
                  size="sm"
                  onClick={handleAddSearch}
                  disabled={
                    addSearchLoading ||
                    !(addSearchInput && addSearchInput.trim().length > 0)
                  }
                >
                  {addSearchLoading ? (
                    <LoaderCircle className="animate-spin h-4 w-4" />
                  ) : (
                    t.usersList.addUser.searchButton[lang]
                  )}
                </Button>
              </div>

              <div className="max-h-80 overflow-auto mb-2">
                {addUsersAccum.length ? (
                  addUsersAccum.map((u) => {
                    // map to annotated info using existing role lookup
                    const hasRoleInActiveOrg = Boolean(
                      activeOrgId &&
                        allUserRoles.find(
                          (r) =>
                            r.user_id === u.id &&
                            r.organization_id === activeOrgId,
                        ),
                    );
                    const disabled = hasRoleInActiveOrg;
                    return (
                      <label
                        key={u.id}
                        className={`flex items-center gap-2 p-1 ${
                          disabled
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:bg-slate-50"
                        } rounded`}
                      >
                        <input
                          type="radio"
                          name="selectedAddUser"
                          checked={selectedAddUserId === u.id}
                          onChange={() => {
                            if (!disabled) setSelectedAddUserId(u.id);
                          }}
                          disabled={disabled}
                        />
                        <div className="text-sm">
                          <div className="font-medium">{u.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {u.email}
                          </div>
                        </div>
                        {disabled && (
                          <div className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded ml-auto">
                            {t.usersList.addUser.member[lang]}
                          </div>
                        )}
                      </label>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {t.usersList.addUser.noResults[lang]}
                  </div>
                )}
              </div>

              {addUsersAccum.length > 0 && addSearchPage < addTotalPages && (
                <div className="flex justify-center my-4">
                  <Button
                    variant={"ghost"}
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={addLoadMoreLoading}
                  >
                    {addLoadMoreLoading
                      ? t.usersList.addUser.buttons.loading[lang]
                      : t.usersList.addUser.buttons.loadMore[lang]}
                  </Button>
                </div>
              )}

              <div className="flex gap-2 items-center justify-between">
                <select
                  value={selectedAddUserRole}
                  onChange={(e) => setSelectedAddUserRole(e.target.value)}
                  className="select bg-white text-sm p-2 rounded-md"
                >
                  <option value="user">
                    {t.usersList.addUser.roles.user[lang]}
                  </option>
                  <option value="storage_manager">
                    {t.usersList.addUser.roles.storageManager[lang]}
                  </option>
                  <option value="requester">
                    {t.usersList.addUser.roles.requester[lang]}
                  </option>
                </select>
                <Button
                  size="sm"
                  variant={"secondary"}
                  onClick={handleAssignRole}
                  disabled={!selectedAddUserId || assigningRole}
                >
                  {assigningRole ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    t.usersList.addUser.buttons.assign[lang]
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setShowAddUser(false);
                    setAddSearchInput("");
                    setSelectedAddUserId(null);
                    setAddUsersAccum([]);
                    setAddSearchPage(0);
                    void dispatch(clearUsersList());
                  }}
                >
                  {t.usersList.addUser.buttons.close[lang]}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PaginatedDataTable
        columns={columns}
        data={filteredUsers}
        pageIndex={Math.max(0, (users.metadata?.page ?? 1) - 1)}
        pageCount={users.metadata?.totalPages || 1}
        onPageChange={(page) =>
          dispatch(
            fetchAllOrderedUsers({
              org_filter: getOrgFilter(),
              page: page + 1,
              limit: 10,
              ascending: true,
              ordered_by: "created_at",
              searchquery: debouncedSearchQuery || undefined,
            }),
          )
        }
        rowProps={(row) => ({
          onClick: () => navigate(`/admin/users/${row.original.id}`),
          className: "cursor-pointer",
        })}
      />
    </div>
  );
};

export default UsersList;
