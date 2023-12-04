module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'no-restricted-globals': 'off',
    'no-unused-expressions': 'off',
    'eol-last': 'off',
    'consistent-return': 'off',
    'max-len': 'off',
    'no-param-reassign': 'off',
    'import/extensions': 'off',
    'spaced-comment': 'off',
    'linebreak-style': 'off',
    'no-plusplus': 'off',
    'comma-dangle': [
      'error',
      {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'never'
      }
    ],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    quotes: ['error', 'single', { avoidEscape: true }]
  }
};
