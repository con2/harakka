import { checkAllTranslations } from "../translations/utils/checkAllTranslations.ts";

// Parse command line arguments
const args = process.argv.slice(2);
console.log("Received args:", args); // Debug line

// Relaxed mode the default
const strictMode = args.includes("strict");

try {
  console.log(
    `Running translation check in ${strictMode ? "strict" : "relaxed"} mode...`,
  );
  const results = checkAllTranslations(strictMode);
  console.log(
    "\nCheck completed. Summary:" +
      (results.translationIssues?.length
        ? ` ${results.translationIssues.length} translation issues found`
        : " No translation issues found") +
      (results.hardcodedStrings?.length
        ? `, ${results.hardcodedStrings.length} hardcoded strings found`
        : ", no hardcoded strings found"),
  );
} catch (error) {
  console.error("Error running translation checker:", error);
  process.exit(1);
}
