# BeatUI ↔ Tailwind v4 Integration Plan

## Objectives
- Deliver two CSS entry points so client apps can consume BeatUI either with or without Tailwind v4.
- Eliminate duplicated base tokens/resets when Tailwind is present while keeping BeatUI semantic aliases available.
- Align BeatUI defaults (dark mode, RTL, animations, lists) with Tailwind conventions to minimise custom overrides.
- Ship a Vite-first integration story (plugin + docs) that wires BeatUI into a Tailwind-aware build in a single step.

## Deliverables
- `styles.css`: includes BeatUI core tokens, reset, semantic aliases, and component layers for non-Tailwind projects.
- `tailwind.css`: includes only BeatUI semantic aliases + component layers and assumes Tailwind v4 preflight/tokens.
- `packages/beatui/vite-plugin-tailwind.ts`: Vite plugin that injects BeatUI Tailwind preset/config + CSS entry wires.
- Tailwind preset (consumed by the plugin) that registers BeatUI tokens via `@theme` / `addBase`, exposes semantic colors.
- Updated component CSS relying on Tailwind utilities (e.g. `animate-*`, `list-*`, `pl-*`) with fallbacks for standalone build only when necessary.
- Documentation covering installation flows, configuration points, and migration guidance.
- Tests/CI checks verifying both entry points compile and produce expected tokens.

## Task Breakdown

### 1. CSS Architecture Restructure
- [x] Extract shared core tokens to `packages/beatui/src/styles/base/tokens-core.css` (raw palette, spacing, typography, animations).
- [x] Move BeatUI semantic aliases to `tokens-semantic.css` (primary/secondary/success/etc.).
- [x] Split reset styles into `reset.css` and `reset-tailwind.css` (the latter keeps only BeatUI-specific additions).
- [x] Update existing layered imports to consume the new partials; ensure component layer order remains stable.
- [x] Remove bespoke keyframes (`bc-spin`) and rely on Tailwind animations; keep standalone fallbacks via `@supports not` if required.
- [x] Drop custom list-style defaults from `.b-ltr/.b-rtl`; plan Tailwind utility usage instead.

### 2. Build Outputs
- [x] Create `styles.css` bundle (tokens-core → tokens-semantic → reset-standalone → focus/a11y → components).
- [x] Create `tailwind.css` bundle (tokens-semantic → focus/a11y → components) without re-importing Tailwind tokens/reset.
- [x] Update `base.ts` (and any other CSS entry exports) to re-export both bundles with clear naming.
- [x] Ensure Rollup/Vite build config emits both CSS files under predictable paths (e.g. `dist/styles.css` & `dist/tailwind.css`).
- [ ] Add bundle-size sanity checks to keep `tailwind.css` lean.

### 3. Tailwind Integration Preset & Vite Plugin
- [x] Capture preset scaffolding strategy and integration notes (see `docs/tailwind-preset-notes.md`).
- [ ] Implement a Tailwind v4 preset exposing BeatUI tokens via `@theme` and semantic aliases via `addBase`/`theme.extend`.
- [ ] Provide configuration hooks so client apps can override semantic mappings (primary/secondary/etc.).
- [ ] Build a Vite plugin that: (a) registers the Tailwind preset, (b) injects `import 'beatui/tailwind.css'`, (c) optionally wires `.b-dark` ⇄ `.dark` class mappings.
- [ ] Offer API surface for opting into dark/RTL selector alignment (default `.dark`, `[dir='rtl']`).
- [ ] Document how to use the preset without the Vite plugin for advanced setups.

### 4. Component CSS Audit
- [ ] Inventory BeatUI components using custom spacing/list/animation rules; replace with Tailwind utilities (`@apply` or class usage) where practical.
- [x] For standalone build, generate minimal fallback utilities (e.g. `.animate-spin`) within a dedicated `@layer utilities` that’s excluded from the Tailwind bundle.
- [ ] Verify dropdown/other bespoke animations remain intact or convert to Tailwind-friendly definitions.
- [ ] Ensure no component relies on `.b-*` list styles; update templates to apply explicit classes if needed.
- [ ] Run visual checks in docs for dark/RTL/Tailwind combinations after refactor.

### 5. Documentation & Examples
- [ ] Update BeatUI docs with two installation guides (standalone vs Tailwind) and plugin instructions.
- [ ] Provide example Vite + Tailwind v4 project demonstrating BeatUI usage with semantic color overrides.
- [ ] Document configuration API for primary/secondary/warning overrides, including defaults and merge behaviour.
- [ ] Add migration notes summarising breaking changes (removed `bc-spin`, `.b-ltr` list defaults, etc.).

### 6. Testing & Validation
- [ ] Add build tests to CI that compile both CSS bundles and diff expected token outputs.
- [ ] Lint CSS for duplicate token definitions; ensure Tailwind bundle omits core tokens/reset.
- [ ] Create integration test (Playwright or Vitest + happy-dom) that mounts a Tailwind-powered BeatUI form verifying dark/RTL modes.
- [ ] Validate that the Vite plugin cooperates with existing docs app build.

## Risks & Mitigations
- **Token drift between Tailwind and BeatUI**: guard with snapshot tests on the preset output and document upgrade procedure when Tailwind changes defaults.
- **Client override complexity**: design a clear API (e.g. `semanticColors: { primary: 'blue' }`) and provide TypeScript types.
- **Standalone fallback maintenance**: keep utility fallbacks minimal and covered by tests/example app.

## Outstanding Questions
- Do we need to publish the Tailwind preset as a separate package for tree-shaking or keep it internal to BeatUI?
- How should we version/control breaking changes to existing consumers during rollout (beta tag vs major release)?
- Are there additional semantic groups (info, accent, neutral) clients expect to configure beyond primary/secondary/warning/success/error?
