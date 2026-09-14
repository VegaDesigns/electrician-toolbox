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
  {
    files: ['app/**/*.{ts,tsx}', 'src/screens/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    ignores: ['src/components/FeedbackPressable.tsx'],
    rules: {
      'no-restricted-imports': ['error', { paths: [{
        name: 'react-native', importNames: ['Pressable'],
        message: 'Use FeedbackPressable so controls share theme-aware press feedback. Modal scrims can opt out with feedback="none".',
      }] }],
    },
  },
]);
