module.exports = {
  root: false,
  env: { es2022: true, browser: true, node: true },
  extends: ["eslint:recommended"],
  rules: {
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};
