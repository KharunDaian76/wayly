/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve('@wayly/config-eslint/react-internal.js')],
  parserOptions: { tsconfigRootDir: __dirname },
  ignorePatterns: ['dist/', 'node_modules/'],
};
