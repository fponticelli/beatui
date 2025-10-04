# Tailwind Preset Usage

Use the BeatUI preset to register core/semantic tokens with Tailwind v4:

```ts
import { defineConfig } from 'tailwindcss'
import { createBeatuiPreset } from '@tempots/beatui/tailwind/preset'

export default defineConfig({
  presets: [
    createBeatuiPreset({
      semanticColors: {
        primary: 'emerald',
        secondary: 'slate',
      },
      includeCoreTokens: true,
      includeSemanticTokens: true,
      extendTheme: true,
    }),
  ],
})
```

## Options

- `semanticColors`: remap BeatUI semantic names to other Tailwind palette names (`primary`, `secondary`, `success`, `warning`, `danger`, `info`, `base`).
- `fontFamilies`: override `--font-family-*` tokens (e.g., `{ sans: ['Inter', 'system-ui'] }`).
- `includeCoreTokens` (default `true`): register spacing, typography, breakpoint, radius, shadow, etc. variables.
- `includeSemanticTokens` (default `true`): register semantic color aliases (e.g., `--color-primary-500`).
- `extendTheme` (default `true`): expose semantic palettes to Tailwind utilities (e.g., `text-primary-500`).

The preset also registers custom variants:

- `beatui-dark`
- `beatui-light`
- `beatui-rtl`
- `beatui-ltr`

These variants target BeatUI’s `.b-dark`, `.b-light`, `.b-rtl`, and `.b-ltr` wrappers.
