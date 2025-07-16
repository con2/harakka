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

  const [mode, setMode] = useState<
    "create" | "softDelete" | "restoreRole" | "hardDelete"
  >("create");

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
      } else if (mode === "softDelete" && assignmentId) {
        await deleteRole(assignmentId);
        toast.success("Role deactivated");
      } else if (mode === "restoreRole" && assignmentId) {
        await updateRole(assignmentId, { is_active: true });
        toast.success("Role restored");
      } else if (mode === "hardDelete" && assignmentId) {
        await permanentDeleteRole(assignmentId);
        toast.success("Role permanently deleted");
      }
      await refreshAllUserRoles();
      onClose?.();
    } catch {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

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
        </>
      )}
      {(mode === "softDelete" ||
        mode === "hardDelete" ||
        mode === "restoreRole") && (
        <>
          <label className="font-semibold">Role Assignment</label>
          <Select
            value={assignmentId}
            onValueChange={(id) => setAssignmentId(id)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Role Assignment" />
            </SelectTrigger>
            <SelectContent>
              {allUserRoles.map((role) => (
                <SelectItem key={role.id} value={role.id || ""}>
                  {role.user_email
                    ? `${role.user_email} (${role.role_name} in ${role.organization_name})`
                    : `${role.role_name} in ${role.organization_name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
      <div className="flex gap-2 flex-wrap">
        <Button type="submit" disabled={loading}>
          {mode === "create" && "Create"}
          {mode === "softDelete" && "Confirm Soft Delete"}
          {mode === "hardDelete" && "Confirm Hard Delete"}
          {mode === "restoreRole" && "Restore"}
        </Button>
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default RoleEditer;
