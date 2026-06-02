/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve('@wayly/config-eslint/base.js')],
  parserOptions: { tsconfigRootDir: __dirname },
  env: { browser: true, node: true },
  ignorePatterns: ['dist/', 'node_modules/'],
};
