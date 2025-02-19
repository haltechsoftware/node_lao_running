import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "no-console": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-var": "off",
      "prefer-const": "off",
      "prefer-template": "off",
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
    },
  },
  pluginJs.configs.recommended,
];
