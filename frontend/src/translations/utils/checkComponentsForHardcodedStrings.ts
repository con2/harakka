import path from "path";
import fs from "fs";
import { getAllComponents } from "./getAllComponents";

export function checkComponentsForHardcodedStrings(
  dir?: string,
  strictMode: boolean = false,
  rootDir?: string,
) {
  // Get all component files (.tsx/.jsx)
  const componentFiles = getAllComponents(dir);

  // Extract file paths
  const files = componentFiles.map(({ fullPath }) => fullPath);

  const jsxContentRegex = strictMode
    ? />\s*([^<>{}\n]+?)\s*</g
    : />\s*([\w\s.,!?;:'"()-]+?)\s*</g;

  const propAssignmentRegex = strictMode
    ? /\b(header|title|label|placeholder|aria-label|alt|text|description|message|content|name|button|heading|tooltip|summary|value|className|style|aria-description)\s*:\s*["']([^"']+?)["']/g
    : /\b(header|title|label|placeholder|aria-label|alt|text|description|message|content|name|button|heading|tooltip|summary|value)\s*:\s*["']([^"']+?)["']/g;

  const stringAssignmentRegex = strictMode
    ? /\b(const|let|var|return)\s+\w+\s*=\s*["']([^"']+?)["']/g
    : /\b(const|let|var)\s+\w+\s*=\s*["']([^"']+?)["']/g;

  const issues = [];

  const ignorePatterns = strictMode
    ? [/^\/\//, /^\s*$/]
    : [/^\/\//, /^\s*$/, /^[a-z0-9_-]+$/, /^name:/, /[)}]:[({]$/, /^&/, /^[=]/];

  const falsePositivePatterns = [
    /^[A-Z][a-zA-Z]+$/,
    /^[a-z]+([A-Z][a-z]*)*$/,
    /value:\s*"(create|update|delete|edit|softDelete|restoreRole|hardDelete)"/,
    /\)\s*:\s*\w+\s*\?\s*\(/,
    /^\w+\.\w+\./,
    /\w+\.toLowerCase\(\)/,
    /\w+\.includes\(/,
    /^\s*\)\s*[=:>]\s*/,
  ];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");

      if (
        (!strictMode && file.includes("validations")) ||
        file.includes(".test.") ||
        file.includes(".d.ts")
      )
        continue;

      let jsxMatch;
      jsxContentRegex.lastIndex = 0;

      while ((jsxMatch = jsxContentRegex.exec(content))) {
        const str = jsxMatch[1].trim();
        const lineNumber = content
          .substring(0, jsxMatch.index)
          .split("\n").length;

        const shouldReport = strictMode
          ? str && str.length > 0
          : str && str.length > 2;

        const punctuationRegex = strictMode
          ? /^[\s\d.,:;!?-]+$/
          : /^[\s\d.,:;!?@#$%^&*()+=\-€$%]+$/;

        if (
          shouldReport &&
          (!strictMode || !str.includes("{")) &&
          !str.includes("t.") &&
          !punctuationRegex.test(str) &&
          !ignorePatterns.some((pattern) => pattern.test(str)) &&
          !falsePositivePatterns.some((pattern) => pattern.test(str)) &&
          !/\w+\.\w+\(/.test(str) &&
          !/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/.test(str) &&
          !/\)\s*[,;}\]]/.test(str) &&
          !/^\s*\w+\s*[(){}[\]]/.test(str)
        ) {
          const relPath = rootDir ? path.relative(rootDir, file) : file;
          issues.push({
            file: relPath,
            line: lineNumber,
            text: str,
            type: "jsx",
          });
        }
      }

      let propMatch;
      propAssignmentRegex.lastIndex = 0;

      while ((propMatch = propAssignmentRegex.exec(content))) {
        const propName = propMatch[1];
        const str = propMatch[2].trim();
        const lineNumber = content
          .substring(0, propMatch.index)
          .split("\n").length;

        if (
          str &&
          str.length > 1 &&
          !str.includes("t.") &&
          !falsePositivePatterns.some((pattern) =>
            pattern.test(`${propName}: "${str}"`),
          ) &&
          !/^(transition|hover|bg-|text-|border-|font-|p-|m-|w-|h-|flex|grid|rounded|shadow|space-|gap-|justify-|items-|absolute|relative|fixed|static|sticky|top-|bottom-|left-|right-|z-|opacity-|cursor-|select-|pointer-|overflow-|hidden|visible|block|inline|table-|sr-only|not-sr-only)/.test(
            str,
          )
        ) {
          const relPath = rootDir ? path.relative(rootDir, file) : file;
          issues.push({
            file: relPath,
            line: lineNumber,
            text: str,
            propName: propName,
            type: "prop",
          });
        }
      }

      let stringMatch;
      stringAssignmentRegex.lastIndex = 0;

      while ((stringMatch = stringAssignmentRegex.exec(content))) {
        const varName = stringMatch[1];
        const str = stringMatch[2].trim();
        const lineNumber = content
          .substring(0, stringMatch.index)
          .split("\n").length;

        if (
          str &&
          str.length > 2 &&
          !str.includes("t.") &&
          !/^[\s\d.,:;!?@#$%^&*()+=\-€$%]+$/.test(str) &&
          !/^(https?:\/\/|www\.)/.test(str) &&
          !/^[A-Z][a-zA-Z0-9]*$/.test(str) &&
          !/\w+\.\w+\(/.test(str) &&
          !/\)\s*[,;}\]]/.test(str) &&
          !ignorePatterns.some((pattern) => pattern.test(str))
        ) {
          const relPath = rootDir ? path.relative(rootDir, file) : file;
          issues.push({
            file: relPath,
            line: lineNumber,
            text: str,
            varName: varName,
            type: "string-var",
          });
        }
      }

      if (strictMode) {
        const attrRegex =
          /\b(placeholder|title|alt|aria-label|data-tooltip)\s*=\s*["']([^"'{}]+?)["']/g;
        let attrMatch;

        while ((attrMatch = attrRegex.exec(content))) {
          const attrName = attrMatch[1];
          const str = attrMatch[2].trim();
          const lineNumber = content
            .substring(0, attrMatch.index)
            .split("\n").length;

          if (
            str &&
            str.length > 1 &&
            !str.includes("t.") &&
            !/^[\s\d.,:;!?-]+$/.test(str)
          ) {
            const relPath = rootDir ? path.relative(rootDir, file) : file;
            issues.push({
              file: relPath,
              line: lineNumber,
              text: str,
              type: "jsx-attr",
              attrName,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  return issues;
}
