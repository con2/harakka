// Import all logos at the top
import logoNav from "../assets/logoNav.png";
import logo from "../assets/logo.png";
import logo1 from "../assets/logo1.png";
import illusiaLogo from "../assets/illusiaLogo.png";
import illusiaText from "../assets/illusiaText.png";
import profilePlaceholder from "../assets/profilePlaceholder.png";

// Theme configuration types
export interface OrganizationTheme {
  id: string;
  name: string;
  logo?: {
    main: string; // Main logo for desktop
    small?: string; // Small logo for mobile (optional)
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string; // maps to --highlight2
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primaryForeground: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accentForeground: string;
    destructive: string;
    border: string;
    input: string;
    ring: string;
    // Sidebar colors
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  borderRadius?: string;
}

// Default theme (matches your current index.css :root values)
export const DEFAULT_THEME: OrganizationTheme = {
  id: "default",
  name: "Default Theme",
  logo: {
    main: logoNav,
    small: logo,
  },
  colors: {
    primary: "#2a2a2a",
    secondary: "#9537c7",
    accent: "#3ec3ba", // --highlight2
    background: "white",
    foreground: "oklch(0.145 0 0)",
    card: "oklch(1 0 0)",
    cardForeground: "oklch(0.145 0 0)",
    popover: "oklch(1 0 0)",
    popoverForeground: "oklch(0.145 0 0)",
    primaryForeground: "oklch(0.985 0 0)",
    secondaryForeground: "oklch(0.205 0 0)",
    muted: "oklch(0.97 0 0)",
    mutedForeground: "oklch(0.556 0 0)",
    accentForeground: "oklch(0.205 0 0)",
    destructive: "oklch(0.577 0.245 27.325)",
    border: "oklch(0.922 0 0)",
    input: "oklch(0.922 0 0)",
    ring: "#9537c7",
    // Sidebar
    sidebar: "oklch(0.985 0 0)",
    sidebarForeground: "oklch(0.145 0 0)",
    sidebarPrimary: "oklch(0.205 0 0)",
    sidebarPrimaryForeground: "oklch(0.985 0 0)",
    sidebarAccent: "oklch(0.97 0 0)",
    sidebarAccentForeground: "oklch(0.205 0 0)",
    sidebarBorder: "oklch(0.922 0 0)",
    sidebarRing: "oklch(0.708 0 0)",
  },
  fonts: {
    heading: '"Roboto Slab", serif',
    body: '"Lato", sans-serif',
  },
  borderRadius: "0.625rem",
};

// Organization-specific themes
export const ORGANIZATION_THEMES: Record<string, OrganizationTheme> = {
  // Blue theme for Con2 Storage
  "blue-corporate": {
    id: "blue-corporate",
    name: "Con2 Storage",
    logo: {
      main: logo1,
      small: logo,
    },
    colors: {
      primary: "#1e40af",
      secondary: "#3b82f6",
      accent: "#06b6d4",
      background: "white",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.145 0 0)",
      primaryForeground: "oklch(0.985 0 0)",
      secondaryForeground: "oklch(0.985 0 0)",
      muted: "oklch(0.97 0 0)",
      mutedForeground: "oklch(0.556 0 0)",
      accentForeground: "oklch(0.985 0 0)",
      destructive: "oklch(0.577 0.245 27.325)",
      border: "oklch(0.922 0 0)",
      input: "oklch(0.922 0 0)",
      ring: "#1e40af",
      sidebar: "oklch(0.985 0 0)",
      sidebarForeground: "oklch(0.145 0 0)",
      sidebarPrimary: "#1e40af",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
      sidebarAccent: "oklch(0.97 0 0)",
      sidebarAccentForeground: "oklch(0.205 0 0)",
      sidebarBorder: "oklch(0.922 0 0)",
      sidebarRing: "#1e40af",
    },
  },

  // Green theme for Eco Logistics Inc
  "green-logistics": {
    id: "green-logistics",
    name: "Eco Logistics Inc",
    logo: {
      main: illusiaLogo,
      small: illusiaText,
    },
    colors: {
      primary: "#059669",
      secondary: "#10b981",
      accent: "#34d399",
      background: "white",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.145 0 0)",
      primaryForeground: "oklch(0.985 0 0)",
      secondaryForeground: "oklch(0.985 0 0)",
      muted: "oklch(0.97 0 0)",
      mutedForeground: "oklch(0.556 0 0)",
      accentForeground: "oklch(0.145 0 0)",
      destructive: "oklch(0.577 0.245 27.325)",
      border: "oklch(0.922 0 0)",
      input: "oklch(0.922 0 0)",
      ring: "#059669",
      sidebar: "oklch(0.985 0 0)",
      sidebarForeground: "oklch(0.145 0 0)",
      sidebarPrimary: "#059669",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
      sidebarAccent: "oklch(0.97 0 0)",
      sidebarAccentForeground: "oklch(0.205 0 0)",
      sidebarBorder: "oklch(0.922 0 0)",
      sidebarRing: "#059669",
    },
  },

  // Purple theme for Premium Vault
  "purple-premium": {
    id: "purple-premium",
    name: "Premium Vault",
    logo: {
      main: logoNav,
      small: logo,
    },
    colors: {
      primary: "#7c3aed",
      secondary: "#a855f7",
      accent: "#c084fc",
      background: "white",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.145 0 0)",
      primaryForeground: "oklch(0.985 0 0)",
      secondaryForeground: "oklch(0.985 0 0)",
      muted: "oklch(0.97 0 0)",
      mutedForeground: "oklch(0.556 0 0)",
      accentForeground: "oklch(0.145 0 0)",
      destructive: "oklch(0.577 0.245 27.325)",
      border: "oklch(0.922 0 0)",
      input: "oklch(0.922 0 0)",
      ring: "#7c3aed",
      sidebar: "oklch(0.985 0 0)",
      sidebarForeground: "oklch(0.145 0 0)",
      sidebarPrimary: "#7c3aed",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
      sidebarAccent: "oklch(0.97 0 0)",
      sidebarAccentForeground: "oklch(0.205 0 0)",
      sidebarBorder: "oklch(0.922 0 0)",
      sidebarRing: "#7c3aed",
    },
  },

  // Orange theme for Industrial Storage
  "orange-industrial": {
    id: "orange-industrial",
    name: "Industrial Storage",
    logo: {
      main: logo1,
      small: profilePlaceholder,
    },
    colors: {
      primary: "#ea580c",
      secondary: "#f97316",
      accent: "#fb923c",
      background: "white",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.145 0 0)",
      primaryForeground: "oklch(0.985 0 0)",
      secondaryForeground: "oklch(0.985 0 0)",
      muted: "oklch(0.97 0 0)",
      mutedForeground: "oklch(0.556 0 0)",
      accentForeground: "oklch(0.145 0 0)",
      destructive: "oklch(0.577 0.245 27.325)",
      border: "oklch(0.922 0 0)",
      input: "oklch(0.922 0 0)",
      ring: "#ea580c",
      sidebar: "oklch(0.985 0 0)",
      sidebarForeground: "oklch(0.145 0 0)",
      sidebarPrimary: "#ea580c",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
      sidebarAccent: "oklch(0.97 0 0)",
      sidebarAccentForeground: "oklch(0.205 0 0)",
      sidebarBorder: "oklch(0.922 0 0)",
      sidebarRing: "#ea580c",
    },
  },
};

// Map organization slugs/IDs to theme IDs
export const ORGANIZATION_THEME_MAPPING: Record<string, string> = {
  // Organization ID mappings to theme IDs:

  // Current organization mappings:
  "con2-storage": "blue-corporate",
  "eco-logistics-inc": "green-logistics",
  "premium-vault": "purple-premium",
  "industrial-storage": "orange-industrial",

  // Add more organization mappings as needed:
  // "your-org-id-1": "blue-corporate",
  // "your-org-id-2": "green-logistics",
  // "your-org-id-3": "purple-premium",
  // "your-org-id-4": "orange-industrial",
};

// Dark mode variants (extend this later)
export const DARK_MODE_OVERRIDES = {
  background: "oklch(0.145 0 0)",
  foreground: "oklch(0.985 0 0)",
  card: "oklch(0.205 0 0)",
  cardForeground: "oklch(0.985 0 0)",
  popover: "oklch(0.205 0 0)",
  popoverForeground: "oklch(0.985 0 0)",
  // ... add other dark mode overrides
};

export const getAllThemes = (): OrganizationTheme[] => {
  return [DEFAULT_THEME, ...Object.values(ORGANIZATION_THEMES)];
};

export const getThemeById = (themeId: string): OrganizationTheme | null => {
  if (themeId === DEFAULT_THEME.id) return DEFAULT_THEME;
  return ORGANIZATION_THEMES[themeId] || null;
};

export const getThemeByOrganization = (
  organizationId: string,
): OrganizationTheme => {
  const themeId = ORGANIZATION_THEME_MAPPING[organizationId];
  return getThemeById(themeId) || DEFAULT_THEME;
};
