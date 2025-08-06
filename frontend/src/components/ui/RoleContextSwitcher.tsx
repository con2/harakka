import React from "react";
import { useRoles } from "@/hooks/useRoles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const RoleContextSwitcher: React.FC = () => {
  const {
    currentUserRoles,
    currentUserOrganizations,
    activeContext,
    setActiveContext,
    clearActiveContext,
  } = useRoles();

  // Filter to only active roles
  const activeRoles = currentUserRoles.filter((role) => role.is_active);

  // Create role options with format "Role @ Organization"
  const roleOptions = activeRoles.map((role) => ({
    value: `${role.organization_id}:${role.role_name}`,
    label: `${role.role_name} @ ${role.organization_name}`,
    orgId: role.organization_id,
    roleName: role.role_name,
    orgName: role.organization_name,
  }));

  // Handler for changing the active context
  const handleContextChange = (value: string) => {
    if (value === "clear") {
      clearActiveContext();
      return;
    }

    const [orgId, roleName] = value.split(":");
    const org = currentUserOrganizations.find(
      (o) => o.organization_id === orgId,
    );

    if (orgId && roleName && org) {
      setActiveContext(orgId, roleName, org.organization_name);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {activeContext.roleName ? (
        <Badge className="bg-secondary text-white">
          {activeContext.roleName} @ {activeContext.organizationName}
        </Badge>
      ) : null}

      <Select
        value={
          activeContext.organizationId && activeContext.roleName
            ? `${activeContext.organizationId}:${activeContext.roleName}`
            : undefined
        }
        onValueChange={handleContextChange}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select role context" />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          {activeContext.organizationId && (
            <SelectItem value="clear">Clear selection</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
