# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Run all development servers (beatui lib + docs)
- `pnpm --filter @beatui/docs dev` - Run only docs site dev server

### Building
- `pnpm build` - Build all packages using Turborepo
- `pnpm --filter @tempots/beatui build` - Build only the main library

### Testing
- `pnpm test` - Run all tests across packages
- `pnpm test:watch` - Run tests in watch mode
- `pnpm --filter @tempots/beatui test` - Run tests for main library only
- `pnpm --filter @tempots/beatui test:watch` - Watch mode for library tests

### Code Quality
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all packages with Prettier

### Other
- `pnpm clean` - Clean all build artifacts

## Architecture

### Monorepo Structure
This is a Turborepo-managed monorepo with pnpm workspaces:
- `packages/beatui/` - Main UI component library (`@tempots/beatui`)
- `apps/docs/` - Documentation site (`@beatui/docs`)

### Core Dependencies
BeatUI is built on the Tempo ecosystem:
- `@tempots/dom` - Reactive DOM library (like Solid.js)
- `@tempots/ui` - UI utilities and helpers
- `@tempots/std` - Standard utilities

### CSS Architecture
BeatUI uses a **layered CSS architecture** with strict ordering:

1. `@layer base` - Reset + foundational styles and design tokens
2. `@layer components` - Component styles and modifiers (prefixed with `bc-`)
3. `@layer utilities` - Utility classes (prefixed with `bu-`)

### Design Token System
- Design tokens are defined in TypeScript files (`src/tokens/`)
- Automatically generate CSS variables via Vite plugins
- Theme system supports light/dark modes with semantic color tokens
- CSS variables follow naming: `--color-primary-500`, `--spacing-lg`, etc.

### Component Structure
Components follow this pattern:
- TypeScript components using `@tempots/dom` reactive primitives
- Exported from category folders (`button/`, `form/`, `layout/`, etc.)
- Styles in corresponding CSS files using BEM-like naming (`bc-button`)
- Each component exports both the component and any related types

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
1. Create TypeScript component file in appropriate category folder
2. Add corresponding CSS file in `styles/layers/03.components/`
3. Use CSS custom properties for theming
4. Export from category `index.ts` and main `src/index.ts`
5. Follow existing naming conventions (`bc-` for component styles)

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
Custom Vite plugins generate:
- CSS variables from design token TypeScript files
- Background utility classes
- Breakpoint utility classes

All plugins are defined in `scripts/vite-plugins.ts`