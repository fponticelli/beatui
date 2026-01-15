# Implementation Plan: E2E Testing Best Practices

**Branch**: `002-e2e-best-practices` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-e2e-best-practices/spec.md`

## Summary

Enhance the existing Playwright e2e test suite (157 tests across 56 files in 8 category directories) with industry best practices: accessibility testing via @axe-core/playwright, visual regression using Playwright's built-in screenshot comparison, cross-browser testing (Chromium/Firefox/WebKit), GitHub Actions CI/CD integration, Page Object Model architecture, test tagging for selective execution, enhanced debugging artifacts, and reusable fixtures.

## Technical Context

**Language/Version**: TypeScript 5.x (matching existing codebase)
**Primary Dependencies**: @playwright/test ^1.57.0, @axe-core/playwright ^4.x
**Storage**: File-based (visual baselines in repository, test artifacts in CI)
**Testing**: Playwright Test runner with vitest for unit tests
**Target Platform**: Node.js (CI runners: ubuntu-latest on GitHub Actions)
**Project Type**: Monorepo - enhancing apps/docs/e2e
**Performance Goals**: Full suite <10 min, smoke tests <2 min
**Constraints**: CI time budget, visual baseline storage, cross-platform consistency
**Scale/Scope**: 56 component pages, 157 existing tests, 3 browser engines

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: Constitution not configured for this project (template placeholders present).
No gates to enforce. Proceeding with standard software engineering best practices:

- [x] Tests accompany all new code
- [x] Changes are backward-compatible with existing tests
- [x] No breaking changes to existing test workflows
- [x] Clear documentation for new patterns

## Project Structure

### Documentation (this feature)

```text
specs/002-e2e-best-practices/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (TypeScript interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/docs/
├── e2e/
│   ├── fixtures/           # NEW: Custom Playwright fixtures
│   │   └── index.ts
│   ├── page-objects/       # NEW: Page Object Model classes
│   │   ├── base.page.ts
│   │   ├── components/
│   │   ├── forms/
│   │   ├── navigation/
│   │   ├── overlay/
│   │   ├── data/
│   │   ├── editors/
│   │   ├── json-schema/
│   │   └── layout/
│   ├── components/         # EXISTING: Component tests (refactored)
│   ├── forms/              # EXISTING: Form tests (refactored)
│   ├── navigation/         # EXISTING: Navigation tests (refactored)
│   ├── overlay/            # EXISTING: Overlay tests (refactored)
│   ├── data/               # EXISTING: Data tests (refactored)
│   ├── editors/            # EXISTING: Editor tests (refactored)
│   ├── json-schema/        # EXISTING: JSON schema tests (refactored)
│   ├── layout/             # EXISTING: Layout tests (refactored)
│   └── visual-baselines/   # NEW: Screenshot baselines
├── playwright.config.ts    # MODIFIED: Enhanced configuration
└── package.json            # MODIFIED: New dependencies

.github/
└── workflows/
    └── e2e.yml             # NEW: CI workflow
```

**Structure Decision**: Enhance existing monorepo structure in apps/docs/e2e. New directories for page objects, fixtures, and visual baselines. GitHub Actions workflow at repository root.

## Complexity Tracking

No constitution violations to justify. Implementation follows standard Playwright patterns.
