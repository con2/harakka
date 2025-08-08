import React, { useEffect, useState } from "react";
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

  // Track when clearing is in progress
  const [isClearing, setIsClearing] = useState(false);

  // Important: Initialize with empty string instead of undefined to keep component controlled
  const [localValue, setLocalValue] = useState<string>(
    activeContext.organizationId && activeContext.roleName
      ? `${activeContext.organizationId}:${activeContext.roleName}`
      : "",
  );

  // Keep localValue in sync with activeContext changes
  useEffect(() => {
    const v =
      activeContext.organizationId && activeContext.roleName
        ? `${activeContext.organizationId}:${activeContext.roleName}`
        : "";
    setLocalValue(v);
  }, [activeContext.organizationId, activeContext.roleName]);

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
  const handleContextChange = async (value: string) => {
    // First check if we're clearing the selection
    if (value === "clear") {
      setIsClearing(true);
      setLocalValue(""); // Use empty string instead of undefined

      try {
        await clearActiveContext();
        console.log("Context cleared successfully");
      } catch (error) {
        console.error("Failed to clear context:", error);
      } finally {
        setIsClearing(false);
      }

      // If in admin area and clearing role, redirect to a safe page
      if (isInAdminArea) {
        navigate("/storage");
      }
      return;
    }

    // Set local value for immediate UI feedback
    setLocalValue(value);

    // Otherwise, we're setting a new context
    const [orgId, roleName] = value.split(":");
    const org = currentUserOrganizations.find(
      (o) => o.organization_id === orgId,
    );

    if (orgId && roleName && org) {
      // Save the new role context
      await setActiveContext(orgId, roleName, org.organization_name);

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

  // Add a key to force remounting when roles change
  const componentKey = `role-switcher-${activeRoles.length}-${isClearing}`;

  return activeRoles.length > 1 ? (
    <div className="flex items-center gap-2">
      <Select
        key={componentKey}
        value={localValue}
        onValueChange={handleContextChange}
        defaultValue=""
      >
        <SelectTrigger className="w-[250px]">
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
