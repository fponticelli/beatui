# Tasks: Lexical Editor Integration

**Input**: Design documents from `/specs/003-lexical-editor-integration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Test tasks are included per the plan structure (tests/ directory is defined in plan.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Library package**: `packages/beatui/src/` for source, `packages/beatui/tests/` for tests
- Paths use the structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create project structure, configure build entry points

- [x] T001 Install Lexical core and all official plugin packages as dependencies in `packages/beatui/package.json`
- [x] T002 Add `lexical` entry point to Vite build config in `packages/beatui/vite.config.ts` (add `lexical: resolve(__dirname, 'src/lexical/index.ts')` to `build.lib.entry`)
- [x] T003 Add `"./lexical"` export mapping to `packages/beatui/package.json` exports field (types, import, require, default)
- [x] T004 Add `"./lexical.css"` CSS export mapping to `packages/beatui/package.json` exports field
- [x] T005 Update `sideEffects` array in `packages/beatui/package.json` to include `src/lexical/index.ts`
- [x] T006 Update CSS entry point builder `packages/beatui/scripts/build-css-entries.mjs` to handle `lexical.css`
- [x] T007 [P] Create directory structure for `packages/beatui/src/lexical/` with empty `index.ts`
- [x] T008 [P] Create directory structure for `packages/beatui/src/components/lexical/` with empty `index.ts`
- [x] T009 [P] Create directory structure for `packages/beatui/src/lexical-i18n/` with empty `index.ts`
- [x] T010 [P] Create directory structure for `packages/beatui/tests/lexical/` and `packages/beatui/tests/lexical/plugins/`

**Checkpoint**: Build toolchain is configured. `pnpm build` succeeds with the new empty lexical entry point.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, lazy loader, plugin system, and shared utilities that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Define shared TypeScript types and interfaces in `packages/beatui/src/lexical/types.ts` (EditorPreset, PluginConfig, ContentFormatType, LexicalEditorBaseOptions, SlashCommandDefinition, ToolbarConfig, MarkMetadata, CollaborationConfig per contracts/types.ts). Ensure `@lexical/utils` is available as an internal dependency for plugin wrappers that need it (e.g., mergeRegister, $getNearestNodeOfType).
- [x] T012 Implement lazy loader with caching in `packages/beatui/src/lexical/lazy-loader.ts` (dynamic import of `lexical`, `createEditor`, cache pattern matching Monaco's `loadMonacoCore`)
- [x] T013 Implement node registration helper in `packages/beatui/src/lexical/nodes.ts` (function that computes the node list from a PluginConfig, mapping enabled plugins to their required node classes)
- [x] T014 [P] Implement Lexical command definitions in `packages/beatui/src/lexical/commands/index.ts` (re-export core Lexical commands + define custom BeatUI commands for slash-commands, format toggling)
- [x] T015 [P] Create base CSS for editor surface in `packages/beatui/src/styles/layers/03.components/_lexical-editor.css` (contenteditable styles, focus ring, placeholder, light/dark theme variables using BeatUI design tokens)
- [x] T016 Implement CSS inline injection in `packages/beatui/src/lexical/styles.ts` and `packages/beatui/src/lexical/styles-url.ts` (import CSS with `?inline`, export URL for LinkPortal, matching Monaco pattern)
- [x] T017 [P] Implement rich-text plugin wrapper in `packages/beatui/src/lexical/plugins/rich-text.ts` (wraps `registerRichText`, registers HeadingNode + QuoteNode, returns unsubscribe)
- [x] T018 [P] Implement plain-text plugin wrapper in `packages/beatui/src/lexical/plugins/plain-text.ts` (wraps `registerPlainText`, returns unsubscribe)
- [x] T019 [P] Implement history plugin wrapper in `packages/beatui/src/lexical/plugins/history.ts` (wraps `registerHistory` with configurable delay and depth, returns unsubscribe)
- [x] T019b Write tests for history plugin in `packages/beatui/tests/lexical/plugins/history.test.ts` (undo/redo operations, Ctrl/Cmd+Z keyboard shortcuts, configurable delay and maxDepth)
- [x] T020 [P] Implement clipboard plugin wrapper in `packages/beatui/src/lexical/plugins/clipboard.ts` (wraps `@lexical/clipboard` copy/paste handlers, HTML sanitization on paste)
- [x] T021 [P] Implement list plugin wrapper in `packages/beatui/src/lexical/plugins/list.ts` (registers ListNode + ListItemNode, list commands, returns unsubscribe)
- [x] T022 [P] Implement link plugin wrapper in `packages/beatui/src/lexical/plugins/link.ts` (registers LinkNode, click handling, returns unsubscribe)
- [x] T023 Create plugin barrel export in `packages/beatui/src/lexical/plugins/index.ts` (re-export all plugin wrappers)
- [x] T024 Wire up the main entry point in `packages/beatui/src/lexical/index.ts` (re-export types, plugins, components, headless API, extension API)

**Checkpoint**: Foundation ready. Core types, lazy loader, plugin wrappers, and CSS are in place. User story implementation can now begin.

---

## Phase 3: User Story 1 - Bare Editor for Custom UIs (Priority: P1) MVP

**Goal**: Deliver a functional headless rich text editor surface with no UI chrome, supporting Markdown and JSON content binding.

**Independent Test**: Mount a Bare editor, programmatically format text via the command API, and verify the output matches expected content in the configured format.

### Implementation for User Story 1

- [x] T025 [US1] Implement BareEditor component in `packages/beatui/src/components/lexical/bare-editor.ts` (accepts BareEditorOptions, uses Task() for lazy loading, calls createEditor with computed node list from PluginConfig, mounts to contenteditable div via setRootElement, registers enabled plugins, binds value via update listener, handles onChange/onInput/onBlur, supports readOnly via editor.setEditable, lifecycle cleanup via OnDispose)
- [x] T026 [US1] Implement Markdown I/O plugin in `packages/beatui/src/lexical/plugins/markdown-io.ts` (wraps `$convertFromMarkdownString`/`$convertToMarkdownString` with TRANSFORMERS, configurable transformer set)
- [x] T027 [P] [US1] Implement selection utilities in `packages/beatui/src/lexical/plugins/selection.ts` (wraps `@lexical/selection` - get, set, extend, collapse selection programmatically)
- [x] T028 [P] [US1] Implement text utilities in `packages/beatui/src/lexical/plugins/text.ts` (wraps `@lexical/text` - find text by string or pattern, replace text, count characters and words, case transformation)
- [x] T028b [P] [US1] Implement offset utilities in `packages/beatui/src/lexical/plugins/offset.ts` (wraps `@lexical/offset` for mapping between editor positions and plain-text offsets, used by selection and mark features)
- [x] T029 [US1] Create component barrel export in `packages/beatui/src/components/lexical/index.ts` (export BareEditor)
- [x] T030 [US1] Write tests for BareEditor in `packages/beatui/tests/lexical/bare-editor.test.ts` (mount with jsdom, verify contenteditable renders, test value binding in Markdown and JSON formats, test readOnly mode, test plugin registration, test cleanup on unmount)

**Checkpoint**: Bare editor is functional. Developers can mount a headless editor, bind content in Markdown or JSON, and programmatically interact with it.

---

## Phase 4: User Story 2 - Docked Toolbar Editor (Priority: P2)

**Goal**: Deliver a full WYSIWYG editor with a persistent, configurable toolbar above the editor surface.

**Independent Test**: Mount a Docked editor, click toolbar buttons, and verify formatting is applied. Configure toolbar groups to show/hide.

### Implementation for User Story 2

- [x] T031 [P] [US2] Create toolbar button component in `packages/beatui/src/components/lexical/toolbar/toolbar-button.ts` (accepts ToolbarItem, renders button with icon, tooltip, aria-pressed for toggle state, active state tracking via editor command listener)
- [x] T032 [P] [US2] Create toolbar group component in `packages/beatui/src/components/lexical/toolbar/toolbar-group.ts` (accepts ToolbarGroup, renders group container with separator, maps items to ToolbarButton, supports show/hide via visibility config)
- [x] T033 [US2] Create main toolbar component in `packages/beatui/src/components/lexical/toolbar/lexical-toolbar.ts` (accepts ToolbarConfig + editor instance, creates standard groups [text-formatting, headings, lists, blocks, tables, links, history], renders visible groups, role="toolbar" with arrow key navigation, responsive wrapping)
- [x] T034 [US2] Create toolbar barrel export in `packages/beatui/src/components/lexical/toolbar/index.ts`
- [x] T035 [P] [US2] Create toolbar CSS in `packages/beatui/src/styles/layers/03.components/_lexical-toolbar.css` (bc-lexical-toolbar, bc-lexical-toolbar-group, bc-lexical-toolbar-button, active/hover/focus states, responsive wrapping, light/dark theme tokens, hidden state for readOnly)
- [x] T036 [US2] Implement DockedEditor component in `packages/beatui/src/components/lexical/docked-editor.ts` (extends BareEditor pattern, adds LexicalToolbar above editor surface, passes ToolbarConfig, hides toolbar in readOnly mode, default plugins: richText + history + clipboard + list + link + autoLink + code + table)
- [x] T037 [US2] Update component barrel export in `packages/beatui/src/components/lexical/index.ts` (add DockedEditor)
- [x] T038 [US2] Write tests for DockedEditor in `packages/beatui/tests/lexical/docked-editor.test.ts` (verify toolbar renders with default groups, test group visibility config, test toolbar hidden in readOnly, test toolbar button active states)
- [x] T039 [US2] Write tests for toolbar in `packages/beatui/tests/lexical/toolbar.test.ts` (verify keyboard navigation, aria roles, active state tracking)

**Checkpoint**: Docked editor is functional. Full WYSIWYG experience with configurable toolbar.

---

## Phase 5: User Story 3 - Contextual Editor with Floating Controls (Priority: P3)

**Goal**: Deliver a clean editor with floating toolbar on text selection and slash-command palette on "/" input.

**Independent Test**: Mount a Contextual editor, select text to trigger floating toolbar, type "/" to trigger command palette.

### Implementation for User Story 3

- [x] T040 [P] [US3] Implement floating toolbar component in `packages/beatui/src/components/lexical/floating/floating-toolbar.ts` (renders toolbar near selection using getBoundingClientRect, viewport overflow prevention, show on text selection, hide on deselect/click-outside, focus trap, Escape to dismiss, role="toolbar", ARIA labels)
- [x] T041 [P] [US3] Implement slash-command palette component in `packages/beatui/src/components/lexical/floating/slash-command-palette.ts` (renders command list on "/" input, keyboard navigation up/down/enter/escape, type-ahead filtering, role="listbox" with aria-activedescendant, configurable command list, default commands for heading/list/quote/code/table/divider)
- [x] T042 [US3] Implement slash-commands plugin in `packages/beatui/src/lexical/plugins/slash-commands.ts` (detects "/" keypress, triggers palette rendering, dispatches selected command, configurable trigger character, custom command registration, returns unsubscribe)
- [x] T043 [P] [US3] Create floating UI CSS in `packages/beatui/src/styles/layers/03.components/_lexical-floating.css` (bc-lexical-floating-toolbar, bc-lexical-command-palette, positioning, animation, shadow, light/dark theme tokens, z-index management)
- [x] T044 [US3] Create floating barrel export in `packages/beatui/src/components/lexical/floating/index.ts`
- [x] T045 [US3] Implement ContextualEditor component in `packages/beatui/src/components/lexical/contextual-editor.ts` (extends BareEditor pattern, adds FloatingToolbar + SlashCommandPalette, selection change listener, "/" detection, default plugins: richText + history + clipboard + list + link + autoLink + code + table + slashCommands)
- [x] T046 [US3] Update component barrel export in `packages/beatui/src/components/lexical/index.ts` (add ContextualEditor)
- [x] T047 [US3] Write tests for floating toolbar in `packages/beatui/tests/lexical/floating-toolbar.test.ts` (verify positioning, show/hide behavior, keyboard accessibility)
- [x] T048 [US3] Write tests for slash-command palette in `packages/beatui/tests/lexical/slash-command-palette.test.ts` (verify "/" triggers palette, filtering, command execution, keyboard navigation)

**Checkpoint**: Contextual editor is functional. Floating toolbar appears on selection, slash commands work.

---

## Phase 6: User Story 4 - Slash Commands as Standalone Plugin (Priority: P4)

**Goal**: Make slash commands available as an independent plugin for any editor preset.

**Independent Test**: Mount a Bare or Docked editor, register the slash-command plugin separately, verify "/" triggers the command palette.

### Implementation for User Story 4

- [x] T049 [US4] Refactor slash-command plugin in `packages/beatui/src/lexical/plugins/slash-commands.ts` to be fully standalone (ensure it works independently when registered with any editor instance via PluginConfig, not coupled to ContextualEditor internals)
- [x] T050 [US4] Export slash-command plugin and SlashCommandDefinition type from `packages/beatui/src/lexical/index.ts` for standalone use
- [x] T051 [US4] Write tests for standalone slash-commands in `packages/beatui/tests/lexical/plugins/slash-commands.test.ts` (register with Bare editor, register with Docked editor, custom commands, replaceDefaults option)

**Checkpoint**: Slash commands work as a standalone plugin with any preset.

---

## Phase 7: User Story 5 - Multi-Format I/O (Priority: P5)

**Goal**: Support Markdown, HTML, and Lexical JSON as input/output formats with file import/export.

**Independent Test**: Set content in one format, read back in all others, verify round-trip accuracy. Export and import files.

### Implementation for User Story 5

- [x] T052 [P] [US5] Implement HTML I/O plugin in `packages/beatui/src/lexical/plugins/html-io.ts` (wraps `$generateHtmlFromNodes`/`$generateNodesFromDOM`, HTML sanitization, handles unsupported elements gracefully)
- [x] T053 [P] [US5] Implement file I/O plugin in `packages/beatui/src/lexical/plugins/file-io.ts` (wraps `@lexical/file`, file export with format selection, file import with format detection, download trigger via blob URL)
- [x] T054 [US5] Integrate multi-format support into editor base (update BareEditor/DockedEditor/ContextualEditor to support `format: 'html'` in addition to existing 'markdown'/'json', wire HTML I/O plugin)
- [x] T055 [US5] Implement LexicalEditorInput form wrapper in `packages/beatui/src/components/lexical/lexical-editor-input.ts` (extends InputOptions<string> for markdown/html, InputOptions<object> for json, integrates with BeatUI form system, error state styling, onChange/onInput/onBlur consistent with other form inputs)
- [x] T056 [US5] Update component barrel export in `packages/beatui/src/components/lexical/index.ts` (add LexicalEditorInput)
- [x] T057 [US5] Write tests for multi-format I/O in `packages/beatui/tests/lexical/plugins/markdown-io.test.ts` (round-trip Markdown with all formatting types)
- [x] T058 [P] [US5] Write tests for HTML I/O in `packages/beatui/tests/lexical/plugins/html-io.test.ts` (round-trip HTML, sanitization of external HTML)
- [x] T059 [P] [US5] Write tests for file I/O in `packages/beatui/tests/lexical/plugins/file-io.test.ts` (export/import Markdown, HTML, JSON files)
- [x] T060 [US5] Write tests for form integration in `packages/beatui/tests/lexical/form-integration.test.ts` (LexicalEditorInput with validation, error states, value binding)

**Checkpoint**: All three formats work. File import/export works. Form integration works.

---

## Phase 8: User Story 6 - Table Editing (Priority: P6)

**Goal**: Full table editing with insert, row/column operations, cell merging, keyboard navigation, and rich text in cells.

**Independent Test**: Insert a table, edit cells, add/remove rows and columns, verify content structure.

### Implementation for User Story 6

- [x] T061 [P] [US6] Implement table plugin wrapper in `packages/beatui/src/lexical/plugins/table.ts` (registers TableNode + TableCellNode + TableRowNode, table commands, insert with configurable dimensions, row/column add/remove, cell merge/split, Tab/Shift+Tab navigation, nested table opt-in config)
- [x] T062 [P] [US6] Implement table controls UI in `packages/beatui/src/components/lexical/table/table-controls.ts` (context menu or mini-toolbar on table cell selection, row/column operations, cell merge/split, role="menu" keyboard accessible)
- [x] T063 [US6] Create table barrel export in `packages/beatui/src/components/lexical/table/index.ts`
- [x] T064 [P] [US6] Create table CSS in `packages/beatui/src/styles/layers/03.components/_lexical-table.css` (bc-lexical-table, cell borders, selected cell highlight, resize handles, context menu styles, light/dark theme tokens)
- [x] T065 [US6] Wire table plugin and controls into DockedEditor and ContextualEditor (add table toolbar group to Docked, add table slash command to Contextual, table controls render on cell selection)
- [x] T066 [US6] Write tests for table plugin in `packages/beatui/tests/lexical/plugins/table.test.ts` (insert table, add/remove rows/columns, cell merge/split, keyboard navigation, nested tables)

**Checkpoint**: Table editing is functional in Docked and Contextual editors.

---

## Phase 9: User Story 7 - Code Blocks with Syntax Highlighting (Priority: P7)

**Goal**: Code blocks with language selector and syntax highlighting that adapts to the current theme.

**Independent Test**: Insert a code block, select a language, type code, verify syntax highlighting.

### Implementation for User Story 7

- [x] T067 [P] [US7] Implement code plugin wrapper in `packages/beatui/src/lexical/plugins/code.ts` (registers CodeNode + CodeHighlightNode, syntax highlighting via `@lexical/code`, configurable language list)
- [x] T068 [P] [US7] Implement code-shiki plugin wrapper in `packages/beatui/src/lexical/plugins/code-shiki.ts` (alternative highlighting via `@lexical/code-shiki`, opt-in, theme-aware color schemes)
- [x] T069 [P] [US7] Implement language selector UI in `packages/beatui/src/components/lexical/code/language-selector.ts` (dropdown with configurable language list, keyboard accessible, positioned relative to code block)
- [x] T070 [US7] Create code block barrel export in `packages/beatui/src/components/lexical/code/index.ts`
- [x] T071 [P] [US7] Create code block CSS in `packages/beatui/src/styles/layers/03.components/_lexical-code.css` (bc-lexical-code-block, monospace font, language selector styles, syntax token colors for light/dark theme, line numbers optional)
- [x] T072 [US7] Wire code plugin into DockedEditor and ContextualEditor (code block toolbar button, code block slash command, language selector renders inside code blocks)
- [x] T073 [US7] Write tests for code plugin in `packages/beatui/tests/lexical/plugins/code.test.ts` (insert code block, language selection, syntax highlighting tokens, markdown serialization with language identifier)

**Checkpoint**: Code blocks with syntax highlighting work in all presets.

---

## Phase 10: User Story 8 - Hashtag and Auto-Link Detection (Priority: P8)

**Goal**: Automatic detection of #hashtags and URLs as interactive elements.

**Independent Test**: Type a hashtag or URL and verify it is automatically recognized and styled.

### Implementation for User Story 8

- [x] T074 [P] [US8] Implement hashtag plugin wrapper in `packages/beatui/src/lexical/plugins/hashtag.ts` (registers HashtagNode, auto-detection of #word patterns, configurable onHashtagClick callback, distinct styling)
- [x] T075 [P] [US8] Implement auto-link plugin wrapper in `packages/beatui/src/lexical/plugins/auto-link.ts` (registers AutoLinkNode, URL pattern detection, configurable custom matchers, click handling with modifier key)
- [x] T076 [US8] Write tests for hashtag plugin in `packages/beatui/tests/lexical/plugins/hashtag.test.ts` (auto-detection, click callback, styling)
- [x] T077 [P] [US8] Write tests for auto-link plugin in `packages/beatui/tests/lexical/plugins/link.test.ts` (URL auto-detection, custom matchers, click behavior)

**Checkpoint**: Hashtags and auto-links are detected and styled automatically.

---

## Phase 11: User Story 9 - Mark/Annotation and Character Limit Support (Priority: P9)

**Goal**: Text annotations for review workflows and configurable character limits.

**Independent Test**: Apply a mark to text, verify rendering. Configure character limit, verify enforcement.

### Implementation for User Story 9

- [x] T078 [P] [US9] Implement mark plugin wrapper in `packages/beatui/src/lexical/plugins/mark.ts` (registers MarkNode, API for applying/removing marks with metadata, hover/click callbacks, visual styling for overlapping marks)
- [x] T079 [P] [US9] Implement overflow plugin wrapper in `packages/beatui/src/lexical/plugins/overflow.ts` (registers OverflowNode, configurable maxLength, visual overflow indication via red highlight, character count exposed via callback, paste truncation)
- [x] T080 [US9] Write tests for mark plugin in `packages/beatui/tests/lexical/plugins/mark.test.ts` (apply mark, metadata access, overlapping marks, hover callback)
- [x] T081 [P] [US9] Write tests for overflow plugin in `packages/beatui/tests/lexical/plugins/overflow.test.ts` (character limit enforcement, overflow styling, paste truncation, character count accuracy)

**Checkpoint**: Marks and character limits work independently.

---

## Phase 12: User Story 10 - Collaborative Editing (Priority: P10)

**Goal**: Real-time collaborative editing with remote cursors and offline support.

**Independent Test**: Connect two editors to the same collaboration session, verify real-time sync and remote cursors.

### Implementation for User Story 10

- [x] T082 [US10] Implement Yjs collaboration plugin wrapper in `packages/beatui/src/lexical/plugins/yjs.ts` (wraps `@lexical/yjs`, accepts CollaborationConfig with Y.Doc + provider + user identity, renders remote cursors with color/name labels, handles offline/reconnect, returns unsubscribe that cleans up binding)
- [x] T083 [US10] Wire collaboration plugin into PluginConfig and all presets (yjs option in PluginConfig, pass config through to plugin, ensure cleanup on unmount)
- [x] T084 [US10] Add remote cursor CSS styles to `packages/beatui/src/styles/layers/03.components/_lexical-editor.css` (cursor line, name label, selection highlight with user color, animation)
- [x] T084b Write tests for Yjs collaboration plugin in `packages/beatui/tests/lexical/plugins/yjs.test.ts` (mock Y.Doc + provider, verify editor binding, remote cursor rendering, offline queue and reconnect sync)

**Checkpoint**: Collaborative editing works with any Yjs provider.

---

## Phase 13: User Story 11 - Speech-to-Text Input (Priority: P11)

**Goal**: Support Dragon NaturallySpeaking and browser speech recognition input.

**Independent Test**: Simulate speech recognition events, verify text insertion.

### Implementation for User Story 11

- [x] T085 [US11] Implement dragon plugin wrapper in `packages/beatui/src/lexical/plugins/dragon.ts` (wraps `@lexical/dragon`, speech-to-text compatibility hooks, returns unsubscribe)
- [x] T086 [US11] Wire dragon plugin into PluginConfig (dragon option, enable via config)
- [x] T086b Write tests for dragon plugin in `packages/beatui/tests/lexical/plugins/dragon.test.ts` (simulate speech recognition input events, verify text insertion at cursor)

**Checkpoint**: Speech-to-text input is supported when Dragon or browser speech API is available.

---

## Phase 14: User Story 12 - Theme and Dark Mode Integration (Priority: P12)

**Goal**: Editor automatically adapts to BeatUI's light/dark theme without additional configuration.

**Independent Test**: Toggle BeatUI theme, verify editor appearance changes accordingly.

### Implementation for User Story 12

- [x] T087 [US12] Integrate theme system into all editor components (Use(Theme, ...) in BareEditor/DockedEditor/ContextualEditor, switch CSS classes based on appearance signal, ensure all sub-components - toolbars, floating menus, tables, code blocks - react to theme changes)
- [x] T088 [US12] Audit and complete all CSS files for light/dark theme support (review `_lexical-editor.css`, `_lexical-toolbar.css`, `_lexical-floating.css`, `_lexical-table.css`, `_lexical-code.css` for `.b-dark` variants, ensure all colors reference BeatUI design tokens)
- [x] T089 [US12] Write tests for theme integration in `packages/beatui/tests/lexical/theme-integration.test.ts` (verify CSS class switching on theme change, verify code block highlighting adapts)

**Checkpoint**: Theme integration complete. All editor elements respect light/dark mode.

---

## Phase 15: User Story 13 - Localized Editor UI (Priority: P13)

**Goal**: All user-facing text localized via LexicalI18n provider across 19 locales.

**Independent Test**: Switch locale, verify toolbar tooltips, command palette labels, and ARIA labels update.

### Implementation for User Story 13

- [x] T090 [US13] Define English default messages in `packages/beatui/src/lexical-i18n/messages.ts` (all toolbar labels, slash-command labels, table operation labels, code block labels, editor placeholder, character count, link labels per data-model.md LexicalEditorMessages)
- [x] T091 [US13] Create LexicalI18n provider in `packages/beatui/src/lexical-i18n/index.ts` (use makeI18nProvider() with defaultMessages, async locale loader, matching BeatUII18n/AuthI18n pattern)
- [x] T092 [US13] Create all 19 locale translation files in `packages/beatui/src/lexical-i18n/locales/` (en.ts, es.ts, fr.ts, de.ts, it.ts, pt.ts, ja.ts, zh.ts, ko.ts, ru.ts, ar.ts, nl.ts, pl.ts, tr.ts, vi.ts, hi.ts, fa.ts, he.ts, ur.ts)
- [x] T093 [US13] Integrate LexicalI18n into toolbar components (Use(LexicalI18n, ...) for tooltip text in toolbar buttons, toolbar groups, table controls, code language selector)
- [x] T094 [US13] Integrate LexicalI18n into floating components (Use(LexicalI18n, ...) for floating toolbar tooltips, slash-command palette labels and descriptions)
- [x] T095 [US13] Integrate RTL/LTR direction support (Use(Locale, ...) for direction-aware layout in toolbar, floating toolbar positioning, command palette alignment, table directionality)
- [x] T096 [US13] Write tests for i18n in `packages/beatui/tests/lexical/i18n.test.ts` (verify locale switching updates visible text, verify RTL layout, verify custom message overrides)

**Checkpoint**: Full localization across 19 locales. RTL support for Arabic, Hebrew, Farsi, Urdu.

---

## Phase 16: Polish & Cross-Cutting Concerns

**Purpose**: Headless editor, extension API, accessibility audit, final wiring

- [x] T097 Implement headless editor in `packages/beatui/src/lexical/headless.ts` (wraps `createHeadlessEditor` from `@lexical/headless`, accepts HeadlessEditorOptions, registers configured plugins/nodes, exports createHeadlessEditor function)
- [x] T097b Write tests for headless editor in `packages/beatui/tests/lexical/headless.test.ts` (create headless editor, load JSON state, convert to Markdown, convert to HTML, verify no DOM dependency, test custom node registration)
- [x] T098 Implement extension framework re-exports in `packages/beatui/src/lexical/index.ts` (export createCommand, ElementNode, DecoratorNode, TextNode, command priorities, serialization hooks for custom node development)
- [x] T098b Write tests for extension framework in `packages/beatui/tests/lexical/extension.test.ts` (register custom node via createCommand, verify ElementNode/DecoratorNode/TextNode re-exports, test custom node serialization to Markdown and HTML)
- [x] T099 Write WCAG 2.1 AA accessibility tests in `packages/beatui/tests/lexical/a11y.test.ts` (verify toolbar keyboard navigation, floating toolbar focus trap, command palette aria-activedescendant, color contrast, focus indicators, ARIA roles on all interactive elements)
- [x] T100 Final wiring of `packages/beatui/src/lexical/index.ts` entry point (verify all components, plugins, types, headless API, extension API, and i18n provider are correctly exported)
- [x] T101 Run `pnpm build` and verify the lexical entry point produces correct output (ES module, CommonJS, type declarations, CSS bundle)
- [x] T102 Run `pnpm test` and verify all lexical tests pass
- [x] T103 Validate quickstart.md examples compile and work against the built library

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-15)**: All depend on Foundational phase completion
  - US1 (Bare) must complete before US2 (Docked), US3 (Contextual)
  - US2 and US3 can run in parallel once US1 is done
  - US4 (Standalone Slash Commands) depends on US3 (Contextual)
  - US5 (Multi-Format I/O) can run in parallel with US2/US3 (only needs US1)
  - US6-US9 plugin wrappers can run in parallel (only need US1), but US6/US7 wiring tasks (T065, T072) depend on US2+US3 (need toolbar and slash-command UI to exist)
  - US10-US11 can run in parallel (independent, only need US1)
  - US12 (Theme) depends on US2 + US3 (needs toolbar/floating UI to exist)
  - US13 (i18n) depends on US2 + US3 (needs toolbar/floating UI to exist)
- **Polish (Phase 16)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Bare)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **US2 (Docked)**: Depends on US1 (Bare editor is the base)
- **US3 (Contextual)**: Depends on US1 (Bare editor is the base)
- **US4 (Slash Commands)**: Depends on US3 (slash-command UI is built there, then extracted)
- **US5 (Multi-Format I/O)**: Depends on US1 only (format binding in editor base)
- **US6 (Tables)**: Depends on US1 (plugin, but also needs US2/US3 for toolbar/slash wiring)
- **US7 (Code Blocks)**: Depends on US1 (plugin, but also needs US2/US3 for toolbar/slash wiring)
- **US8 (Hashtag/Auto-Link)**: Depends on US1 only (standalone plugins)
- **US9 (Marks/Overflow)**: Depends on US1 only (standalone plugins)
- **US10 (Collaboration)**: Depends on US1 only (plugin layer)
- **US11 (Speech-to-Text)**: Depends on US1 only (plugin layer)
- **US12 (Theme)**: Depends on US2 + US3 (needs all UI components to exist)
- **US13 (i18n)**: Depends on US2 + US3 (needs all UI components to exist)

### Within Each User Story

- Plugin wrappers before UI components
- UI components before preset integration
- Integration before tests
- Core implementation before cross-cutting concerns

### Parallel Opportunities

- T007-T010 (directory creation) can all run in parallel
- T017-T022 (foundational plugin wrappers) can all run in parallel
- US5, US6, US7, US8, US9, US10, US11 can all run in parallel once US1 is done
- US2 and US3 can run in parallel once US1 is done
- Within each story, plugin and CSS tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Phase 2 (Foundational) completes:

# Launch US1 plugin tasks in parallel:
Task: "T026 [US1] Implement Markdown I/O plugin in packages/beatui/src/lexical/plugins/markdown-io.ts"
Task: "T027 [P] [US1] Implement selection utilities in packages/beatui/src/lexical/plugins/selection.ts"
Task: "T028 [P] [US1] Implement text utilities in packages/beatui/src/lexical/plugins/text.ts"

# Then sequentially:
Task: "T025 [US1] Implement BareEditor component (depends on plugins)"
Task: "T029 [US1] Create barrel export"
Task: "T030 [US1] Write tests"
```

## Parallel Example: Independent Plugin Stories

```bash
# After US1 completes, these stories can all run in parallel:

# Developer A: US6 (Tables)
Task: "T061 [P] [US6] Implement table plugin"
Task: "T062 [P] [US6] Implement table controls UI"

# Developer B: US7 (Code Blocks)
Task: "T067 [P] [US7] Implement code plugin"
Task: "T069 [P] [US7] Implement language selector UI"

# Developer C: US8 (Hashtag/Auto-Link)
Task: "T074 [P] [US8] Implement hashtag plugin"
Task: "T075 [P] [US8] Implement auto-link plugin"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Bare Editor)
4. **STOP and VALIDATE**: Mount Bare editor, bind Markdown content, verify round-trip
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Bare) → Headless editor works (MVP)
3. US2 (Docked) → Full toolbar WYSIWYG works
4. US3 (Contextual) → Floating toolbar + slash commands work
5. US5 (Multi-Format) → HTML + file I/O added
6. US6-US9 (Plugins) → Tables, code blocks, hashtags, marks, character limits
7. US10-US11 (Advanced) → Collaboration, speech-to-text
8. US12-US13 (Polish) → Theme + i18n integration
9. Phase 16 (Polish) → Headless, extensions, a11y audit

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. One developer completes US1 (Bare - everyone depends on this)
3. Once US1 is done:
   - Developer A: US2 (Docked) + US12 (Theme)
   - Developer B: US3 (Contextual) + US4 (Standalone Slash Commands)
   - Developer C: US5 (Multi-Format I/O) + US6 (Tables) + US7 (Code Blocks)
   - Developer D: US8 (Hashtag/Auto-Link) + US9 (Marks/Overflow) + US10 (Collaboration) + US11 (Speech)
4. After US2 + US3 are done: US13 (i18n) can start
5. Phase 16 (Polish) once all stories complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All Lexical packages are bundled dependencies (not peer deps) matching Monaco pattern
- CSS uses `@layer components` with `bc-lexical-*` class prefix
- All components use `Task()` for lazy loading and `OnDispose` for cleanup
