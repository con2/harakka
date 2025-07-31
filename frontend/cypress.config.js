import { defineConfig } from "cypress";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Cypress-specific env file
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Collect all envs to expose
const envVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_API_URL",
  "SUPABASE_PROJECT_ID",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_URL",
  "SUPABASE_JWT_SECRET",
  "Supabase_CLI_db_password",
  "SUPABASE_STORAGE_URL",

  "PORT",
  "NODE_ENV",
  "ALLOWED_ORIGINS",
  "CYPRESS_REGULAR_USER_EMAIL",
  "CYPRESS_REGULAR_USER_PASSWORD",
  "CYPRESS_SUPERVERA_USER_EMAIL",
  "CYPRESS_SUPERVERA_USER_PASSWORD",
];

const cypressEnv = {};
envVars.forEach((key) => {
  if (process.env[key]) {
    cypressEnv[key] = process.env[key];
  }
});

// Add exported default directly - avoid any intermediate variables
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5180",
    env: cypressEnv,
    video: false, // enable/disable video recording
    videoCompression: 0, // No compression for highest quality in demos
    videosFolder: "cypress/videos", // Where videos are saved
    viewportWidth: 1280, // Wider viewport for demos
    viewportHeight: 800, // Taller viewport for demos
    setupNodeEvents(on, config) {
      return config;
    },
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
