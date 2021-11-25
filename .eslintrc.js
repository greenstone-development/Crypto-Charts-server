module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ["airbnb-base", "prettier"],
  plugins: ["prettier"],
  parserOptions: {
    ecmaVersion: 13,
  },
  rules: {
    "no-console": "off",
    "prettier/prettier": "error",
  },
};
