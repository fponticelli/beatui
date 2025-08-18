import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  ...tseslint.configs.recommended,
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
  }
)
