import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRoles } from "@/hooks/useRoles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const RoleContextSwitcher: React.FC = () => {
  const {
    currentUserRoles,
    currentUserOrganizations,
    activeContext,
    setActiveContext,
    clearActiveContext,
  } = useRoles();

  const navigate = useNavigate();
  const location = useLocation();

  // Check if user would lose admin access with this role change
  const isInAdminArea = location.pathname.startsWith("/admin");

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

      // If in admin area and clearing role, redirect to a safe page
      if (isInAdminArea) {
        navigate("/storage");
      }
      return;
    }

    const [orgId, roleName] = value.split(":");
    const org = currentUserOrganizations.find(
      (o) => o.organization_id === orgId,
    );

    if (orgId && roleName && org) {
      // Save the new role context
      setActiveContext(orgId, roleName, org.organization_name);

      // Get the current path to check if redirection is needed
      const currentPath = location.pathname;

      // If we're in the admin area, check if the new role has admin access
      if (currentPath.startsWith("/admin")) {
        const willHaveAdminAccess =
          roleName === "admin" ||
          roleName === "superVera" ||
          roleName === "main_admin" ||
          roleName === "super_admin" ||
          roleName === "storage_manager";

        // If switching to a non-admin role while in admin area, redirect
        if (!willHaveAdminAccess) {
          navigate("/storage");
        }
      }
    }
  };

  return activeRoles.length > 1 ? (
    <div className="flex items-center gap-2">
      <Select
        value={
          activeContext.organizationId && activeContext.roleName
            ? `${activeContext.organizationId}:${activeContext.roleName}`
            : undefined
        }
        onValueChange={handleContextChange}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select active role" />
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
  ) : null;
};
