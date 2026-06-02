/**
 * ESLint config for the Next.js frontend (apps/web).
 *
 * NOTE: This config intentionally does NOT extend ./base.js. `eslint-config-next`
 * already registers the `import`, `react`, `react-hooks`, and `jsx-a11y` plugins;
 * extending base.js would register a SECOND `eslint-plugin-import` instance and
 * ESLint 8 errors with "Plugin import was conflicted between …". We therefore let
 * Next own those plugins and only layer TypeScript + turbo + prettier on top.
 *
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'turbo',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  settings: {
    // Resolve the `@/*` tsconfig path alias for import rules.
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    '.turbo/',
    'coverage/',
    '*.config.js',
    '*.config.cjs',
    '*.config.mjs',
  ],
};
