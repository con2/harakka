import fs from "fs";
import path from "path";
import readline from "readline";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { getAllComponentsWithoutModules } from "../translations/utils/getAllComponentsWithoutModules";
import {
  filterUIComponents,
  filterNonUIComponents,
} from "../translations/utils/getAllComponents";
import { SUPPORTED_LANGUAGES } from "../translations/SUPPORTED_LANGUAGES";

// Fix for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const SRC_COMPONENTS_DIR = path.resolve(__dirname, "../components");
const TRANSLATION_MODULES_DIR = path.resolve(
  __dirname,
  "../translations/modules",
);

// Lowercase first letter utility
function lowerFirst(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// Get CLI params
const args = process.argv.slice(2);
const langArg = args.find((a) => /^[a-zA-Z,]+$/.test(a));
const languages = langArg ? langArg.split(",") : SUPPORTED_LANGUAGES;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askIncludeUI(): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question("Include UI components? (y/n): ", (answer) => {
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

function askLimit(): Promise<number | undefined> {
  return new Promise((resolve) => {
    rl.question(
      "How many modules to create? (leave blank for all): ",
      (answer) => {
        rl.close();
        const num = Number(answer.trim());
        resolve(isNaN(num) || num <= 0 ? undefined : num);
      },
    );
  });
}

async function main() {
  // Use util to get missing components
  const missingModules = getAllComponentsWithoutModules(
    SRC_COMPONENTS_DIR,
    TRANSLATION_MODULES_DIR,
  );

  // Separate UI and non-UI components using utils
  const missingUI = filterUIComponents(missingModules);
  const missingOther = filterNonUIComponents(missingModules);

  const includeUI = await askIncludeUI();
  const limit = await askLimit();

  const toCreateRaw = includeUI
    ? [...missingOther, ...missingUI]
    : missingOther;
  const toCreate = limit ? toCreateRaw.slice(0, limit) : toCreateRaw;

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

void main();
