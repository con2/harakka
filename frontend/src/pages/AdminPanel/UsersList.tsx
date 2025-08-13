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
} from "@/store/slices/usersSlice";
import {
  selectActiveOrganizationId,
  selectActiveRoleName,
} from "@/store/slices/rolesSlice";
import { t } from "@/translations";
import { UserProfile } from "@common/user.types";
import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { selectAllUserRoles } from "@/store/slices/rolesSlice";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import DeleteUserButton from "@/components/Admin/UserManagement/UserDeleteButton";
import UserEditModal from "@/components/Admin/UserManagement/UserEditModal";
import UserBanActionsDropdown from "@/components/Admin/UserManagement/Banning/UserBanActionsDropdown";
import UserBanModal from "@/components/Admin/UserManagement/Banning/UserBanModal";
import UserBanHistoryModal from "@/components/Admin/UserManagement/Banning/UserBanHistoryModal";
import UnbanUserModal from "@/components/Admin/UserManagement/Banning/UnbanUserModal";

const UsersList = () => {
  // ————————————— Hooks & Selectors —————————————
  const dispatch = useAppDispatch();
  const { authLoading } = useAuth();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const allUserRoles = useAppSelector(selectAllUserRoles);
  const activeOrgId = useAppSelector(selectActiveOrganizationId);
  const activeRoleName = useAppSelector(selectActiveRoleName);
  const { refreshAllUserRoles, hasAnyRole } = useRoles();

  // ————————————— State —————————————
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
    }
  }, [authLoading, isAuthorized, allUserRoles.length, refreshAllUserRoles]);

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
    const roles = allUserRoles.filter(
      (r) => r.user_id === userId && r.is_active,
    );
    // Prefer Global when present
    const global = roles.find((r) => r.organization_name === "Global");
    if (global) return "Global";
    // Fallback to the active org if the user has a role there
    if (activeOrgId) {
      const inActive = roles.find((r) => r.organization_id === activeOrgId);
      if (inActive?.organization_name) return inActive.organization_name;
    }
    // Otherwise, show the first org name if any
    return roles[0]?.organization_name ?? "";
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
    // Org Name column
    {
      id: "orgName",
      header: "Org Name",
      size: 120,
      cell: ({ row }) => getUserOrgName(row.original.id),
    },
    // Commented out Roles column for now
    // {
    //   id: "roles",
    //   header: t.usersList.columns.role[lang],
    //   size: 150,
    //   enableSorting: true,
    //   enableColumnFilter: true,
    //   cell: ({ row }) => {
    //     const userRoles = getUserRoles(row.original.id);
    //     return userRoles.length > 0 ? (
    //       <div className="flex flex-wrap gap-1">
    //         {userRoles.map((role, index) => (
    //           <span
    //             key={index}
    //             className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
    //           >
    //             {role}
    //           </span>
    //         ))}
    //       </div>
    //     ) : (
    //       <span className="text-slate-500">{t.usersList.status.na[lang]}</span>
    //     );
    //   },
    // },
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
        const canBan =
          (isSuper && targetUserRoles.includes("admin")) ||
          (isAuthorized && targetUserRoles.includes("user"));

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
            {(canBan || isSuper || isAuthorized) && (
              <UserBanActionsDropdown
                user={targetUser}
                canBan={canBan}
                isSuper={isSuper}
                isAuthorized={isAuthorized}
                onBanClick={handleBanClick}
                onUnbanClick={handleUnbanClick}
                onHistoryClick={handleHistoryClick}
              />
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
        <h1 className="text-xl">{t.usersList.title[lang]}</h1>
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

          {searchQuery && (
            <Button
              onClick={() => {
                setSearchQuery("");
              }}
              size={"sm"}
              className="px-2 py-0 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
            >
              {t.usersList.filters.clear[lang]}
            </Button>
          )}
        </div>
      </div>

      <PaginatedDataTable
        columns={columns}
        data={users.data || []}
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
