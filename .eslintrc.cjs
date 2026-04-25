/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: [
    "node_modules",
    "dist",
    "build",
    "storybook-static",
    ".turbo",
    "coverage",
    "**/*.md",
    "**/*.sql",
    "**/supabase/**",
  ],
  env: { es2022: true, browser: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "@typescript-eslint/no-empty-object-type": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    "react-hooks/exhaustive-deps": "error",
  },
  overrides: [
    {
      files: ["apps/mobile/**/*.{ts,tsx}"],
      env: { es2022: true },
      globals: {
        __DEV__: "readonly",
      },
    },
  ],
};
