/**
 * ESLint config for internal React libraries (packages/ui).
 * Like the Next config but without Next.js-specific rules.
 *
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: [
    './base.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  plugins: ['react', 'react-hooks', 'jsx-a11y'],
  env: {
    browser: true,
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
