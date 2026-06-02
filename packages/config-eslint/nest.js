/**
 * ESLint config for the NestJS backend (apps/api).
 * Relaxes a few rules that conflict with Nest's decorator-driven patterns.
 *
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: ['./base.js'],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
  },
};
