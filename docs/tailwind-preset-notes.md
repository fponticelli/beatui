# Tailwind Preset Scaffolding Notes

## Goals
- Expose BeatUI design tokens to Tailwind v4 builds without duplicating the generated CSS bundles.
- Provide semantic aliases (primary, secondary, etc.) that map to Tailwind colors while remaining overridable per project.
- Keep the Tailwind-facing CSS lean: semantic aliases should be injected via `addBase`/`@theme` so consumers get variables without shipping the entire standalone reset.

## Tailwind v4 Integration Hooks
- **`@theme` blocks** can register CSS custom properties at build time. We can generate one block per token group (colors, spacing, radii, etc.).
- **Tailwind plugin API** (`tailwindcss/plugin`) still exposes `addBase`, `addUtilities`, etc. Use `addBase` for semantic color aliases (e.g., `--color-primary-500`).
- Tailwind v4 exposes `defineConfig` in userland; our preset can export an object that users spread into their `tailwind.config.ts` or is auto-registered by the BeatUI Vite plugin.

## Proposed Preset Shape
```ts
import plugin from 'tailwindcss/plugin'
import { generateCoreTokenVariables, generateSemanticTokenVariables } from '@tempots/beatui/tokens'

export const beatuiPreset = {
  theme: {
    extend: {
      // optionally expose semantic aliases for Tailwind color utilities
      colors: {
        primary: 'var(--color-primary-500)',
        // ...
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root': generateCoreTokenVariables(),
      })
      addBase({
        ':root': generateSemanticTokenVariables(),
      })
    }),
  ],
}
```

### Considerations
- The above needs stringification for CSS values; `generate*TokenVariables()` already returns `{ '--token': 'value' }` so they can be passed directly.
- Tailwind’s preset should not register resets; BeatUI’s `tailwind.css` handles only semantic helpers so we rely on Tailwind’s native preflight.
- Provide a configuration entry (e.g., `beatuiPreset({ colors: { primary: 'blue', danger: 'rose' } })`) to remap semantic aliases at runtime.
- Ensure the preset sets `darkMode` to `'class'` and optionally configures `darkClass` mapping `.b-dark`⇄`.dark` when the BeatUI Vite plugin is used.

## Next Steps
1. Implement `packages/beatui/src/tailwind/preset.ts` exporting `beatuiPreset` plus a factory for overrides.
2. Wire preset into `tailwind.css` consumption path (document usage, integrate with upcoming Vite plugin).
3. Add unit/integration tests to ensure preset outputs expected base variables and merges overrides correctly.

