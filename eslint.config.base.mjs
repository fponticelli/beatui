import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import tempots from '@tempots/eslint-plugin'

/**
 * Creates a shared ESLint configuration for the BeatUI monorepo.
 *
 * @param {string} tsconfigRootDir - The root directory for TypeScript config resolution
 * @param {object} options - Additional configuration options
 * @param {boolean} options.hasScripts - Whether the project has a scripts directory
 * @param {boolean} options.hasTests - Whether the project has tests
 * @param {boolean} options.hasSrc - Whether the project has a src directory
 * @returns {Array} ESLint flat config array
 */
export function createESLintConfig(tsconfigRootDir, options = {}) {
  const { hasScripts = false, hasTests = false, hasSrc = false } = options

  const config = [
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
          tsconfigRootDir,
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

  // Node.js scripts configuration
  if (hasScripts) {
    config.push({
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
    })
  }

  // Test files configuration
  if (hasTests) {
    config.push({
      files: ['tests/**/*.test.ts'],
      rules: {
        'no-empty': 'warn',
        'no-async-promise-executor': 'warn',
        'tempots/require-async-signal-disposal': 'off',
      },
    })
  }

  // Source files - stricter rules
  if (hasSrc) {
    config.push({
      files: ['src/**/*.ts'],
      rules: {
        'no-empty': ['error', { allowEmptyCatch: true }],
        'no-case-declarations': 'off', // Allow lexical declarations in case blocks
      },
    })
  }

  return config
}
