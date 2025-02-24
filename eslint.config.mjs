import globals from "globals";
import pluginJs from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  prettierConfig, // Disables ESLint rules that might conflict with Prettier
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      "no-unused-vars": "warn",
      "prettier/prettier": "error", // Ensures Prettier formatting rules are enforced
    },
  },
];
