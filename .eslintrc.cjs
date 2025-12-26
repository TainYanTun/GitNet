module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true, // For Electron main and preload processes
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    // This setting is required for some rules, like `@typescript-eslint/explicit-module-boundary-types`
    // It should point to your project's tsconfig.json.
    // For a monorepo or complex setup, you might need to specify an array or glob.
    project: [
      "./tsconfig.json",
      "./src/main/tsconfig.json",
      "./src/preload/tsconfig.json",
    ],
  },
  settings: {
    react: {
      version: "detect", // Automatically detect the React version
    },
  },
  rules: {
    // Add custom rules or override recommended ones here
    "react/react-in-jsx-scope": "off", // Not needed for React 17+ with new JSX transform
    "@typescript-eslint/explicit-module-boundary-types": "off", // Disable if you don't want to enforce return types for all functions
    "@typescript-eslint/no-explicit-any": "off", // Often useful in Electron context for IPC
    "no-unused-vars": "off", // Prefer @typescript-eslint/no-unused-vars
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
  ignorePatterns: [
    "dist/",
    "node_modules/",
    "assets/",
    ".eslintrc.cjs",
    "src/shared/types.d.ts" // Ignore generated type definition file
  ],
};