import fs from "fs";
import path from "path";
import readline from "readline";
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

// Get CLI params
const args = process.argv.slice(2);
const langArg = args.find((a) => /^[a-zA-Z,]+$/.test(a));
const languages = langArg ? langArg.split(",") : ["en", "fi"];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askIncludeUI(): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question("Include UI components? (y/n): ", (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

async function main() {
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

  const includeUI = await askIncludeUI();

  const toCreate = includeUI ? [...missingOther, ...missingUI] : missingOther;

  if (toCreate.length === 0) {
    console.log(chalk.green("No missing translation modules to create!"));
    return;
  }

  for (const { name } of toCreate) {
    const moduleName = lowerFirst(name);
    const filePath = path.join(TRANSLATION_MODULES_DIR, `${moduleName}.ts`);
    if (fs.existsSync(filePath)) {
      console.log(chalk.gray(`Already exists: ${filePath}`));
      continue;
    }
    // Draft content
    const content =
      `// Draft translation module for ${name}\n` +
      `export const ${moduleName} = {\n` +
      languages
        .map((lang) => `  ${lang}: {\n    // TODO: Add keys\n  }`)
        .join(",\n") +
      `\n};\n`;

    fs.writeFileSync(filePath, content, "utf8");
    console.log(chalk.green(`Created: ${filePath}`));
  }
}

main();
