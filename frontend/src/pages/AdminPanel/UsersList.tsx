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
} from "@/store/slices/usersSlice";
import {
  fetchAvailableRoles,
  selectActiveRoleContext,
  selectActiveRoleName,
} from "@/store/slices/rolesSlice";
import { t } from "@/translations";
import { UserProfile } from "@common/user.types";
import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle, Swords, User } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useBanPermissions } from "@/hooks/useBanPermissions";
import { selectAllUserRoles } from "@/store/slices/rolesSlice";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import DeleteUserButton from "@/components/Admin/UserManagement/UserDeleteButton";
import UserEditModal from "@/components/Admin/UserManagement/UserEditModal";
import UserBanActionsDropdown from "@/components/Admin/UserManagement/Banning/UserBanActionsDropdown";
import UserBanModal from "@/components/Admin/UserManagement/Banning/UserBanModal";
import UserBanHistoryModal from "@/components/Admin/UserManagement/Banning/UserBanHistoryModal";
import UnbanUserModal from "@/components/Admin/UserManagement/Banning/UnbanUserModal";
import {
  selectUserBanStatuses,
  fetchAllUserBanStatuses,
  checkUserBanStatus,
} from "@/store/slices/userBanningSlice";
import { formatRoleName } from "@/utils/format";

const UsersList = () => {
  // ————————————— Hooks & Selectors —————————————
  const dispatch = useAppDispatch();
  const { authLoading } = useAuth();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const allUserRoles = useAppSelector(selectAllUserRoles);
  const { organizationId: activeOrgId, organizationName: activeOrgName } =
    useAppSelector(selectActiveRoleContext);
  const activeRoleName = useAppSelector(selectActiveRoleName);
  const userBanStatuses = useAppSelector(selectUserBanStatuses);
  const { refreshAllUserRoles, hasAnyRole } = useRoles();
  const { canBanUser, isUserBanned } = useBanPermissions();

  // ————————————— State —————————————
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  // Modal state management
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [activeModal, setActiveModal] = useState<
    "ban" | "unban" | "history" | null
  >(null);

  const closeModal = () => setIsModalOpen(false);
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 500);

  // ————————————— Derived Values —————————————
  // Authorization helpers based on new role system
  const isAuthorized = hasAnyRole([
    "admin",
    "superVera",
    "main_admin",
    "super_admin",
  ]);
  const isSuper = hasAnyRole(["super_admin", "superVera"]);

  useEffect(() => {
    if (isSuper) fetchAllUsers();
  }, [isSuper]);

  // Determine if we should fetch all users (no org filter)
  // This happens when:
  // 1. User has super_admin or superVera role AND no org/role is selected (activeOrgId is null/undefined)
  // 2. User has selected a super_admin or superVera role from the navbar selector
  const isActiveRoleSuper =
    activeRoleName === "super_admin" || activeRoleName === "superVera";
  const shouldFetchAllUsers = isSuper && (!activeOrgId || isActiveRoleSuper);

  // Get the org_filter value based on super user logic
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

      // If the current user is super_admin/superVera and no org is selected, show all active roles
      if (isActiveRoleSuper && !activeOrgId) {
        return userRoles
          .filter((role) => role.is_active)
          .map((role) => ({
            role: role.role_name,
            org: role.organization_name,
          }));
      }

      // Check if user is banned to adjust role display strategy
      // const isBanned = isUserBanned(userId); // Not needed with current logic

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

  // ————————————— Side Effects —————————————
  // Reset modal state when activeUser changes
  useEffect(() => {
    if (!activeUser) {
      setActiveModal(null);
    }
  }, [activeUser]);

  // Load user roles once when authorized (separate from user data)
  useEffect(() => {
    if (!authLoading && isAuthorized && !allUserRoles.length) {
      void refreshAllUserRoles();
      void dispatch(fetchAvailableRoles());
    }
  }, [
    authLoading,
    isAuthorized,
    allUserRoles.length,
    refreshAllUserRoles,
    dispatch,
  ]);

  // Load ban statuses when authorized
  useEffect(() => {
    if (!authLoading && isAuthorized) {
      void dispatch(fetchAllUserBanStatuses());
    }
  }, [authLoading, isAuthorized, dispatch]);

  // Check individual user ban statuses when users are loaded
  useEffect(() => {
    if (users.data && users.data.length > 0) {
      users.data.forEach((user) => {
        if (!userBanStatuses[user.id]) {
          void dispatch(checkUserBanStatus(user.id));
        }
      });
    }
  }, [users.data, userBanStatuses, dispatch]);

  // Reset role filter when active organization changes
  useEffect(() => {
    setRoleFilter("all");
  }, [activeOrgId, activeRoleName]);

  // Fetch users when key dependencies change
  useEffect(() => {
    if (!authLoading && isAuthorized && isModalOpen) {
      void dispatch(
        fetchAllOrderedUsers({
          org_filter: getOrgFilter(),
          page: 1,
          limit: 10,
          ascending: true,
          ordered_by: "created_at",
          searchquery: debouncedSearchQuery || undefined,
        }),
      );
    }
  }, [
    authLoading,
    isAuthorized,
    isModalOpen,
    dispatch,
    activeOrgId,
    activeRoleName,
    debouncedSearchQuery,
    isSuper,
    getOrgFilter,
  ]);

  // ————————————— Helper Functions —————————————
  // Reset modal state
  const resetModalState = () => {
    setActiveUser(null);
    setActiveModal(null);
  };

  // Helper function to get user's roles from the new role system
  const getUserRoles = (userId: string) => {
    return allUserRoles
      .filter((role) => role.user_id === userId && role.is_active)
      .map((role) => role.role_name);
  };

  // Helper: derive the organization name for a given user for this view
  const getUserOrgName = (userId: string) => {
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
      const global = activeRoles.find((r) => r.organization_name === "Global");
      if (global) return "Global";
    }

    // Fallback to Global if user has an active Global role
    const global = activeRoles.find((r) => r.organization_name === "Global");
    if (global) return "Global";

    // Otherwise, show the first active org name if any
    return activeRoles[0]?.organization_name ?? "";
  };

  // ————————————— Columns —————————————
  const columns: ColumnDef<UserProfile>[] = [
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
      id: "active",
      header: t.usersList.columns.active[lang],
      size: 80,
      cell: ({ row }) => {
        const banned = isUserBanned(row.original.id);
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              banned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {banned
              ? t.usersList.status.banned[lang]
              : t.usersList.status.active[lang]}
          </span>
        );
      },
    },
    {
      id: "roles",
      header: t.usersList.columns.role[lang],
      size: 150,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const userRoles = getUserRolesForDisplay(row.original.id);
        return userRoles.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {userRoles.map((roleInfo, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                title={`${roleInfo.role} in ${roleInfo.org}`}
              >
                {formatRoleName(roleInfo.role as string)}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            User
          </span>
        );
      },
    },
    {
      id: "actions",
      size: 30,
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const targetUser = row.original;
        const targetUserRoles = getUserRoles(targetUser.id);

        const canEdit = isAuthorized;
        const canDelete =
          isSuper || (isAuthorized && targetUserRoles.includes("user"));

        // Banning permission logic based on hierarchy and org:
        // - super_admin/superVera: Can ban anyone from anywhere
        // - main_admin: Can only ban users whose role is below their own within their active org
        // - Others: Cannot ban
        const canBan = canBanUser(targetUser.id);

        const handleBanClick = () => {
          setActiveUser(targetUser);
          setActiveModal("ban");
        };

        const handleUnbanClick = () => {
          setActiveUser(targetUser);
          setActiveModal("unban");
        };

        const handleHistoryClick = () => {
          setActiveUser(targetUser);
          setActiveModal("history");
        };

        return (
          <div className="flex gap-2">
            {canEdit && <UserEditModal user={targetUser} />}
            {canDelete && (
              <DeleteUserButton id={targetUser.id} closeModal={closeModal} />
            )}
            {canBan && (
              <div onClick={(e) => e.stopPropagation()}>
                <UserBanActionsDropdown
                  user={targetUser}
                  canBan={canBan}
                  isSuper={isSuper}
                  isAuthorized={isAuthorized}
                  onBanClick={handleBanClick}
                  onUnbanClick={handleUnbanClick}
                  onHistoryClick={handleHistoryClick}
                />
              </div>
            )}
          </div>
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
          <Button variant="default" className="flex gap-2">
            <User />
            Add New User
          </Button>
          <Button variant="default" className="flex gap-2">
            <Swords />
            Add New Admin
          </Button>
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
      />

      {/* Ban-related modals - only render the active modal */}
      {activeUser && activeModal === "ban" && (
        <UserBanModal
          key={`ban-${activeUser.id}`}
          user={activeUser}
          initialOpen={true}
          onClose={resetModalState}
        />
      )}
      {activeUser && activeModal === "unban" && (
        <UnbanUserModal
          key={`unban-${activeUser.id}`}
          user={activeUser}
          initialOpen={true}
          onClose={resetModalState}
        />
      )}
      {activeUser && activeModal === "history" && (
        <UserBanHistoryModal
          key={`history-${activeUser.id}`}
          user={activeUser}
          initialOpen={true}
          onClose={resetModalState}
        />
      )}
    </div>
  );
};

export default UsersList;
