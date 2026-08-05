export default [
  {
    files: ['**/*.js'],
    ignores: ['output-data/**', 'source-data/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        console: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        Intl: 'readonly',
        window: 'readonly'
      }
    },
    rules: {
      curly: 'error',
      eqeqeq: 'error',
      'no-constant-condition': 'error',
      'no-extra-semi': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always']
    }
  }
];
