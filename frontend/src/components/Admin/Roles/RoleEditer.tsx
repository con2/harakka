import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { useAuth } from "@/hooks/useAuth";
import { CreateUserRoleDto } from "@/types/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { ViewUserRolesWithDetails } from "@common/role.types";
import { LoaderCircle } from "lucide-react";

interface RoleEditerProps {
  role?: ViewUserRolesWithDetails;
  onClose?: () => void;
  onRolesChanged?: () => void;
}

const modeOptions = [
  { value: "create", label: "Create" },
  { value: "softDelete", label: "Soft Delete" },
  { value: "restoreRole", label: "Restore Role" },
  { value: "hardDelete", label: "Hard Delete" },
] as const;

export const RoleEditer: React.FC<RoleEditerProps> = ({
  role,
  onClose,
  onRolesChanged,
}) => {
  const { user } = useAuth();

  const {
    createRole,
    updateRole,
    deleteRole,
    permanentDeleteRole,
    refreshAllUserRoles,
    refreshCurrentUserRoles,
    availableRoles,
    allUserRoles,
  } = useRoles();

  // For create
  const [createForm, setCreateForm] = useState<CreateUserRoleDto>({
    user_id: "",
    organization_id: "",
    role_id: "",
  });

  // Memoized list of unique users by email
  const userOptions = useMemo(() => {
    const seen = new Set();
    const options = allUserRoles
      .filter(
        (r) =>
          r.user_email && !seen.has(r.user_email) && seen.add(r.user_email),
      )
      .map((r) => ({
        user_id: r.user_id,
        email: r.user_email,
        full_name: r.user_full_name,
        isCurrentUser: r.user_id === user?.id,
      }));

    // Sort to put current user first
    return options.sort((a, b) => {
      if (a.isCurrentUser) return -1;
      if (b.isCurrentUser) return 1;
      return 0;
    });
  }, [allUserRoles, user?.id]);

  //For update, soft delete, delete
  const [assignmentId, setAssignmentId] = useState(role?.id || "");
  // Filters for assignment dropdown
  const [filterUser, setFilterUser] = useState("");
  const [filterOrg, setFilterOrg] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 15;

  const [mode, setMode] = useState<
    "create" | "softDelete" | "restoreRole" | "hardDelete"
  >("create");

  // Replace your single loading state with a map of loading states by role ID
  const [loadingRoles, setLoadingRoles] = useState<Record<string, boolean>>({});

  // Add this effect to reset page index when mode changes
  useEffect(() => {
    setPageIndex(0);
  }, [mode]);

  // Filtered assignments for table
  const filteredAssignments = useMemo(() => {
    return allUserRoles.filter(
      (r) =>
        (!filterUser ||
          (r.user_email &&
            r.user_email.toLowerCase().includes(filterUser.toLowerCase()))) &&
        (!filterOrg ||
          (r.organization_name &&
            r.organization_name
              .toLowerCase()
              .includes(filterOrg.toLowerCase()))) &&
        (!filterRole ||
          (r.role_name &&
            r.role_name.toLowerCase().includes(filterRole.toLowerCase()))) &&
        // Only show inactive assignments in restore mode
        (mode !== "restoreRole" || r.is_active === false) &&
        // Only show active assignments in softDelete mode
        (mode !== "softDelete" || r.is_active === true),
    );
  }, [allUserRoles, filterUser, filterOrg, filterRole, mode]);

  // Paginate filtered assignments
  const paginatedAssignments = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredAssignments.slice(start, start + pageSize);
  }, [filteredAssignments, pageIndex, pageSize]);

  const totalPages = Math.ceil(filteredAssignments.length / pageSize);

  const [operationError, setOperationError] = useState<string | null>(null);

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
    setOperationError(null);
  };

  const handleRoleSelect = (roleId: string) => {
    setCreateForm((prev) => ({ ...prev, role_id: roleId }));
    setOperationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRoles((prev) => ({ ...prev, form: true }));
    setOperationError(null);
    let actionPerformed = false; // Add this flag to track if action was performed

    try {
      if (mode === "create") {
        if (
          !createForm.user_id ||
          !createForm.organization_id ||
          !createForm.role_id
        ) {
          throw new Error("All fields are required");
        }
        await createRole(createForm);
        toast.success("Role created");
        actionPerformed = true; // Mark that we performed an action

        // Slight delay to ensure backend has time to process
        await new Promise((res) => setTimeout(res, 300));

        // Reset form after successful creation
        setCreateForm({ user_id: "", organization_id: "", role_id: "" });
      } else if (mode === "softDelete" && assignmentId) {
        await deleteRole(assignmentId);
        toast.success("Role deactivated");
        actionPerformed = true; // Mark that we performed an action
      } else if (mode === "restoreRole" && assignmentId) {
        await updateRole(assignmentId, { is_active: true });
        toast.success("Role restored");
        actionPerformed = true; // Mark that we performed an action
      } else if (mode === "hardDelete" && assignmentId) {
        await permanentDeleteRole(assignmentId);
        toast.success("Role permanently deleted");
        actionPerformed = true; // Mark that we performed an action
      }

      // Refresh roles only if an action was performed
      if (actionPerformed) {
        await Promise.all([refreshAllUserRoles(), refreshCurrentUserRoles()]);

        // Only notify parent if an action was actually performed
        onRolesChanged?.();

        // Close only after successful action
        onClose?.();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Operation failed";
      setOperationError(errorMessage);
      toast.error(errorMessage);
      console.error("Role operation failed:", error);
    } finally {
      setLoadingRoles((prev) => ({ ...prev, form: false }));
    }
  };

  const handleRoleAction = useCallback(
    async (roleId: string) => {
      // Set loading state only for this specific role
      setLoadingRoles((prev) => ({ ...prev, [roleId]: true }));
      let actionPerformed = false; // Track if an action was actually completed

      try {
        setAssignmentId(roleId);
        if (mode === "softDelete") {
          await deleteRole(roleId);
          toast.success("Role deactivated");
          actionPerformed = true;
        } else if (mode === "restoreRole") {
          await updateRole(roleId, { is_active: true });
          toast.success("Role restored");
          actionPerformed = true;
        } else if (mode === "hardDelete") {
          await permanentDeleteRole(roleId);
          toast.success("Role permanently deleted");
          actionPerformed = true;
        }

        // Refresh role data
        if (actionPerformed) {
          await Promise.all([refreshAllUserRoles(), refreshCurrentUserRoles()]);

          // Only notify parent if an action was actually performed
          onRolesChanged?.();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Operation failed";
        setOperationError(errorMessage);
        toast.error(errorMessage);
        console.error("Role operation failed:", error);
      } finally {
        // Clear loading state only for this role
        setLoadingRoles((prev) => ({ ...prev, [roleId]: false }));
      }
    },
    [
      mode,
      deleteRole,
      updateRole,
      permanentDeleteRole,
      refreshAllUserRoles,
      refreshCurrentUserRoles,
      onRolesChanged,
      setOperationError,
    ],
  );

  const assignmentColumns: ColumnDef<ViewUserRolesWithDetails>[] = [
    {
      accessorKey: "user_email",
      size: 10,
      header: "User Email",
      cell: ({ row }) => (
        <span>
          {row.original.user_email}
          {row.original.user_full_name
            ? ` (${row.original.user_full_name})`
            : ""}
        </span>
      ),
    },
    {
      accessorKey: "role_name",
      header: "Role",
    },
    {
      accessorKey: "organization_name",
      header: "Organization",
    },
    {
      accessorKey: "is_active",
      header: "Active",
      cell: ({ row }) =>
        row.original.is_active ? (
          <span className="text-green-600">Yes</span>
        ) : (
          <span className="text-red-600">No</span>
        ),
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const roleId = row.original.id!;
        const isLoading = loadingRoles[roleId] || false;

        return (
          <Button
            size="sm"
            type="button"
            onClick={() => handleRoleAction(roleId)}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <>
                {mode === "softDelete" && "Soft Delete"}
                {mode === "restoreRole" && "Restore"}
                {mode === "hardDelete" && "Delete Permanently"}
              </>
            )}
          </Button>
        );
      },
    },
  ];

  return (
    <form className="space-y-4 p-4 border rounded" onSubmit={handleSubmit}>
      <div className="flex items-center gap-4">
        <label className="font-semibold">Mode:</label>
        <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <h3 className="font-bold">
        {mode === "create" && "Create Role"}
        {mode === "softDelete" && "Soft Delete Role"}
        {mode === "restoreRole" && "Restore Role"}
        {mode === "hardDelete" && "Hard Delete Role"}
      </h3>

      {/* Show error message if present */}
      {operationError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded">
          {operationError}
        </div>
      )}

      {mode === "create" && (
        <>
          {/* User dropdown by email and name */}
          <label className="font-semibold">User (by email)</label>
          <Select
            value={createForm.user_id}
            onValueChange={(userId) =>
              setCreateForm((prev) => ({ ...prev, user_id: userId }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {userOptions.map((userOption) => (
                <SelectItem
                  key={userOption.user_id}
                  value={userOption.user_id ?? ""}
                >
                  {userOption.isCurrentUser ? (
                    <span className="font-medium text-blue-600">
                      This user ({userOption.email})
                      {userOption.full_name && ` - ${userOption.full_name}`}
                    </span>
                  ) : (
                    <>
                      {userOption.email}
                      {userOption.full_name ? ` (${userOption.full_name})` : ""}
                    </>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* TODO: replace by dropdown when organizations backend is ready */}
          <Input
            name="organization_id"
            placeholder="Organization ID"
            value={createForm.organization_id}
            onChange={handleCreateChange}
          />
          {/* List of all roles dropdown */}
          <label className="font-semibold">Role</label>
          <Select value={createForm.role_id} onValueChange={handleRoleSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles?.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap mt-4">
            <Button type="submit" disabled={loadingRoles["form"]}>
              {loadingRoles["form"] ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Role"
              )}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </>
      )}

      {/* Other modes (delete, restore) */}
      {(mode === "softDelete" ||
        mode === "hardDelete" ||
        mode === "restoreRole") && (
        <>
          <label className="font-semibold">Role Assignment</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            <Input
              placeholder="Filter by user email"
              value={filterUser}
              onChange={(e) => {
                setFilterUser(e.target.value);
                setPageIndex(0);
              }}
              className="w-40"
            />
            <Input
              placeholder="Filter by organization"
              value={filterOrg}
              onChange={(e) => {
                setFilterOrg(e.target.value);
                setPageIndex(0);
              }}
              className="w-40"
            />
            <Input
              placeholder="Filter by role"
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPageIndex(0);
              }}
              className="w-40"
            />
            {(filterUser || filterOrg || filterRole) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9"
                onClick={() => {
                  setFilterUser("");
                  setFilterOrg("");
                  setFilterRole("");
                  setPageIndex(0);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Show empty state message if no results */}
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border rounded">
              No role assignments match your filters
            </div>
          ) : (
            <PaginatedDataTable
              columns={assignmentColumns}
              data={paginatedAssignments}
              pageIndex={pageIndex}
              pageCount={totalPages}
              onPageChange={setPageIndex}
            />
          )}

          {onClose && (
            <div className="flex gap-2 flex-wrap mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          )}
        </>
      )}
    </form>
  );
};

export default RoleEditer;
