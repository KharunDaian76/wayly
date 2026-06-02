/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve('@wayly/config-eslint/nest.js')],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: false,
  },
  ignorePatterns: ['dist/', 'node_modules/', 'prisma/'],
};
