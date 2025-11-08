import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import tempots from '@tempots/eslint-plugin'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  tempots.configs.recommended,
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
]
