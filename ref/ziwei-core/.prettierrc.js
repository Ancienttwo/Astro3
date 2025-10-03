module.exports = {
  ...require('../../../.prettierrc.js'),
  // Package-specific Prettier overrides for ziwei-core
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  // Support for Chinese characters in comments
  proseWrap: 'preserve'
};