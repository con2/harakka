import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import dotenvExpand from "dotenv-expand";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load and expand env variables
  const env = loadEnv(mode, path.resolve(__dirname, ".."), "");
  const expandedEnv = { parsed: env };
  dotenvExpand.expand(expandedEnv);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5180,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Make root env.local variables available to Vite
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        process.env.VITE_SUPABASE_URL,
      ),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
        process.env.VITE_SUPABASE_ANON_KEY,
      ),
      "import.meta.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL),
    },
  };
});
