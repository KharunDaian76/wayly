/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve('@wayly/config-eslint/next.js')],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['.next/', 'node_modules/'],
};
