# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Run all development servers (beatui lib + docs)
- `pnpm dev:docs` - Build library then watch+run docs (recommended for docs development)
- `pnpm --filter @beatui/docs dev` - Run only docs site dev server

### Building
- `pnpm build` - Build all packages using Turborepo
- `pnpm --filter @tempots/beatui build` - Build only the main library
- `pnpm --filter @tempots/beatui build:watch` - Watch mode for library builds

### Testing
- `pnpm test` - Run all tests across packages
- `pnpm test:watch` - Run tests in watch mode
- `pnpm --filter @tempots/beatui test` - Run tests for main library only
- `pnpm --filter @tempots/beatui test:watch` - Watch mode for library tests
- `pnpm --filter @tempots/beatui test -- tests/path/to/file.test.ts` - Run a single test file

### E2E Testing
- `pnpm test:e2e` - Run all e2e tests (Chromium only)
- `pnpm test:e2e:all` - Run e2e tests on all browsers
- `pnpm test:e2e:smoke` - Run smoke tests only (@smoke tag)
- `pnpm test:e2e:a11y` - Run accessibility tests only (@a11y tag)
- `pnpm test:e2e:visual` - Run visual regression tests (@visual tag)
- `pnpm test:e2e:ui` - Open Playwright UI mode for debugging
- `pnpm test:e2e:update-snapshots` - Update visual baselines

### Code Quality
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all packages with Prettier
- `pnpm typecheck` - Type check all packages

### Other
- `pnpm clean` - Clean all build artifacts

## Architecture

### Monorepo Structure
This is a Turborepo-managed monorepo with pnpm workspaces:
- `packages/beatui/` - Main UI component library (`@tempots/beatui`)
- `apps/docs/` - Documentation site (`@beatui/docs`)

### Core Dependencies
BeatUI is built on the Tempo ecosystem:
- `@tempots/dom` - Reactive DOM library with fine-grained reactivity (like Solid.js)
- `@tempots/ui` - UI utilities and helpers
- `@tempots/std` - Standard utilities

Key Tempo primitives used throughout:
- `Value<T>` - Reactive value (can be static or signal)
- `prop<T>()` - Create a reactive property (signal)
- `computedOf()` - Derive computed values from multiple signals
- `html.*` - Element factories (html.div, html.button, etc.)
- `attr.*`, `style.*`, `on.*` - Attribute, style, and event bindings
- `When()`, `Fragment()`, `Empty` - Conditional and structural helpers

### Library Entry Points
The library exports multiple entry points for optional features:
- `@tempots/beatui` - Main components (buttons, forms, layout, etc.)
- `@tempots/beatui/auth` - Authentication components
- `@tempots/beatui/json-schema` - JSON Schema form generation
- `@tempots/beatui/monaco` - Monaco editor integration
- `@tempots/beatui/markdown` - Markdown rendering
- `@tempots/beatui/prosemirror` - ProseMirror editor integration
- `@tempots/beatui/tailwind` - Tailwind CSS preset and utilities

### CSS Architecture
BeatUI uses a **layered CSS architecture** with strict ordering in `src/styles/layers/`:

1. `01.reset/` - CSS reset
2. `02.base/` - Design tokens and foundational styles
3. `03.components/` - Component styles (prefixed with `bc-`)

### Design Token System
- Design tokens are defined in TypeScript files (`src/tokens/`)
- Automatically generate CSS variables via Vite plugins
- Theme system supports light/dark modes with semantic color tokens
- CSS variables follow naming: `--color-primary-500`, `--spacing-lg`, etc.

### Component Structure
Components follow this pattern:
- TypeScript components using `@tempots/dom` reactive primitives
- Located in `src/components/` under category folders (`button/`, `form/`, `layout/`, etc.)
- Styles in `src/styles/layers/03.components/` using BEM-like naming (`bc-button`)
- Each component exports both the component function and any related types
- Components accept options object + children: `Button({ size: 'md' }, 'Click me')`

### Form System
Sophisticated form handling with:
- Schema validation support (Zod integration)
- Controller pattern for form state management
- Separate input components and form controls
- Type-safe form handling with validation

### Theme Integration
- Theme provider manages light/dark appearance
- Uses `localStorage` for preference persistence
- Body class switching (`b-light`/`b-dark`) for theme application
- CSS variables automatically adjust based on theme

## Key Patterns

### Component Development
When creating new components:
1. Create TypeScript component file in `src/components/<category>/`
2. Add corresponding CSS file in `src/styles/layers/03.components/`
3. Use CSS custom properties for theming (leverage design tokens)
4. Export from category `index.ts` and main `src/index.ts`
5. Follow existing naming conventions (`bc-` prefix for component CSS classes)

### Testing
- Tests use Vitest with jsdom environment
- Setup file: `tests/setup.ts`
- Focus on unit tests for components and utilities
- Use `@testing-library/dom` for DOM testing utilities

### Release Process
The package uses automated release scripts:
- `pnpm release:patch/minor/major` - Standard releases
- `pnpm release:prerelease` - Pre-release versions
- Scripts handle build, test, version bump, publish, and git commit

### Vite Configuration
The build uses a custom Vite plugin (`scripts/vite-plugins.ts`) that generates CSS variables from design token TypeScript files at build time. Token definitions in `src/tokens/` are converted to CSS custom properties in `src/styles/base/`.

## Active Technologies
- TypeScript 5.9+ (ES2020 target) (001-json-structure-forms)
- N/A (client-side form state only) (001-json-structure-forms)
- TypeScript 5.x (matching existing codebase) + @playwright/test ^1.57.0, @axe-core/playwright ^4.x (002-e2e-best-practices)
- File-based (visual baselines in repository, test artifacts in CI) (002-e2e-best-practices)
- TypeScript 5.9+ (ES2020 target) + `lexical` v0.40+, `@lexical/*` packages, `@tempots/dom` ^35.1.0, `@tempots/ui` ^14.1.0, `@tempots/std` ~0.25.2 (003-lexical-editor-integration)
- N/A (client-side editor state only) (003-lexical-editor-integration)
- TypeScript 5.9+ (ES2020 target), matching existing BeatUI codebase (004-llm-chat-components)
- N/A (client-side component state only; consumers manage persistence) (004-llm-chat-components)

## Recent Changes
- 001-json-structure-forms: Added TypeScript 5.9+ (ES2020 target)
