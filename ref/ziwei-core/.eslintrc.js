module.exports = {
  extends: ['../../.eslintrc.strict.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Package-specific rules for ziwei-core
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'no-console': 'warn',
    'complexity': ['warn', { max: 15 }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-magic-numbers': ['warn', { 
      ignore: [0, 1, 2, 10, 12, 24, 60, -1],
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true
    }],
    // Allow Chinese comments and variable names for astrology context
    'id-match': 'off',
    'no-irregular-whitespace': ['error', { skipComments: true }]
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-magic-numbers': 'off',
        'no-console': 'off',
        'complexity': 'off'
      }
    },
    {
      files: ['src/constants.ts', 'src/constants/**/*'],
      rules: {
        '@typescript-eslint/no-magic-numbers': 'off',
        'max-lines': 'off'
      }
    }
  ]
};