import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename =
  typeof import.meta !== "undefined" ? fileURLToPath(import.meta.url) : "";
const __dirname = path.dirname(__filename);

/**
 * Recursively returns all component files (.tsx/.jsx) in a directory.
 * If no dir is provided, uses the default components directory.
 * @param dir Optional directory to search
 * @returns Array of { name, fullPath }
 */
export function getAllComponents(
  dir?: string,
): { name: string; fullPath: string }[] {
  // Default directory: frontend/src/components
  if (!dir) {
    dir = path.resolve(__dirname, "../../");
  }

  const files: { name: string; fullPath: string }[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getAllComponents(fullPath));
    } else if (/\.(tsx|jsx)$/.test(entry)) {
      files.push({
        name: entry.replace(/\.(tsx|jsx)$/, ""),
        fullPath,
      });
    }
  }
  return files;
}

/**
 * Returns only UI components from the list.
 */
export function filterUIComponents(
  components: { name: string; fullPath: string }[],
): { name: string; fullPath: string }[] {
  return components.filter(({ fullPath }) => /(UI|ui)[\\/]/.test(fullPath));
}

/**
 * Returns only non-UI components from the list.
 */
export function filterNonUIComponents(
  components: { name: string; fullPath: string }[],
): { name: string; fullPath: string }[] {
  return components.filter(({ fullPath }) => !/(UI|ui)[\\/]/.test(fullPath));
}
