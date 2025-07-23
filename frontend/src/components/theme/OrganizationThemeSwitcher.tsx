import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { ORGANIZATION_THEME_MAPPING, getAllThemes } from "@/lib/themes";

/**
 * Development component to test theme switching by simulating different organizations
 * This simulates what would happen when users switch between organizations
 */
export function OrganizationThemeSwitcher() {
  const { currentTheme, setThemeByOrganization, resetToDefault } = useTheme();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  // Create mock organizations based on our theme mapping
  const mockOrganizations = Object.entries(ORGANIZATION_THEME_MAPPING).map(
    ([orgId, themeId]) => ({
      id: orgId,
      name: orgId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      themeId,
    }),
  );

  // Add a "No Organization" option to test default theme
  const organizationOptions = [
    { id: "", name: "No Organization (Default Theme)", themeId: "default" },
    ...mockOrganizations,
  ];

  const allThemes = getAllThemes();

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    if (orgId === "") {
      resetToDefault();
    } else {
      setThemeByOrganization(orgId);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-card border rounded-lg p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">🎨 Theme Switcher</h2>
          <p className="text-sm text-muted-foreground">
            Simulate switching organizations to see theme changes
          </p>
        </div>

        {/* Current Theme Display */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="font-medium mb-3">Current Theme</h3>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div
                className="w-6 h-6 rounded border-2 border-foreground/20"
                style={{ backgroundColor: currentTheme.colors.primary }}
                title="Primary"
              />
              <div
                className="w-6 h-6 rounded border-2 border-foreground/20"
                style={{ backgroundColor: currentTheme.colors.secondary }}
                title="Secondary"
              />
              <div
                className="w-6 h-6 rounded border-2 border-foreground/20"
                style={{ backgroundColor: currentTheme.colors.accent }}
                title="Accent"
              />
            </div>
            <div>
              <div className="font-medium text-sm">{currentTheme.name}</div>
              <div className="text-xs text-muted-foreground">
                ID: {currentTheme.id}
              </div>
            </div>
          </div>
        </div>

        {/* Organization Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Organization:
          </label>
          <select
            value={selectedOrgId}
            onChange={(e) => handleOrgChange(e.target.value)}
            className="w-full p-2 border rounded-md bg-background text-foreground"
          >
            {organizationOptions.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            This simulates what happens when users switch organizations
          </p>
        </div>

        {/* Theme Preview Buttons */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Theme Preview:</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="infoBtn">Info Button</button>
            <button className="editBtn">Edit Button</button>
            <button className="addBtn">Add Button</button>
            <div className="deleteBtn cursor-pointer text-center py-1">
              Delete Button
            </div>
          </div>
        </div>

        {/* Available Themes Info */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-sm mb-2">Available Themes:</h3>
          <div className="space-y-1">
            {allThemes.map((theme) => (
              <div key={theme.id} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded border"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <span
                  className={
                    theme.id === currentTheme.id
                      ? "font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {theme.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
