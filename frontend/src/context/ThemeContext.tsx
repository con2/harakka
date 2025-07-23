import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRoles } from "@/hooks/useRoles";
import {
  OrganizationTheme,
  DEFAULT_THEME,
  getThemeByOrganization,
} from "@/lib/themes";

interface ThemeContextType {
  currentTheme: OrganizationTheme;
  isDarkMode: boolean;
  setTheme: (theme: OrganizationTheme) => void;
  toggleDarkMode: () => void;
  resetToDefault: () => void;
  setThemeByOrganization: (organizationId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] =
    useState<OrganizationTheme>(DEFAULT_THEME);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { currentUserOrganizations } = useRoles();

  // Right now we load theme from localStorage on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem("app-theme-id");
    const savedDarkMode = localStorage.getItem("app-dark-mode") === "true";

    if (savedThemeId) {
      const theme = getThemeByOrganization(savedThemeId);
      setCurrentTheme(theme);
    }
    setIsDarkMode(savedDarkMode);
  }, []);

  // Auto-switch theme when organization changes
  useEffect(() => {
    if (currentUserOrganizations && currentUserOrganizations.length > 0) {
      // Check if user has manually selected an organization
      const selectedOrgId = localStorage.getItem("selected-organization-id");
      let targetOrgId: string;

      if (
        selectedOrgId &&
        currentUserOrganizations.find(
          (org) => org.organization_id === selectedOrgId,
        )
      ) {
        // Use manually selected organization
        targetOrgId = selectedOrgId;
      } else {
        // Default to first organization and save it
        targetOrgId = currentUserOrganizations[0].organization_id;
        localStorage.setItem("selected-organization-id", targetOrgId);
      }

      const orgTheme = getThemeByOrganization(targetOrgId);

      // Only switch if we haven't manually set a theme or if it's set to auto
      const savedThemeId = localStorage.getItem("app-theme-id");
      if (!savedThemeId || savedThemeId === "auto") {
        setCurrentTheme(orgTheme);
      }
    }
  }, [currentUserOrganizations]);

  // Apply theme to CSS variables whenever theme or dark mode changes
  useEffect(() => {
    applyTheme(currentTheme, isDarkMode);
  }, [currentTheme, isDarkMode]);

  const applyTheme = (theme: OrganizationTheme, darkMode: boolean) => {
    const root = document.documentElement;

    // Apply theme colors as CSS custom properties
    root.style.setProperty("--primary", theme.colors.primary);
    root.style.setProperty("--secondary", theme.colors.secondary);
    root.style.setProperty("--highlight2", theme.colors.accent);
    root.style.setProperty("--ring", theme.colors.ring);

    // Apply other colors
    root.style.setProperty("--background", theme.colors.background);
    root.style.setProperty("--foreground", theme.colors.foreground);
    root.style.setProperty("--card", theme.colors.card);
    root.style.setProperty("--card-foreground", theme.colors.cardForeground);
    root.style.setProperty("--popover", theme.colors.popover);
    root.style.setProperty(
      "--popover-foreground",
      theme.colors.popoverForeground,
    );
    root.style.setProperty(
      "--primary-foreground",
      theme.colors.primaryForeground,
    );
    root.style.setProperty(
      "--secondary-foreground",
      theme.colors.secondaryForeground,
    );
    root.style.setProperty("--muted", theme.colors.muted);
    root.style.setProperty("--muted-foreground", theme.colors.mutedForeground);
    root.style.setProperty("--accent", theme.colors.accent);
    root.style.setProperty(
      "--accent-foreground",
      theme.colors.accentForeground,
    );
    root.style.setProperty("--destructive", theme.colors.destructive);
    root.style.setProperty("--border", theme.colors.border);
    root.style.setProperty("--input", theme.colors.input);

    // Sidebar colors
    root.style.setProperty("--sidebar", theme.colors.sidebar);
    root.style.setProperty(
      "--sidebar-foreground",
      theme.colors.sidebarForeground,
    );
    root.style.setProperty("--sidebar-primary", theme.colors.sidebarPrimary);
    root.style.setProperty(
      "--sidebar-primary-foreground",
      theme.colors.sidebarPrimaryForeground,
    );
    root.style.setProperty("--sidebar-accent", theme.colors.sidebarAccent);
    root.style.setProperty(
      "--sidebar-accent-foreground",
      theme.colors.sidebarAccentForeground,
    );
    root.style.setProperty("--sidebar-border", theme.colors.sidebarBorder);
    root.style.setProperty("--sidebar-ring", theme.colors.sidebarRing);

    // Apply fonts if provided
    if (theme.fonts?.heading) {
      root.style.setProperty("--heading-font", theme.fonts.heading);
    }
    if (theme.fonts?.body) {
      root.style.setProperty("--main-font", theme.fonts.body);
    }

    // Apply border radius
    if (theme.borderRadius) {
      root.style.setProperty("--radius", theme.borderRadius);
    }

    // Handle dark mode class
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const setTheme = (theme: OrganizationTheme) => {
    setCurrentTheme(theme);
    localStorage.setItem("app-theme-id", theme.id);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("app-dark-mode", newDarkMode.toString());
  };

  const resetToDefault = () => {
    setCurrentTheme(DEFAULT_THEME);
    localStorage.removeItem("app-theme-id");
  };

  const setThemeByOrganization = (organizationId: string) => {
    const theme = getThemeByOrganization(organizationId);
    setTheme(theme);
  };

  const contextValue: ThemeContextType = {
    currentTheme,
    isDarkMode,
    setTheme,
    toggleDarkMode,
    resetToDefault,
    setThemeByOrganization,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
