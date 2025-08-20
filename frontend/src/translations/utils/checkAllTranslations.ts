import { t } from "../index.js";
import path from "path";
import { fileURLToPath } from "url";
import { getAllComponentsWithoutModules } from "./getAllComponentsWithoutModules";
import { filterUIComponents, filterNonUIComponents } from "./getAllComponents";
import { checkTranslationObjectStructure } from "./checkTranslationObjectStructure";
import { checkComponentsForHardcodedStrings } from "./checkComponentsForHardcodedStrings.js";
import { checkUnusedTranslationKeys } from "./checkUnusedTranslationKeys";
import { checkTranslationsLogger } from "./checkTranslationsLogger";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../../");

// --- Component translation module check ---
function checkComponentTranslationModules() {
  const missingModules = getAllComponentsWithoutModules();
  const missingUI = filterUIComponents(missingModules);
  const missingOther = filterNonUIComponents(missingModules);

  // Remove all console.log/chalk output from here!
  // Only return the results:
  return { missingModules, missingUI, missingOther };
}

export function checkAllTranslations(strictMode = false) {
  console.log("Checking component translation modules...");
  const componentModuleResults = checkComponentTranslationModules();
  checkTranslationsLogger.logComponentModules(componentModuleResults);

  console.log("\nChecking translations structure...");
  try {
    const issues = checkTranslationObjectStructure(t);
    checkTranslationsLogger.logTranslationIssues(issues);

    console.log("\nChecking for hardcoded strings in components...");
    const hardcoded = checkComponentsForHardcodedStrings(
      undefined,
      strictMode,
      ROOT_DIR,
    );
    checkTranslationsLogger.logHardcodedStrings(hardcoded);

    console.log("\nChecking for unused translation keys...");
    const unusedKeyResults = checkUnusedTranslationKeys();
    checkTranslationsLogger.logUnusedKeys(unusedKeyResults);

    return {
      componentModuleResults,
      translationIssues: issues,
      hardcodedStrings: hardcoded,
      unusedKeys: unusedKeyResults.unusedKeys,
      keyStats: {
        total: unusedKeyResults.allKeys.length,
        used: unusedKeyResults.usedKeys.length,
        unused: unusedKeyResults.unusedKeys.length,
      },
    };
  } catch (error: unknown) {
    checkTranslationsLogger.logError(error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: String(error) };
  }
}
