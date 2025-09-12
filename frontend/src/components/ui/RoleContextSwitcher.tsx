import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRoles } from "@/hooks/useRoles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { getOrgLabel } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { setRedirectUrl } from "@/store/slices/uiSlice";
import { useAppDispatch } from "@/store/hooks";

export const RoleContextSwitcher: React.FC = () => {
  const {
    currentUserRoles,
    currentUserOrganizations,
    activeContext,
    setActiveContext,
  } = useRoles();
  const { lang } = useLanguage();
  const location = useLocation();
  const { user } = useAuth();
  const { name: userName } = useProfile(user);
  const dispatch = useAppDispatch();

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

  // Filter to only active roles
  const activeRoles = currentUserRoles.filter((role) => role.is_active);

  // Create role options with format "Role @ Organization"
  const roleOptions = activeRoles.map((role) => {
    const {
      organization_id: orgId,
      role_name: roleName,
      organization_name: orgName,
    } = role;
    return {
      value: `${orgId}:${roleName}`,
      label: getOrgLabel(userName, roleName ?? "", orgName ?? ""),
      orgId: orgId,
      roleName: roleName,
      orgName: orgName,
    };
  });

  // Automatically set the only role as active if there's just one role
  useEffect(() => {
    if (activeRoles.length === 1 && !activeContext.organizationId) {
      const singleRole = activeRoles[0] as {
        organization_id: string;
        role_name: string;
        organization_name: string;
      };
      void setActiveContext(
        singleRole.organization_id,
        singleRole.role_name,
        singleRole.organization_name,
      );
    }
  }, [activeRoles, activeContext, setActiveContext]);

  // Handler for changing the active context
  const handleContextChange = (value: string) => {
    // Set local value for immediate UI feedback
    setLocalValue(value);

    // Otherwise, we're setting a new context
    const [orgId, roleName] = value.split(":");
    const org = currentUserOrganizations.find(
      (o) => o.organization_id === orgId,
    );

    if (orgId && roleName && org) {
      // Save the new role context
      // Get the current path to check if redirection is needed
      const currentPath = location.pathname;
      const ROLES_WITH_ACCESS = [
        "tenant_admin",
        "super_admin",
        "storage_manager",
      ];
      const willHaveAdminAccess = ROLES_WITH_ACCESS.includes(roleName);
      // If we're in the admin area, check if the new role has admin access
      if (currentPath.startsWith("/admin") && !willHaveAdminAccess) {
        void dispatch(setRedirectUrl("/storage"));
      }
      setActiveContext(orgId, roleName, org.organization_name);
    }
  };

  // Add a key to force remounting when roles change
  const componentKey = `role-switcher-${activeRoles.length}`;

  // Hide the switcher if there's only one role
  if (activeRoles.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-primary">
      <Select
        key={componentKey}
        value={localValue}
        onValueChange={handleContextChange}
        defaultValue=""
      >
        <SelectTrigger className="w-[250px] text-(--midnight-black) filter drop-shadow-[0px_0px_1px_var(--subtle-grey)]">
          <SelectValue placeholder={t.roleContextSwitcher.placeholders[lang]} />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
