import React, { useMemo, useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { CreateUserRoleDto, UserRoleWithDetails } from "@/types/roles";
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

interface RoleEditerProps {
  role?: UserRoleWithDetails;
  onClose?: () => void;
}

const modeOptions = [
  { value: "create", label: "Create" },
  { value: "softDelete", label: "Soft Delete" },
  { value: "restoreRole", label: "Restore Role" },
  { value: "hardDelete", label: "Hard Delete" },
] as const;

export const RoleEditer: React.FC<RoleEditerProps> = ({ role, onClose }) => {
  const {
    createRole,
    updateRole,
    deleteRole,
    permanentDeleteRole,
    refreshAllUserRoles,
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
    return allUserRoles
      .filter(
        (r) =>
          r.user_email && !seen.has(r.user_email) && seen.add(r.user_email),
      )
      .map((r) => ({
        user_id: r.user_id,
        email: r.user_email,
        full_name: r.user_full_name,
      }));
  }, [allUserRoles]);

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

  const [loading, setLoading] = useState(false);

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (roleId: string) => {
    setCreateForm((prev) => ({ ...prev, role_id: roleId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "create") {
        await createRole(createForm);
        toast.success("Role created");
        await new Promise((res) => setTimeout(res, 300));
        await refreshAllUserRoles();
        setCreateForm({ user_id: "", organization_id: "", role_id: "" });
      } else if (mode === "softDelete" && assignmentId) {
        await deleteRole(assignmentId);
        toast.success("Role deactivated");
        await refreshAllUserRoles();
      } else if (mode === "restoreRole" && assignmentId) {
        await updateRole(assignmentId, { is_active: true });
        toast.success("Role restored");
        await refreshAllUserRoles();
      } else if (mode === "hardDelete" && assignmentId) {
        await permanentDeleteRole(assignmentId);
        toast.success("Role permanently deleted");
        await refreshAllUserRoles();
      }
      onClose?.();
    } catch {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const assignmentColumns: ColumnDef<UserRoleWithDetails>[] = [
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
      cell: ({ row }) => (
        <Button
          size="sm"
          type="button"
          onClick={async () => {
            setLoading(true);
            try {
              setAssignmentId(row.original.id!); // Keep assignmentId up to date
              if (mode === "softDelete") {
                await deleteRole(row.original.id!);
                toast.success("Role deactivated");
              } else if (mode === "restoreRole") {
                await updateRole(row.original.id!, { is_active: true });
                toast.success("Role restored");
              } else if (mode === "hardDelete") {
                await permanentDeleteRole(row.original.id!);
                toast.success("Role permanently deleted");
              }
              await refreshAllUserRoles();
              onClose?.();
            } catch {
              toast.error("Operation failed");
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          {mode === "softDelete" && "Soft Delete"}
          {mode === "restoreRole" && "Restore"}
          {mode === "hardDelete" && "Hard Delete"}
        </Button>
      ),
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
              {userOptions.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.email}
                  {user.full_name ? ` (${user.full_name})` : ""}
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
          <div className="flex gap-2 flex-wrap mt-4">
            <Button type="submit" disabled={loading}>
              Create
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </>
      )}
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
          <PaginatedDataTable
            columns={assignmentColumns}
            data={paginatedAssignments}
            pageIndex={pageIndex}
            pageCount={totalPages}
            onPageChange={setPageIndex}
          />
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
