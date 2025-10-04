# BeatUI Tailwind Vite Plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { beatuiTailwindPlugin } from '@tempots/beatui/tailwind/vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    beatuiTailwindPlugin({
      semanticColors: { primary: 'emerald' },
      semanticFonts: { heading: 'var(--font-family-serif)' },
      semanticRadii: { control: '8px', surface: 'var(--radius-xl)' },
      fontFamilies: { sans: ['Inter', 'system-ui'] },
      darkClass: 'dark',
      rtlAttribute: 'dir',
    }),
  ],
})
```

## Options

- `semanticColors`: forwarded to `createBeatuiPreset` to remap semantic color tokens.
- `semanticFonts`: override semantic font aliases such as `--font-heading`, `--font-body`, `--font-prose`.
- `semanticRadii`: override semantic radius aliases (`--radius-control`, `--radius-surface`, `--radius-popover`, etc.).
- `fontFamilies`: forward overrides for BeatUI font family tokens (e.g., `{ sans: 'Inter, system-ui' }`).
- `includeCoreTokens`, `includeSemanticTokens`, `extendTheme`: same meaning as preset options.
- `injectCss` (default `true`): when `false` the plugin will not inject the Tailwind CSS bundle; you must import `@tempots/beatui/tailwind.css` manually.
- `tailwindConfigPath`: specify when your Tailwind config file lives outside the project root.
- `darkClass` (default `dark`): Tailwind class whose presence on `<html>` syncs `.b-dark` / `.b-light` on `<body>`.
- `rtlAttribute` (default `dir`) & `rtlValue` (default `rtl`): attribute/value pair that toggles `.b-rtl` / `.b-ltr` on `<body>`.

The plugin injects the BeatUI Tailwind CSS bundle into the HTML during dev/build, attempts to register the Tailwind PostCSS plugin with the BeatUI preset automatically, and exposes the generated preset via `import.meta.env.BEATUI_TAILWIND_PRESET` for advanced tooling.
