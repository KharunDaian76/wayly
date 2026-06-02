/**
 * ESLint config for the Next.js frontend (apps/web).
 *
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: [
    './base.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'next/core-web-vitals',
    'prettier',
  ],
  plugins: ['react', 'react-hooks', 'jsx-a11y'],
  env: {
    browser: true,
    node: true,
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
