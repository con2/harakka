import React, { useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { UserRoleWithDetails } from "@/types/roles";
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
  } = useRoles();

  // For create
  const [createForm, setCreateForm] = useState<CreateUserRoleDto>({
    user_id: "",
    organization_id: "",
    role_id: "",
  });

  //For update, soft delete, delete
  const [assignmentId, setAssignmentId] = useState(role?.id || "");

  const [isEdit] = useState(!!role);

  const [mode, setMode] = useState<
    "create" | "softDelete" | "restoreRole" | "hardDelete"
  >(isEdit ? "update" : "create");

  const [loading, setLoading] = useState(false);

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
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
          <Input
            name="user_id"
            placeholder="User ID"
            value={createForm.user_id}
            onChange={handleCreateChange}
            disabled={isEdit}
          />
          <Input
            name="organization_id"
            placeholder="Organization ID"
            value={createForm.organization_id}
            onChange={handleCreateChange}
          />
          <Input
            name="role_id"
            placeholder="Role ID"
            value={createForm.role_id}
            onChange={handleCreateChange}
          />
        </>
      )}
      {(mode === "softDelete" ||
        mode === "hardDelete" ||
        mode === "restoreRole") && (
        <Input
          name="assignmentId"
          placeholder="Role Assignment ID"
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
        />
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
