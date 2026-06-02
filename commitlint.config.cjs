/** @type {import("@commitlint/types").UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      1,
      'always',
      [
        'repo',
        'web',
        'api',
        'ui',
        'types',
        'validation',
        'sdk',
        'config',
        'infra',
        'db',
        'ci',
        'deps',
      ],
    ],
  },
};
