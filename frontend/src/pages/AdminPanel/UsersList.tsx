import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrderedUsers,
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
import { LoaderCircle, Info, CircleUser } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { formatRoleName } from "@/utils/format";
import { refreshSupabaseSession } from "@/store/utils/refreshSupabaseSession";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [orgFilter, setOrgFilter] = useState("all");
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

  // ————————————— Helper Functions —————————————
  const getOrgFilter = useCallback(() => {
    if (!isSuper) {
      return activeOrgId ?? undefined;
    }
    return undefined;
  }, [isSuper, activeOrgId]);

  // Get available organizations for super admin filtering
  const availableOrganizations = useMemo(() => {
    if (!isSuper) return [];

    const uniqueOrgsMap = new Map<string, { id: string; name: string }>();
    allUserRoles.forEach((role) => {
      if (role.organization_id && role.organization_name && role.is_active) {
        // Use organization_id as the key to ensure uniqueness
        uniqueOrgsMap.set(role.organization_id, {
          id: role.organization_id,
          name: role.organization_name,
        });
      }
    });

    return Array.from(uniqueOrgsMap.values());
  }, [allUserRoles, isSuper]);

  // Get available roles for filtering
  const availableRoles = useMemo(() => {
    const uniqueRoles = new Set<string>();

    allUserRoles.forEach((role) => {
      if (role.is_active && role.role_name) {
        // super admin - show all roles, let backend filter
        if (isSuper) {
          uniqueRoles.add(role.role_name);
        }
        // tenant admin - show roles from active org AND Global roles
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
  }, [allUserRoles, activeOrgId, isSuper]);

  // Helper function to get user's roles for display in the role column (tenant admin only)
  const getUserRolesForDisplay = useCallback(
    (userId: string) => {
      const userRoles = allUserRoles.filter((role) => role.user_id === userId);

      // This function is only used for tenant admin role column display
      // Super admin uses organization column instead
      if (isSuper) {
        return [];
      }

      // For tenant admin - show roles from active org AND Global roles
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
    [allUserRoles, isSuper, activeOrgId],
  );

  // Users from backend (filtering is now handled by backend)
  const displayedUsers = users.data || [];

  // ————————————— API Actions —————————————
  const loadUserData = useCallback(() => {
    if (authLoading || !isAuthorized) return;

    // Determine the org filter to send to backend
    let backendOrgFilter = getOrgFilter();

    // For super admin, if org filter is selected, use that for backend filtering
    if (isSuper && orgFilter !== "all") {
      backendOrgFilter = orgFilter;
    }

    return dispatch(
      fetchAllOrderedUsers({
        org_filter: backendOrgFilter,
        page: 1,
        limit: 10,
        ascending: true,
        ordered_by: "created_at",
        searchquery: debouncedSearchQuery || undefined,
        selected_role: roleFilter !== "all" ? roleFilter : undefined,
      }),
    );
  }, [
    dispatch,
    authLoading,
    isAuthorized,
    getOrgFilter,
    debouncedSearchQuery,
    isSuper,
    orgFilter,
    roleFilter,
  ]);

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

  // Reset filters when active organization changes
  useEffect(() => {
    setRoleFilter("all");
    setOrgFilter("all");
  }, [activeOrgId, activeRoleName]);

  // Fetch users when key dependencies change
  useEffect(() => {
    void loadUserData();
  }, [loadUserData]);

  // ————————————— Columns —————————————
  const columns: ColumnDef<UserProfile>[] = [
    {
      accessorKey: "profile_picture_url",
      header: "",
      size: 50,
      cell: ({ row }) => {
        const url = row.original.profile_picture_url;
        return url ? (
          <img
            src={url}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <CircleUser className="h-8 w-8 text-gray-300 items-center justify-center" />
        );
      },
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
    // Show Organization column only for super admin
    ...(isSuper
      ? [
          {
            id: "orgName",
            header: t.usersList.columns.organization[lang],
            size: 200,
            cell: ({ row }: { row: { original: UserProfile } }) => {
              const userId = row.original.id;
              const userRoles = allUserRoles.filter(
                (role) => role.user_id === userId && role.is_active,
              );

              // Get all unique organizations for this user
              const orgs = new Set<string>();
              userRoles.forEach((role) => {
                if (role.organization_name) {
                  orgs.add(role.organization_name);
                }
              });

              const orgArray = Array.from(orgs);

              if (orgArray.length === 0) {
                return (
                  <span className="text-gray-500">
                    {t.usersList.columns.noOrg[lang]}
                  </span>
                );
              }

              if (orgArray.length === 1) {
                return (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {orgArray[0]}
                  </span>
                );
              }

              // Multiple orgs - show first few with overflow indicator
              return (
                <div className="flex flex-wrap gap-1">
                  {orgArray.slice(0, 2).map((org, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      {org}
                    </span>
                  ))}
                  {orgArray.length > 2 && (
                    <span
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      title={orgArray.slice(2).join(", ")}
                    >
                      +{orgArray.length - 2}
                    </span>
                  )}
                </div>
              );
            },
          },
        ]
      : []),
    // Show Role column only for tenant admin
    ...(!isSuper
      ? [
          {
            id: "roles",
            header: t.usersList.columns.role[lang],
            size: 200,
            enableSorting: true,
            enableColumnFilter: true,
            cell: ({ row }: { row: { original: UserProfile } }) => {
              const userId = row.original.id;
              const displayRoles = getUserRolesForDisplay(userId);

              if (displayRoles.length === 0) {
                return (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    User
                  </span>
                );
              }

              // For tenant admin, show the primary role
              const primaryRole = displayRoles[0];
              return (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {formatRoleName(primaryRole.role || "user")}
                </span>
              );
            },
          },
        ]
      : []),
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
        <div className="flex items-center gap-2">
          <h1 className="text-xl">
            {isSuper
              ? t.usersList.titleSuper[lang]
              : t.usersList.titleOrg[lang].replace(
                  "{org}",
                  activeOrgName ?? "Organization",
                )}
          </h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-pointer text-muted-foreground">
                <Info className="w-4 h-4 text-secondary" />
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="start"
              className="max-w-sm break-words"
            >
              {isSuper
                ? t.usersList.tooltip.superAdminHelp[lang]
                : t.usersList.tooltip.tenantAdminHelp[lang]}
            </TooltipContent>
          </Tooltip>
        </div>
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

          {/* Organization filter for super admin */}
          {isSuper && (
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
            >
              <option value="all">All Organizations</option>
              {availableOrganizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          )}

          {/* Role filter - show for all admins since backend handles filtering */}
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

          {(searchQuery ||
            roleFilter !== "all" ||
            (isSuper && orgFilter !== "all")) && (
            <Button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setOrgFilter("all");
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
        data={displayedUsers}
        pageIndex={Math.max(0, (users.metadata?.page ?? 1) - 1)}
        pageCount={users.metadata?.totalPages || 1}
        onPageChange={(page) => {
          // Determine the org filter to send to backend
          let backendOrgFilter = getOrgFilter();

          // For super admin, if org filter is selected, use that for backend filtering
          if (isSuper && orgFilter !== "all") {
            backendOrgFilter = orgFilter;
          }

          void dispatch(
            fetchAllOrderedUsers({
              org_filter: backendOrgFilter,
              page: page + 1,
              limit: 10,
              ascending: true,
              ordered_by: "created_at",
              searchquery: debouncedSearchQuery || undefined,
              selected_role: roleFilter !== "all" ? roleFilter : undefined,
            }),
          );
        }}
        rowProps={(row) => ({
          onClick: () => navigate(`/admin/users/${row.original.id}`),
          className: "cursor-pointer",
        })}
      />
    </div>
  );
};

export default UsersList;
