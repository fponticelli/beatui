# Research: Lexical Editor Integration

**Feature**: 003-lexical-editor-integration
**Date**: 2026-02-03
**Phase**: 0 - Research & Unknowns Resolution

## R-001: Lexical Vanilla JS API (No React)

**Decision**: Use Lexical's core `createEditor()` API with imperative plugin registration functions. No `@lexical/react` dependency.

**Rationale**: Lexical's core is framework-agnostic. The `@lexical/react` package is a convenience layer over the same underlying API. BeatUI uses `@tempots/dom` (not React), so direct vanilla JS integration is the correct approach. This is a proven pattern - community bindings exist for Vue, Svelte, and Solid.

**Alternatives considered**:
- Using `@lexical/react` with a React-in-BeatUI bridge: Rejected. Adds React as a runtime dependency, bloats bundle, creates framework impedance mismatch.
- Using a community vanilla JS wrapper (e.g., `lexical-vanilla-plugins`): Rejected. Too limited in scope, not maintained to the same standard, adds an unnecessary dependency layer.

**Key API patterns**:
- `createEditor(config)` → returns editor instance
- `editor.setRootElement(dom)` → mounts to contenteditable
- `registerRichText(editor)` / `registerPlainText(editor)` → core editing behavior
- `registerHistory(editor, historyState, debounceMs)` → undo/redo
- `editor.registerUpdateListener(callback)` → state change subscription
- `editor.registerCommand(command, handler, priority)` → command handling
- `editor.update(() => { /* $ functions */ })` → state mutations
- All `register*()` functions return unsubscribe functions for cleanup

## R-002: Plugin Architecture Mapping

**Decision**: Each official `@lexical/*` package maps to a BeatUI plugin wrapper in `src/lexical/plugins/`. Plugins follow a consistent pattern: a `register*` function that takes an editor instance and options, returns an unsubscribe function.

**Rationale**: Lexical's plugin model is already function-based. BeatUI wrappers add: (1) reactive option binding via `Value<T>`, (2) theme-aware styling, (3) i18n integration, (4) proper lifecycle management with `OnDispose`.

**Plugin → Package mapping**:

| BeatUI Plugin | Lexical Package(s) | Registration Pattern |
|---------------|--------------------|--------------------|
| `rich-text` | `@lexical/rich-text` | `registerRichText(editor)` |
| `plain-text` | `@lexical/plain-text` | `registerPlainText(editor)` |
| `history` | `@lexical/history` | `registerHistory(editor, state, ms)` |
| `list` | `@lexical/list` | Node registration + commands |
| `table` | `@lexical/table` | Node registration + `registerTablePlugin` |
| `link` | `@lexical/link` | Node registration + click handler |
| `auto-link` | `@lexical/link` (AutoLinkNode) | Matcher-based auto-detection |
| `code` | `@lexical/code` | Node registration + highlighting |
| `code-shiki` | `@lexical/code-shiki` | Alternative highlighting engine |
| `hashtag` | `@lexical/hashtag` | Node registration + auto-detection |
| `mark` | `@lexical/mark` | Node registration + API |
| `overflow` | `@lexical/overflow` | Node registration + limit enforcement |
| `clipboard` | `@lexical/clipboard` | Copy/paste handlers |
| `dragon` | `@lexical/dragon` | Speech input compatibility |
| `markdown-io` | `@lexical/markdown` | `$convertFromMarkdownString` / `$convertToMarkdownString` |
| `html-io` | `@lexical/html` | `$generateHtmlFromNodes` / `$generateNodesFromDOM` |
| `file-io` | `@lexical/file` | File save/load utilities |
| `yjs` | `@lexical/yjs` + `yjs` | CRDT binding with provider |
| `slash-commands` | Custom (BeatUI) | "/" detection + command palette UI |

## R-003: Node Registration Strategy

**Decision**: Nodes are registered via the `createEditor({ nodes: [...] })` config. Each plugin wrapper automatically registers its required nodes when enabled.

**Rationale**: Lexical requires all node types to be declared upfront in the editor config. The preset system (Bare/Docked/Contextual) computes the final node list based on which plugins are enabled, then passes it to `createEditor()`.

**Node → Package mapping**:
- `HeadingNode`, `QuoteNode` → `@lexical/rich-text`
- `ListNode`, `ListItemNode` → `@lexical/list`
- `TableNode`, `TableCellNode`, `TableRowNode` → `@lexical/table`
- `LinkNode`, `AutoLinkNode` → `@lexical/link`
- `CodeNode`, `CodeHighlightNode` → `@lexical/code`
- `HashtagNode` → `@lexical/hashtag`
- `MarkNode` → `@lexical/mark`
- `OverflowNode` → `@lexical/overflow`

## R-004: Lazy Loading Strategy

**Decision**: Use BeatUI's existing `Task()` pattern from `@tempots/dom` for lazy loading. The Lexical core and all plugin packages are dynamically imported when the editor component mounts.

**Rationale**: Matches the established Monaco pattern. `Task()` handles async import with loading state management. CSS is injected via `LinkPortal`.

**Implementation approach**:
1. `src/lexical/lazy-loader.ts` provides `loadLexicalCore()` which dynamically imports `lexical` and caches the result
2. Each plugin wrapper lazily imports its corresponding `@lexical/*` package
3. CSS is bundled as inline string via Vite's `?inline` query and injected via `LinkPortal`
4. The `sideEffects` field in `package.json` lists `src/lexical/index.ts` to prevent tree-shaking of the entry point

**Alternatives considered**:
- CDN-based loading (like Monaco): Rejected. Lexical packages are much smaller than Monaco and don't have a CDN distribution model. npm packages bundled via Vite is simpler and more reliable.
- Eager import with code splitting: Rejected. Doesn't provide the same guarantee of zero-cost until mount.

## R-005: Multi-Format I/O

**Decision**: Support three formats via dedicated I/O plugins: Markdown (`@lexical/markdown`), HTML (`@lexical/html`), and Lexical JSON (native `editor.getEditorState().toJSON()`). Default format is configurable per editor instance.

**Rationale**: Each format serves a different use case. Markdown for developer tools, HTML for CMS integration, JSON for full-fidelity persistence.

**Key APIs**:
- **Markdown**: `$convertFromMarkdownString(md, TRANSFORMERS)` / `$convertToMarkdownString(TRANSFORMERS)`
- **HTML**: `$generateNodesFromDOM(editor, dom)` / `$generateHtmlFromNodes(editor, selection)`
- **JSON**: `editor.getEditorState().toJSON()` / `editor.setEditorState(editor.parseEditorState(json))`
- **File**: `@lexical/file` provides `exportFile(editor, filename, format)` and `importFile(editor)`

## R-006: Floating Toolbar Positioning

**Decision**: Implement custom floating positioning using browser `Selection` and `Range` APIs combined with `getBoundingClientRect()`. No dependency on Floating UI / Popper.js.

**Rationale**: The floating toolbar needs to appear near the text selection. The existing ProseMirror integration doesn't use a positioning library either. Using native APIs keeps the bundle small and avoids an external dependency. Viewport overflow prevention is handled with simple boundary checking against `window.innerWidth`/`innerHeight`.

**Alternatives considered**:
- Floating UI library: Rejected. Adds ~8KB to the bundle for a relatively simple positioning task.
- CSS anchor positioning: Rejected. Browser support is still limited (Chrome only as of 2025).

## R-007: Collaboration (Yjs) Integration

**Decision**: Provide a `yjs` plugin wrapper that accepts a Yjs `Doc` and `Provider` from the consuming application. BeatUI provides the client-side binding (`@lexical/yjs`) but not the Yjs document or transport.

**Rationale**: The collaboration server infrastructure (WebSocket server, room management, auth) is application-specific. BeatUI's role is to provide the editor-side binding and cursor rendering.

**Required consumer dependencies**: `yjs`, plus a provider like `y-websocket` or `y-webrtc`.

## R-008: Accessibility (WCAG 2.1 AA)

**Decision**: Full WCAG 2.1 AA compliance for all editor UI controls. Lexical's core already handles contenteditable accessibility; BeatUI is responsible for toolbar, floating menu, command palette, and table control accessibility.

**Rationale**: Required by spec clarification. BeatUI is used in professional applications where accessibility compliance is expected.

**Implementation approach**:
- Toolbar: `role="toolbar"`, arrow key navigation between buttons, `aria-pressed` for toggle states
- Floating toolbar: Focus trap when visible, Escape to dismiss, `role="toolbar"`
- Command palette: `role="listbox"` with `aria-activedescendant`, keyboard navigation (up/down/enter/escape)
- Table controls: `role="menu"` for context menus, keyboard-accessible row/column operations
- All interactive elements: visible focus indicators, minimum 4.5:1 contrast ratio

## R-009: Lexical Dependencies and Bundle

**Decision**: Install all applicable Lexical packages as bundled dependencies (not peerDependencies), matching the Monaco/ProseMirror pattern.

**Rationale**: BeatUI bundles Monaco (0.55.1) and ProseMirror packages as regular dependencies. Consumers access them through optional entry points and never install them directly. This simplifies the consumer's dependency management.

**Packages to install**:
```
lexical
@lexical/rich-text
@lexical/plain-text
@lexical/history
@lexical/list
@lexical/table
@lexical/link
@lexical/code
@lexical/hashtag
@lexical/mark
@lexical/overflow
@lexical/markdown
@lexical/html
@lexical/file
@lexical/clipboard
@lexical/selection
@lexical/text
@lexical/offset
@lexical/utils
@lexical/extension
@lexical/headless
@lexical/yjs
@lexical/dragon
```

Optional (heavier, opt-in):
```
@lexical/code-shiki
```

Consumer must install separately (for collaboration):
```
yjs
y-websocket (or other provider)
```

## R-010: Extension Framework Exposure

**Decision**: Re-export Lexical's extension API (`@lexical/extension`) through the BeatUI plugin system, along with base classes and utilities needed to create custom nodes.

**Rationale**: Developers need to create custom nodes for domain-specific content (e.g., mentions, embeds, callouts). BeatUI should not limit Lexical's extensibility.

**What to expose**:
- `createEditor` config types for custom node registration
- Base node classes (`ElementNode`, `DecoratorNode`, `TextNode`)
- `createCommand()` for custom commands
- Serialization hooks for custom nodes (Markdown transformer, HTML export/import)
- The `@lexical/extension` signal-based API for defining extensions
