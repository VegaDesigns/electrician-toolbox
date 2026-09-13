// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['app/**/*.{ts,tsx}', 'src/screens/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', {
        selector: 'Literal[value=/^(#[0-9a-fA-F]{3,8}|rgba?\\()/]',
        message: 'Use a semantic theme color. Physical reference colors belong in ReferenceColors or the domain catalog.',
      }],
    },
  },
]);
