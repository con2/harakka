import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

// Fix for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const SRC_COMPONENTS_DIR = path.resolve(__dirname, "../components");
const TRANSLATION_MODULES_DIR = path.resolve(
  __dirname,
  "../translations/modules",
);

// Helper to get all component files (tsx/jsx)
function getComponentFiles(dir: string): { name: string; fullPath: string }[] {
  const files: { name: string; fullPath: string }[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getComponentFiles(fullPath));
    } else if (/\.(tsx|jsx)$/.test(entry)) {
      files.push({
        name: entry.replace(/\.(tsx|jsx)$/, ""),
        fullPath: fullPath,
      });
    }
  }
  return files;
}

// Helper to get all translation module files (ts)
function getTranslationModules(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => f.replace(/\.ts$/, ""));
}

// Lowercase first letter utility
function lowerFirst(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

const componentFiles = getComponentFiles(SRC_COMPONENTS_DIR);
const translationModules = getTranslationModules(TRANSLATION_MODULES_DIR);

// Find missing modules
const missingModules = componentFiles.filter(
  ({ name }) => !translationModules.includes(lowerFirst(name)),
);

// Separate UI components (in UI or ui folder)
const missingUI = missingModules.filter(({ fullPath }) =>
  /[\\\/](UI|ui)[\\\/]/.test(fullPath),
);
const missingOther = missingModules.filter(
  ({ fullPath }) => !/[\\\/](UI|ui)[\\\/]/.test(fullPath),
);

if (missingModules.length === 0) {
  console.log(
    chalk.green("✅ All components have corresponding translation modules."),
  );
} else {
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
        `\n❌ ${missingUI.length} UI components missing translation modules:`,
      ),
    );
    for (const { name, fullPath } of missingUI) {
      console.log(
        `- ${chalk.yellow(name)} (expected module: ${lowerFirst(name)})`,
      );
      console.log(`  ${chalk.gray(fullPath)}`);
    }
  }
}
