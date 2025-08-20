import { getAllComponents } from "./getAllComponents";
import { getAllTranslationModules } from "./getAllTranslationModules";

/**
 * Returns all components that do not have a corresponding translation module.
 * @param componentsDir Optional custom components directory
 * @param modulesDir Optional custom translation modules directory
 */
export function getAllComponentsWithoutModules(
  componentsDir?: string,
  modulesDir?: string,
): { name: string; fullPath: string }[] {
  const components = getAllComponents(componentsDir);
  const modules = getAllTranslationModules(modulesDir);

  // Lowercase first letter utility
  function lowerFirst(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  return components.filter(({ name }) => !modules.includes(lowerFirst(name)));
}
