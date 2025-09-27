# BeatUI Tailwind Migration Plan

## Goals
- Align BeatUI with TailwindCSS so component styles rely on Tailwind utilities while keeping bespoke component styling minimal and maintainable.
- Produce two CSS deliverables: a standalone bundle containing only the classes BeatUI uses, and a Tailwind-ready component bundle/preset for consumers.
- Update documentation, build tooling, and examples so the Tailwind-first setup is the default experience.

## Key Deliverables
- `dist/beatui.css`: purged standalone CSS bundle generated from BeatUI sources.
- `dist/beatui-components.css` (name TBD) plus Tailwind preset/plugin exposing BeatUI tokens and layers.
- Updated style sources organized into Tailwind base/component/utility layers.
- Revised build pipeline scripts and automated checks.
- Docs site consuming the Tailwind-aware build and documenting integration paths.

## Workstreams & Tasks

### 1. Discovery & Foundation
- [x] Audit current CSS layers (`01.reset` → `06.overrides`) and generated utility classes; map every BeatUI utility to its Tailwind equivalent. _(See `docs/tailwind-audit.md` for inventory + mapping notes.)_
- [x] Document which reset rules must remain vs. covered by Tailwind preflight. _(See `docs/tailwind-audit.md` → "Reset vs Tailwind Preflight".)_
- [x] Define shared Tailwind config (theme tokens, dark mode behaviour, safelists for dynamic classes, plugin hooks). _(See `docs/tailwind-config-outline.md`.)_
- [x] Decide final distribution layout (file names, Tailwind preset/plugin exposure) and update package `exports` design doc. _(See `docs/tailwind-distribution-strategy.md`.)_

### 2. Library Styling Refactor
- [ ] Replace custom utility class usage across components with Tailwind class names or `@apply` in component styles when utilities cannot express a rule. _(Started with `bc-center` and `bc-rating-input`; continue migrating remaining components.)_
  - [x] Migrate animated toggle/flyout helpers off `.bu-toggle--*` utilities to data attributes + component-layer CSS (2025-02-12).
- [ ] Collapse former layers into Tailwind conventions: retire `01.reset`, `04.variants`, `05.utilities`; merge remaining rules into base/component/utility layers.
- [ ] Remove or rewrite style-generation scripts so they either emit Tailwind artifacts or are no longer needed.
- [ ] Add lint/test safeguards preventing reintroduction of removed utility classes (e.g. ESLint rule, smoke test).

### 3. Build & Distribution Pipeline
- [x] Update build tooling (e.g. Vite/Rollup scripts) to run Tailwind twice: once to tree-shake BeatUI usage for the standalone bundle, once to emit the component-layer CSS/preset for consumers. _(CLI path now compiles `css/beatui-components.css` during `pnpm --filter @tempots/beatui build`; current component layer mirrors legacy rules while we continue migrating individual classes.)_
- [x] Ensure both builds read from the shared Tailwind config to keep tokens aligned. _(See `packages/beatui/tailwind.config.ts` consumed by the CLI and preset.)_
- [x] Update package build outputs (`package.json` exports, declaration files) and document import paths for both consumption modes. _(See `packages/beatui/package.json` and `docs/tailwind-distribution-strategy.md`.)_
- [ ] Add CI steps validating bundle size/content (snapshot or hash check) so drift is detected early.

### 4. Documentation & Example Apps
- [ ] Refactor docs app to consume the Tailwind version (import preset, include component CSS in Tailwind pipeline).
- [ ] Update guides and migration docs describing standalone vs. Tailwind integration flows and any breaking changes.
- [ ] Provide upgrade walkthrough/examples for consumers (e.g. sample Tailwind config snippet, how to import BeatUI components).

### 5. QA, Testing & Release
- [ ] Run unit/integration tests covering styled components; supplement with visual or screenshot tests if tooling exists.
- [ ] Validate both CSS bundles manually in sandbox apps (standalone build and Tailwind consumer project).
- [ ] Finalize release notes highlighting changes, removal of legacy utilities, and adoption steps for consumers.
- [ ] Coordinate version bump and release packaging once acceptance criteria are met.

## Dependencies & Open Questions
- Confirm whether any dynamic class generation at runtime needs safelisting adjustments.
- Decide if theme tokens move into a shared design tokens source (JSON/TS) consumed by Tailwind config and component code.
- Determine how to version/manage the Tailwind preset (embedded in package vs. separate entry point).

## Tracking & Status
- Use this document to track progress; mark checkboxes as tasks complete.
- Consider adding owners or links to issues/PRs next to each task for visibility.
