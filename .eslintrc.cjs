/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve('@wayly/config-eslint/base.js')],
  // Each app/package owns its own ESLint config; the root config only lints
  // root-level tooling files.
  ignorePatterns: ['apps/**', 'packages/**', 'node_modules/', 'dist/', '.next/', '.turbo/'],
};
