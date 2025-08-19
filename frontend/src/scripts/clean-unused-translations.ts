import { checkAllTranslations } from "../translations/utils/checkAllTranslations.ts";
import chalk from "chalk";

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes("--confirm");

if (dryRun) {
  console.log(chalk.yellow("DRY RUN MODE - No files will be modified"));
  console.log(
    chalk.gray("Use --confirm flag to actually remove unused keys\n"),
  );
}

try {
  console.log("Finding unused translation keys...");
  const results = checkAllTranslations(false);

  if (!results.unusedKeys || results.unusedKeys.length === 0) {
    console.log(chalk.green("No unused translation keys found!"));
    process.exit(0);
  }

  console.log(
    `\n${chalk.yellow(`Found ${results.unusedKeys.length} unused keys`)}`,
  );

  if (dryRun) {
    console.log("\nUnused keys that would be removed:");
    for (const key of results.unusedKeys) {
      console.log(`- ${chalk.blue(key)}`);
    }
    console.log(
      chalk.yellow("\nRun with --confirm to actually remove these keys"),
    );
  } else {
    console.log(
      chalk.red("\n CLEANING MODE - This will modify your translation files!"),
    );
    console.log("Keys to be removed:");
    for (const key of results.unusedKeys) {
      console.log(`- ${chalk.blue(key)}`);
    }

    // For now, just log what would be cleaned
    // In a real implementation, you'd want to:
    // 1. Parse each translation module file
    // 2. Remove the unused key paths
    // 3. Write the files back
    console.log(chalk.yellow("\n Automatic cleaning not yet implemented"));
    console.log(
      "This would require careful AST manipulation to preserve formatting",
    );
    console.log("For now, please manually remove the unused keys listed above");
  }
} catch (error) {
  console.error(chalk.red("Error during cleanup:"), error);
  process.exit(1);
}
