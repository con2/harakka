export interface RuntimeConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiUrl: string;
}

// Declare the global window property
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: RuntimeConfig;
  }
}

// Helper function to safely get config with type checking
export function getRuntimeConfig(): RuntimeConfig {
  // Default values (will be overridden by window.__RUNTIME_CONFIG__ if available)
  const defaultConfig: RuntimeConfig = {
    supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string) || "",
    supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "",
    apiUrl: (import.meta.env.VITE_API_URL as string) || "",
  };

  // Merge with runtime config if available
  if (typeof window !== "undefined" && window.__RUNTIME_CONFIG__) {
    return {
      ...defaultConfig,
      ...window.__RUNTIME_CONFIG__,
    };
  }

  return defaultConfig;
}
