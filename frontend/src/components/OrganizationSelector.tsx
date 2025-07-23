import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoles } from "@/hooks/useRoles";
import { useTheme } from "@/context/ThemeContext";
import { BuildingIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganizationSelectorProps {
  className?: string;
  showIcon?: boolean;
  placeholder?: string;
  compact?: boolean; // For mobile view
}

export const OrganizationSelector = ({
  className,
  showIcon = true,
  placeholder = "Select organization",
  compact = false,
}: OrganizationSelectorProps) => {
  const { currentUserOrganizations } = useRoles();
  const { setThemeByOrganization } = useTheme();

  // Get the current organization based on the theme
  const getCurrentOrganizationId = () => {
    // This is a bit tricky since we need to reverse-lookup from theme to organization
    // For now, we'll use localStorage or default to the first organization
    const savedOrgId = localStorage.getItem("selected-organization-id");
    if (
      savedOrgId &&
      currentUserOrganizations?.find(
        (org) => org.organization_id === savedOrgId,
      )
    ) {
      return savedOrgId;
    }
    return currentUserOrganizations?.[0]?.organization_id || "";
  };

  const handleOrganizationChange = (organizationId: string) => {
    // Save the selected organization for persistence
    localStorage.setItem("selected-organization-id", organizationId);

    // Update the theme based on the selected organization
    setThemeByOrganization(organizationId);
  };

  // Don't render if user has no organizations or only one
  if (!currentUserOrganizations || currentUserOrganizations.length <= 1) {
    return null;
  }

  const currentOrgId = getCurrentOrganizationId();
  const currentOrgName =
    currentUserOrganizations.find((org) => org.organization_id === currentOrgId)
      ?.organization_name || "";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && <BuildingIcon className="h-4 w-4 text-muted-foreground" />}
      <Select value={currentOrgId} onValueChange={handleOrganizationChange}>
        <SelectTrigger
          className={cn("h-8 text-xs", compact ? "w-[120px]" : "w-[200px]")}
        >
          <SelectValue placeholder={placeholder}>
            {compact
              ? currentOrgName.split(" ")[0] || placeholder
              : currentOrgName || placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {currentUserOrganizations.map((org) => (
            <SelectItem
              key={org.organization_id}
              value={org.organization_id}
              className="text-xs"
            >
              <div className="flex flex-col">
                <span className="font-medium">{org.organization_name}</span>
                <span className="text-xs text-muted-foreground">
                  {org.roles.join(", ")}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
