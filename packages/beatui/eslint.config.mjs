import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import tempots from '@tempots/eslint-plugin'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  tempots.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [
      '**/*.{d.ts,d.mts}',
      'dist/**',
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Node.js scripts configuration
  {
    files: ['scripts/**/*.{js,mjs,ts}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-empty': 'warn',
    },
  },
  // Test files configuration
  {
    files: ['tests/**/*.test.ts'],
    rules: {
      'no-empty': 'warn',
      'no-async-promise-executor': 'warn',
      'tempots/require-async-signal-disposal': 'off',
    },
  },
  // Source files - stricter rules
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-case-declarations': 'off', // Allow lexical declarations in case blocks
    },
  },
]
