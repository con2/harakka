import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename =
  typeof import.meta !== "undefined" ? fileURLToPath(import.meta.url) : "";
const __dirname = path.dirname(__filename);

/**
 * Recursively gets all translation module files (.ts) in a directory.
 * Returns array of module names (without .ts extension).
 * If no dir is provided, uses the default translations/modules directory.
 */
export function getAllTranslationModules(dir?: string): string[] {
  // Default directory: frontend/src/translations/modules
  if (!dir) {
    dir = path.resolve(__dirname, "../../translations/modules");
  }

  let modules: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      modules = modules.concat(getAllTranslationModules(fullPath));
    } else if (entry.endsWith(".ts")) {
      modules.push(entry.replace(/\.ts$/, ""));
    }
  }
  return modules;
}
