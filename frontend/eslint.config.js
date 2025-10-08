import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  { ignores: ["dist", "node_module", "src/types/supabase.types.ts", "build"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    // Put our rules here
    rules: {
      /* React‑specific lint rules */
      ...reactHooks.configs.recommended.rules,

      // ────────────────  CON2‑111: TEMPORARY “unsafe” overrides  ────────────────
      /* These rules shout whenever an `any` value leaks through async flows,
         Redux slices, Supabase payloads, etc.  We disable them for now so the
         pipeline stays green while we migrate to strict typing.  Re‑enable one
         block at a time. */

      // -------- “any”‑related safety nets --------
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      "@typescript-eslint/no-redundant-type-constituents": "error",

      // -------- Promise‑related safety nets --------
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/await-thenable": "off",

      /* Still surface *explicit* `any` usage so devs notice it, but don't block
         CI while we work through the backlog. */
      "@typescript-eslint/no-explicit-any": "warn",

      // -------- Unused variables configuration --------
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true, // Allow unused vars when destructuring irrelevant properties.
        },
      ],

      // ---------- React Fast Refresh ----------
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  eslintPluginPrettierRecommended,
  {
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
);
