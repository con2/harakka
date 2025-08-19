import chalk from "chalk";
import type { TranslationIssue } from "./checkTranslationObjectStructure";

// Type for component info
export interface ComponentInfo {
  name: string;
  fullPath: string;
}

// Type for hardcoded string issue
export interface HardcodedStringIssue {
  file: string;
  line: number;
  text: string;
  type: string;
  propName?: string;
  varName?: string;
  attrName?: string;
}

// Type for unused key results
export interface UnusedKeyResults {
  unusedKeys: string[];
  allKeys: string[];
  usedKeys: string[];
}

export const checkTranslationsLogger = {
  logComponentModules(results: {
    missingModules: ComponentInfo[];
    missingUI: ComponentInfo[];
    missingOther: ComponentInfo[];
  }) {
    const { missingModules, missingUI, missingOther } = results;
    function lowerFirst(str: string) {
      return str.charAt(0).toLowerCase() + str.slice(1);
    }
    if (missingModules.length === 0) {
      console.log(
        chalk.green(
          "✅ All components have corresponding translation modules.",
        ),
      );
      return;
    }
    if (missingOther.length > 0) {
      console.log(
        chalk.red(
          `❌ ${missingOther.length} non-UI components missing translation modules:`,
        ),
      );
      for (const { name, fullPath } of missingOther) {
        console.log(
          `- ${chalk.yellow(name)} (expected module: ${lowerFirst(name)})`,
        );
        console.log(`  ${chalk.gray(fullPath)}`);
      }
    }
    if (missingUI.length > 0) {
      console.log(
        chalk.red(
          `❌ ${missingUI.length} UI components missing translation modules:`,
        ),
      );
      for (const { name, fullPath } of missingUI) {
        console.log(
          `- ${chalk.yellow(name)} (expected module: ${lowerFirst(name)})`,
        );
        console.log(`  ${chalk.gray(fullPath)}`);
      }
    }
  },

  logTranslationIssues(issues: TranslationIssue[]) {
    if (issues.length === 0) {
      console.log(chalk.green("✅ All translations are present (in modules)."));
    } else {
      console.warn(
        chalk.red(
          `❌ Found ${issues.length} missing translations (in modules):`,
        ),
      );
      for (const issue of issues) {
        console.warn(
          `- ${chalk.blue(issue.path)}: ${chalk.yellow(issue.issue)}`,
        );
      }
    }
  },

  logHardcodedStrings(hardcoded: HardcodedStringIssue[]) {
    if (hardcoded.length === 0) {
      console.log(chalk.green("✅ No hardcoded strings found."));
    } else {
      console.warn(
        chalk.red(
          `❌ Found ${hardcoded.length} potential hardcoded UI strings:`,
        ),
      );
      for (const issue of hardcoded) {
        if (issue.propName) {
          console.warn(
            `- ${chalk.blue(issue.file)}:${chalk.yellow(issue.line)} ${chalk.magenta(issue.propName)}: "${chalk.red(issue.text)}"`,
          );
        } else {
          console.warn(
            `- ${chalk.blue(issue.file)}:${chalk.yellow(issue.line)} "${chalk.red(issue.text)}"`,
          );
        }
      }
    }
  },

  logUnusedKeys(unusedKeyResults: UnusedKeyResults) {
    if (unusedKeyResults.unusedKeys.length === 0) {
      console.log(chalk.green("No unused translation keys found."));
    } else {
      console.warn(
        chalk.yellow(
          `Found ${unusedKeyResults.unusedKeys.length} unused translation keys:`,
        ),
      );
      for (const key of unusedKeyResults.unusedKeys) {
        console.warn(`- ${chalk.blue(key)}`);
      }
      console.log(
        chalk.gray(
          `\nTotal keys: ${unusedKeyResults.allKeys.length}, Used: ${unusedKeyResults.usedKeys.length}, Unused: ${unusedKeyResults.unusedKeys.length}`,
        ),
      );
    }
  },

  logError(error: unknown) {
    console.error(chalk.red("Error checking translations:"), error);
  },
};
