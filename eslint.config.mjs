// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    ignores: [
      '**/*.{d.ts,d.mts}',
      '**/.storybook/main.ts',
      'dist/**',
      'storybook-static/**',
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  storybook.configs['flat/recommended']
)
