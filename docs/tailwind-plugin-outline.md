# Tailwind Vite Plugin Outline

## Responsibilities
- Detect Tailwind usage in the consuming project (look for `tailwind.config.{ts,js}` or a `tailwind` entry in user config).
- Auto-register `createBeatuiPreset()` with optional overrides passed via plugin options.
- Inject the lean CSS bundle: `import '@tempots/beatui/tailwind.css'` (tree-shakeable ESM import).
- Provide configuration knobs for:
  - `darkClass` (map BeatUI `.b-dark` to Tailwind `.dark` and vice versa)
  - `rtlClass` (`.b-rtl` ↔ `[dir='rtl']`)
  - semantic color overrides (forwarded to `createBeatuiPreset`)
  - opting out of automatic CSS injection
- Expose helper for bundler config to ensure CSS import executes only once (dedupe).

## Plugin Signature
```ts
interface BeatuiTailwindPluginOptions {
  semanticColors?: SemanticColorOverrides
  injectCss?: boolean
  darkClass?: string
  rtlSelector?: string
}

export function beatuiTailwind(options?: BeatuiTailwindPluginOptions): Plugin
```

## Implementation Steps
1. Resolve project root; check for Tailwind config. Warn if missing.
2. During `config` hook, merge BeatUI preset into user Tailwind config (`config.presets = [...]`).
3. During `transformIndexHtml` / `load` hook, inject CSS import when `injectCss !== false`.
4. Provide virtual module (e.g., `virtual:beatui-tailwind.css`) that re-exports the bundle to avoid double inclusion.
5. Surface warnings when BeatUI standalone CSS is imported alongside the Tailwind bundle.

## Testing Plan
- Unit test plugin option merging and Tailwind preset injection (Vitest).
- Integration test via docs app ensuring `.beatui-dark` variant works when plugin enabled.
- Snapshot plugin output to verify CSS is only injected once.
