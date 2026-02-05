# Implementation Plan: Lexical Editor Integration

**Branch**: `003-lexical-editor-integration` | **Date**: 2026-02-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-lexical-editor-integration/spec.md`

## Summary

Full integration of Facebook's Lexical editor framework (v0.40+) into BeatUI as a new `@tempots/beatui/lexical` entry point. The integration wraps Lexical's vanilla JS API (no React dependency) into BeatUI's reactive component system (`@tempots/dom`) with three preset modes (Bare, Docked, Contextual), full plugin coverage of 24 official Lexical packages, multi-format I/O (Markdown, HTML, JSON), form system integration, WCAG 2.1 AA accessibility, localization across 19 locales, and theme-aware styling.

## Technical Context

**Language/Version**: TypeScript 5.9+ (ES2020 target)
**Primary Dependencies**: `lexical` v0.40+, `@lexical/*` packages, `@tempots/dom` ^35.1.0, `@tempots/ui` ^14.1.0, `@tempots/std` ~0.25.2
**Storage**: N/A (client-side editor state only)
**Testing**: Vitest 4.0+ with jsdom environment
**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge - latest 2 versions). No IE11 or legacy mobile.
**Project Type**: Library (monorepo package within `packages/beatui/`)
**Performance Goals**: Floating toolbar appears within 150ms of text selection; lazy-loaded (zero Lexical code in main bundle until mount)
**Constraints**: Tree-shakeable entry points; all Lexical code isolated to `@tempots/beatui/lexical` export; WCAG 2.1 AA compliance for all UI controls
**Scale/Scope**: 24 official Lexical packages wrapped; 61 functional requirements; 19 locale translations; 3 editor presets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is not yet customized (template placeholders remain). No gates to enforce. Proceeding without violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-lexical-editor-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (TypeScript interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
packages/beatui/
├── src/
│   ├── lexical/                         # Entry point module (like src/monaco/)
│   │   ├── index.ts                     # Re-exports all public API
│   │   ├── types.ts                     # Shared types and interfaces
│   │   ├── lazy-loader.ts               # Dynamic import + caching for Lexical core
│   │   ├── styles.ts                    # CSS string for inline injection
│   │   ├── styles-url.ts               # CSS URL export for LinkPortal
│   │   ├── nodes.ts                     # Node registration helpers
│   │   ├── plugins/                     # Plugin wrappers (one per @lexical/* package)
│   │   │   ├── rich-text.ts
│   │   │   ├── plain-text.ts
│   │   │   ├── history.ts
│   │   │   ├── list.ts
│   │   │   ├── table.ts
│   │   │   ├── link.ts
│   │   │   ├── code.ts
│   │   │   ├── code-shiki.ts
│   │   │   ├── hashtag.ts
│   │   │   ├── mark.ts
│   │   │   ├── overflow.ts
│   │   │   ├── clipboard.ts
│   │   │   ├── dragon.ts
│   │   │   ├── auto-link.ts
│   │   │   ├── markdown-io.ts
│   │   │   ├── html-io.ts
│   │   │   ├── file-io.ts
│   │   │   ├── selection.ts
│   │   │   ├── text.ts
│   │   │   ├── offset.ts
│   │   │   ├── yjs.ts
│   │   │   ├── slash-commands.ts
│   │   │   └── index.ts
│   │   ├── commands/                    # Command definitions
│   │   │   └── index.ts
│   │   └── headless/                    # Server-side editor
│   │       └── index.ts
│   ├── components/
│   │   └── lexical/                     # UI components (like components/monaco/)
│   │       ├── lexical-editor-input.ts  # Form-integrated editor (InputOptions<T>)
│   │       ├── bare-editor.ts           # Bare preset component
│   │       ├── docked-editor.ts         # Docked preset component
│   │       ├── contextual-editor.ts     # Contextual preset component
│   │       ├── toolbar/                 # Docked toolbar components
│   │       │   ├── lexical-toolbar.ts
│   │       │   ├── toolbar-group.ts
│   │       │   ├── toolbar-button.ts
│   │       │   └── index.ts
│   │       ├── floating/                # Contextual floating UI
│   │       │   ├── floating-toolbar.ts
│   │       │   ├── slash-command-palette.ts
│   │       │   └── index.ts
│   │       ├── table/                   # Table-specific UI
│   │       │   ├── table-controls.ts
│   │       │   └── index.ts
│   │       ├── code/                    # Code block UI
│   │       │   ├── language-selector.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   ├── lexical-i18n/                    # Localization (like beatui-i18n/)
│   │   ├── index.ts                     # LexicalI18n provider
│   │   ├── messages.ts                  # Default English messages
│   │   └── locales/                     # 19 locale files
│   │       ├── en.ts
│   │       ├── es.ts
│   │       ├── fr.ts
│   │       ├── de.ts
│   │       ├── it.ts
│   │       ├── pt.ts
│   │       ├── ja.ts
│   │       ├── zh.ts
│   │       ├── ko.ts
│   │       ├── ru.ts
│   │       ├── ar.ts
│   │       ├── nl.ts
│   │       ├── pl.ts
│   │       ├── tr.ts
│   │       ├── vi.ts
│   │       ├── hi.ts
│   │       ├── fa.ts
│   │       ├── he.ts
│   │       └── ur.ts
│   └── styles/
│       └── layers/
│           └── 03.components/
│               ├── _lexical-editor.css   # Editor surface styles
│               ├── _lexical-toolbar.css  # Docked toolbar styles
│               ├── _lexical-floating.css # Floating toolbar + command palette
│               ├── _lexical-table.css    # Table editing styles
│               └── _lexical-code.css     # Code block + highlighting
├── tests/
│   └── lexical/
│       ├── bare-editor.test.ts
│       ├── docked-editor.test.ts
│       ├── contextual-editor.test.ts
│       ├── plugins/
│       │   ├── rich-text.test.ts
│       │   ├── history.test.ts
│       │   ├── list.test.ts
│       │   ├── table.test.ts
│       │   ├── code.test.ts
│       │   ├── link.test.ts
│       │   ├── hashtag.test.ts
│       │   ├── mark.test.ts
│       │   ├── overflow.test.ts
│       │   ├── slash-commands.test.ts
│       │   ├── markdown-io.test.ts
│       │   ├── html-io.test.ts
│       │   └── file-io.test.ts
│       ├── toolbar.test.ts
│       ├── floating-toolbar.test.ts
│       ├── slash-command-palette.test.ts
│       ├── form-integration.test.ts
│       ├── theme-integration.test.ts
│       ├── i18n.test.ts
│       └── a11y.test.ts
└── package.json                         # Updated with lexical entry point + deps
```

**Structure Decision**: Follows the existing pattern established by Monaco and ProseMirror integrations: entry point module in `src/lexical/`, UI components in `src/components/lexical/`, i18n in `src/lexical-i18n/`, CSS in `src/styles/layers/03.components/`. The `@tempots/beatui/lexical` export maps to `src/lexical/index.ts` which re-exports the public API.

## Complexity Tracking

No constitution violations to justify (constitution is unconfigured).
