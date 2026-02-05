# Feature Specification: Lexical Editor Integration

**Feature Branch**: `003-lexical-editor-integration`
**Created**: 2026-02-03
**Status**: Draft
**Input**: User description: "Full integration with the latest version of the Lexical editor from Facebook. Of importance are high configurability, headless (no visible toolbars), non-headless, embedded with inline/hover commands or with full toolbars. Full support for the entire surface of official Lexical plugins."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bare Editor for Custom UIs (Priority: P1)

A developer wants to embed a rich text editing surface into their application without any pre-built UI chrome. They use the **Bare** mode, which provides only the core editable area. All formatting controls, toolbars, and menus are the developer's responsibility to build using the provided plugin API and command system.

**Why this priority**: The Bare mode is the foundational layer that all other modes build upon. Without a solid, headless editing core, no higher-level presets can function correctly. It also serves developers who need maximum control over their editor's appearance.

**Independent Test**: Can be fully tested by mounting a Bare editor, programmatically formatting text via the command API, and verifying the output matches expected content. Delivers a functional rich text editor with no UI dependencies.

**Acceptance Scenarios**:

1. **Given** a developer imports the Bare editor component, **When** they mount it with a target element, **Then** a content-editable surface renders with no visible toolbars, menus, or buttons.
2. **Given** a mounted Bare editor, **When** the developer registers a custom plugin that dispatches a bold formatting command, **Then** the selected text becomes bold and the editor state reflects the change.
3. **Given** a Bare editor with initial Markdown content, **When** the editor mounts, **Then** the content is parsed and rendered correctly as rich text in the editable area.
4. **Given** a Bare editor with initial Lexical JSON state, **When** the editor mounts, **Then** the content is deserialized and rendered correctly.
5. **Given** a mounted Bare editor, **When** the user types content and the developer reads the output, **Then** the content is available in the configured default format (Markdown or Lexical JSON).

---

### User Story 2 - Docked Toolbar Editor (Priority: P2)

A developer wants a traditional WYSIWYG editing experience with a persistent toolbar anchored above the editor surface. They use the **Docked** mode, which ships with a full formatting toolbar including text styling, headings, lists, links, tables, code blocks, block formatting, and undo/redo. The toolbar is configurable - sections can be shown or hidden.

**Why this priority**: The Docked mode is the most familiar editing paradigm for end users and the most common request for rich text editing. It builds directly on the Bare foundation and adds the standard toolbar UI.

**Independent Test**: Can be fully tested by mounting a Docked editor, clicking toolbar buttons, and verifying formatting is applied. Delivers a complete, ready-to-use rich text editor out of the box.

**Acceptance Scenarios**:

1. **Given** a developer imports the Docked editor component, **When** they mount it with default options, **Then** a rich text editor renders with a persistent toolbar above the content area containing standard formatting controls.
2. **Given** a Docked editor with all features enabled, **When** the user clicks the Bold button while text is selected, **Then** the selected text becomes bold and the Bold button shows an active/pressed state.
3. **Given** a Docked editor, **When** the developer configures it to hide the headings and lists toolbar groups, **Then** the toolbar renders without those groups while all other controls remain functional.
4. **Given** a Docked editor, **When** the user resizes the editor container to a narrow width, **Then** the toolbar adapts gracefully (wrapping or collapsing overflow items).
5. **Given** a Docked editor in read-only mode, **When** the editor renders, **Then** the toolbar is hidden and the content is displayed as non-editable rich text.

---

### User Story 3 - Contextual Editor with Floating Controls (Priority: P3)

A developer wants a clean, distraction-free editing experience where formatting controls appear contextually - a floating toolbar on text selection and a slash-command palette on typing "/". They use the **Contextual** mode, inspired by editors like Notion and Medium.

**Why this priority**: The Contextual mode delivers a modern, premium editing experience that is increasingly expected in contemporary applications. It builds on the same plugin system but requires additional positioning and interaction logic.

**Independent Test**: Can be fully tested by mounting a Contextual editor, selecting text to trigger the floating toolbar, and typing "/" to trigger the command palette. Delivers a polished inline editing experience.

**Acceptance Scenarios**:

1. **Given** a developer imports the Contextual editor component, **When** they mount it, **Then** a clean editable surface renders with no visible toolbar or controls.
2. **Given** a mounted Contextual editor, **When** the user selects a range of text, **Then** a floating toolbar appears near the selection with formatting options (bold, italic, link, heading, etc.).
3. **Given** a visible floating toolbar, **When** the user clicks away or deselects the text, **Then** the floating toolbar disappears smoothly.
4. **Given** a Contextual editor, **When** the user types "/" at the beginning of a new line or after a space, **Then** a command palette appears listing available block-level commands (heading, list, quote, code block, table, divider, etc.).
5. **Given** a visible command palette, **When** the user types to filter commands and selects one, **Then** the "/" is replaced with the selected block type and the palette closes.
6. **Given** a Contextual editor, **When** the developer configures which commands appear in the slash-command palette, **Then** only the configured commands are shown.

---

### User Story 4 - Slash Commands as Standalone Plugin (Priority: P4)

A developer using the Bare or Docked mode wants to add slash-command functionality to their editor. They import the slash-command plugin separately and register it with their editor instance.

**Why this priority**: Making slash commands available independently from the Contextual mode increases the composability and reuse value of the integration. This is a natural extension once the Contextual mode's slash-command system is built.

**Independent Test**: Can be fully tested by mounting a Bare or Docked editor, registering the slash-command plugin, and verifying that typing "/" triggers the command palette.

**Acceptance Scenarios**:

1. **Given** a Bare editor, **When** the developer registers the slash-command plugin, **Then** typing "/" triggers the command palette in the editor.
2. **Given** a Docked editor with the slash-command plugin registered, **When** the user types "/" and selects a "Heading 2" command, **Then** the current line transforms into a heading level 2.
3. **Given** a slash-command plugin, **When** the developer provides a custom list of commands with custom icons and labels, **Then** the command palette renders the custom commands.

---

### User Story 5 - Multi-Format I/O (Priority: P5)

A developer needs to read and write editor content in multiple serialization formats: Markdown, Lexical JSON state, and HTML. They configure which format is the default for their use case, with the ability to convert between formats at any time. They can also import and export the editor's content as a file.

**Why this priority**: Supporting multiple formats maximizes interoperability. Markdown is portable and widely used; Lexical JSON preserves full editor fidelity; HTML enables integration with CMS and web publishing workflows. File import/export enables document workflows.

**Independent Test**: Can be fully tested by setting content in one format, reading it back in the others, and verifying round-trip accuracy.

**Acceptance Scenarios**:

1. **Given** an editor configured with Markdown as the default format, **When** the developer reads the editor content, **Then** the output is a Markdown string.
2. **Given** an editor configured with Lexical JSON as the default format, **When** the developer reads the editor content, **Then** the output is a serialized Lexical JSON state object.
3. **Given** an editor with rich content, **When** the developer requests the content in HTML format, **Then** the output is valid, semantic HTML representing the editor content.
4. **Given** an editor with rich content, **When** the developer requests the content in Markdown format, **Then** all supported formatting (bold, italic, headings, lists, links, code blocks, blockquotes, tables) is correctly serialized to Markdown.
5. **Given** Markdown content with formatting, **When** it is loaded into the editor, **Then** the content renders correctly as rich text.
6. **Given** Lexical JSON state, **When** it is loaded into the editor, **Then** the content renders identically to when it was serialized.
7. **Given** valid HTML content, **When** it is loaded into the editor, **Then** the content is parsed and rendered as the closest supported rich text equivalent.
8. **Given** an editor with content, **When** the developer invokes the file export function, **Then** the content is downloadable as a file in the chosen format (Markdown, HTML, or JSON).
9. **Given** a file in a supported format, **When** the developer invokes the file import function, **Then** the file content is loaded into the editor.

---

### User Story 6 - Table Editing (Priority: P6)

A developer needs table editing capabilities in the editor. Users can insert tables, add/remove rows and columns, merge and split cells, and navigate between cells with keyboard shortcuts.

**Why this priority**: Tables are a commonly requested rich text feature but involve significant complexity in both editing behavior and UI. This builds on the core editing foundation.

**Independent Test**: Can be fully tested by inserting a table, editing cells, adding/removing rows and columns, and verifying the resulting content structure.

**Acceptance Scenarios**:

1. **Given** a Docked or Contextual editor with tables enabled, **When** the user inserts a table (via toolbar button or slash command), **Then** a table with configurable initial dimensions renders in the editor.
2. **Given** a table in the editor, **When** the user clicks a cell, **Then** the cell becomes editable and a table context menu or toolbar controls appear for row/column operations.
3. **Given** a table cell, **When** the user presses Tab, **Then** the focus moves to the next cell (or creates a new row if at the last cell).
4. **Given** a table, **When** the user adds a column, **Then** a new column is inserted and all existing rows are extended.
5. **Given** a table, **When** the user removes a row, **Then** the row is deleted and remaining rows reflow.
6. **Given** a table with nested content, **When** the user types rich text inside a cell (bold, lists, links), **Then** the cell supports inline and block-level formatting.

---

### User Story 7 - Code Blocks with Syntax Highlighting (Priority: P7)

A developer needs code block support in the editor with syntax highlighting for multiple programming languages. The editor renders code blocks with language-aware coloring that adapts to the current theme.

**Why this priority**: Code blocks with highlighting are essential for technical content. They add significant visual value and are a natural extension of basic rich text.

**Independent Test**: Can be fully tested by inserting a code block, selecting a language, typing code, and verifying that syntax tokens are correctly highlighted.

**Acceptance Scenarios**:

1. **Given** an editor with code blocks enabled, **When** the user inserts a code block, **Then** a monospace editing area renders with a language selector.
2. **Given** a code block, **When** the user selects "JavaScript" as the language and types valid JS code, **Then** the code is syntax-highlighted with appropriate colors for keywords, strings, comments, etc.
3. **Given** a code block in light mode, **When** the theme switches to dark mode, **Then** the syntax highlighting colors adapt to the dark theme.
4. **Given** a code block with content, **When** the editor content is serialized to Markdown, **Then** the output contains a fenced code block with the correct language identifier (e.g., ` ```javascript `).
5. **Given** a developer, **When** they configure which languages are available for code blocks, **Then** only the configured languages appear in the language selector.

---

### User Story 8 - Hashtag and Auto-Link Detection (Priority: P8)

A developer wants the editor to automatically detect and visually distinguish hashtags (e.g., `#topic`) and URLs typed by the user, converting them into interactive elements without manual action.

**Why this priority**: Auto-detection features improve the writing experience and reduce manual formatting steps. They are self-contained features that enhance any editor preset.

**Independent Test**: Can be fully tested by typing a hashtag or URL in the editor and verifying it is automatically recognized and styled.

**Acceptance Scenarios**:

1. **Given** an editor with hashtag detection enabled, **When** the user types "#important", **Then** the text is automatically styled as a hashtag (distinct color, optionally clickable).
2. **Given** an editor with auto-link detection enabled, **When** the user types "https://example.com", **Then** the text is automatically converted into a clickable link.
3. **Given** an auto-detected link, **When** the user clicks it (in read-only mode or with modifier key), **Then** the link opens in a new browser tab.
4. **Given** an editor with both features enabled, **When** the developer provides custom matchers for auto-linking (e.g., email patterns, custom URL schemes), **Then** the auto-link detection uses the custom matchers.
5. **Given** a hashtag node, **When** the developer registers an `onHashtagClick` callback, **Then** clicking the hashtag invokes the callback with the hashtag value.

---

### User Story 9 - Mark/Annotation and Character Limit Support (Priority: P9)

A developer wants to enable text highlighting/annotations (marks) for review workflows, and optionally enforce character limits on the editor content.

**Why this priority**: Marks and character limits are specialized features used in review, collaboration, and form-bound editing scenarios. They are modular and build on the core editing foundation.

**Independent Test**: Can be fully tested by applying a mark to text and verifying it renders with the expected visual treatment; and by configuring a character limit and verifying enforcement.

**Acceptance Scenarios**:

1. **Given** an editor with marks enabled, **When** the developer programmatically applies a mark to a text range, **Then** the marked text renders with a distinct visual style (e.g., highlight background).
2. **Given** marked text, **When** the user hovers over it, **Then** the mark's metadata (comment, author, timestamp) is accessible via a callback or tooltip.
3. **Given** multiple overlapping marks on the same text, **When** they render, **Then** each mark is visually distinguishable (e.g., stacked highlights or combined indicator).
4. **Given** an editor with a character limit of 500, **When** the user types beyond 500 characters, **Then** the overflow text is visually distinguished (e.g., red highlight) and the developer is notified via a callback.
5. **Given** an editor with a character limit, **When** the developer reads the current character count, **Then** an accurate count is returned (excluding markup).

---

### User Story 10 - Collaborative Editing (Priority: P10)

A developer wants to enable real-time collaborative editing, where multiple users can edit the same document simultaneously with live cursors and conflict-free merging.

**Why this priority**: Collaboration is a high-value, complex feature that requires integration with a CRDT backend. It is the highest-effort feature and depends on all core editing features being stable first.

**Independent Test**: Can be fully tested by connecting two editor instances to the same collaboration session and verifying that edits from one appear in real-time in the other, with visible remote cursors.

**Acceptance Scenarios**:

1. **Given** two editor instances connected to the same collaboration session, **When** user A types text, **Then** user B sees the text appear in real-time.
2. **Given** a collaborative editor, **When** a remote user is editing, **Then** their cursor position and selection are visible with a distinct color and name label.
3. **Given** two users editing the same paragraph simultaneously, **When** both make changes, **Then** changes are merged without conflict or data loss.
4. **Given** a collaborative editor, **When** one user goes offline and reconnects, **Then** their offline changes are synced and merged with the latest state.
5. **Given** a developer, **When** they configure the collaboration provider (connection URL, room ID, user identity), **Then** the editor connects and synchronizes state.

---

### User Story 11 - Speech-to-Text Input (Priority: P11)

A developer wants to support speech-to-text input (Dragon NaturallySpeaking and browser speech recognition) as an alternative input method for the editor.

**Why this priority**: Accessibility feature that serves users who rely on voice input. Low priority because it depends on external speech recognition services and is a niche use case.

**Independent Test**: Can be fully tested by simulating speech recognition input events and verifying the text is correctly inserted into the editor.

**Acceptance Scenarios**:

1. **Given** an editor with speech-to-text support enabled, **When** the user dictates text via Dragon NaturallySpeaking or browser speech API, **Then** the dictated text is inserted into the editor at the cursor position.
2. **Given** a user dictating, **When** the speech recognition produces interim results, **Then** the interim text is displayed as a visual preview before being committed.
3. **Given** a user dictating formatting commands (e.g., "new paragraph", "bold that"), **When** the speech engine recognizes the command, **Then** the editor applies the corresponding formatting.

---

### User Story 12 - Theme and Dark Mode Integration (Priority: P12)

A developer using BeatUI's theme system expects the Lexical editor to automatically match the current theme (light/dark mode) without additional configuration.

**Why this priority**: Theme integration is essential for a polished UI but is lower priority than core editing functionality. It builds on existing BeatUI theme infrastructure.

**Independent Test**: Can be fully tested by toggling the BeatUI theme and verifying the editor's visual appearance changes accordingly.

**Acceptance Scenarios**:

1. **Given** a BeatUI application in light mode, **When** the editor mounts, **Then** the editor uses light-themed colors from BeatUI design tokens.
2. **Given** a mounted editor in light mode, **When** the application theme switches to dark mode, **Then** the editor's appearance transitions to dark-themed colors seamlessly.
3. **Given** a Docked editor in dark mode, **When** the toolbar renders, **Then** toolbar buttons, backgrounds, and borders use dark-mode design tokens.
4. **Given** a Contextual editor in dark mode, **When** the floating toolbar and command palette appear, **Then** they use dark-mode design tokens.

---

### User Story 13 - Localized Editor UI (Priority: P13)

A developer building a multilingual application expects all user-facing text in the Lexical editor (toolbar tooltips, slash-command labels, placeholder text, accessibility labels) to be translated into the current locale using BeatUI's i18n system.

**Why this priority**: Localization is critical for internationalized applications but depends on the Docked and Contextual UI being built first. It follows the established BeatUI pattern using `makeI18nProvider()` and the `Locale` provider.

**Independent Test**: Can be fully tested by switching the BeatUI locale and verifying that all visible editor text (toolbar tooltips, command palette labels, ARIA labels) updates to the selected language.

**Acceptance Scenarios**:

1. **Given** a Docked editor in a BeatUI application with locale set to "es", **When** the toolbar renders, **Then** toolbar button tooltips display in Spanish (e.g., "Negrita" for Bold, "Cursiva" for Italic).
2. **Given** a Contextual editor in a BeatUI application with locale set to "ar", **When** the floating toolbar appears, **Then** tooltip text is in Arabic and the toolbar respects RTL layout direction.
3. **Given** a Contextual editor with the slash-command palette open, **When** the locale is "fr", **Then** default command labels display in French (e.g., "Titre 1" for Heading 1, "Liste a puces" for Bullet List).
4. **Given** an editor with a placeholder, **When** the locale changes at runtime, **Then** the placeholder text updates reactively to the new locale.
5. **Given** a developer using custom slash commands, **When** they provide localized labels via the i18n system, **Then** those labels display in the current locale.

---

### Edge Cases

- What happens when the editor receives content in Markdown format that contains elements not supported by the current editor configuration (e.g., tables when tables are disabled)? Unsupported elements are rendered as plain text or preserved as raw Markdown.
- What happens when the user pastes HTML content from an external source? The content is sanitized and converted to the closest supported rich text equivalent.
- What happens when the editor is destroyed while an async operation (e.g., collaboration sync) is in progress? All pending operations are cancelled and resources are cleaned up.
- What happens when multiple slash-command plugins are registered? Only the last registered plugin takes effect, with a console warning.
- What happens when the editor container has zero height or is hidden? The editor defers initialization until the container becomes visible, or uses a sensible minimum height.
- What happens when the editor receives a Lexical JSON state from a different version of Lexical? A compatibility layer attempts to migrate the state, logging any dropped nodes.
- What happens when a table is nested inside another table? Nesting is optionally allowed via configuration; when disabled, the insertion is rejected with user feedback.
- What happens when the character limit is reached while pasting content? The pasted content is truncated to fit within the limit, and the user is notified visually.
- What happens when the collaboration server is unreachable? The editor continues to function in offline mode, queuing changes for sync when connectivity resumes.
- What happens when auto-link detection encounters an ambiguous string (e.g., "example.com" without protocol)? Configurable behavior: either auto-link with assumed protocol or leave as plain text.
- What happens when a code block has no language selected? The code block renders in plain monospace without syntax highlighting.
- What happens when importing an HTML file with unsupported elements (e.g., `<video>`, `<canvas>`)? Unsupported elements are stripped during import, with a console warning listing the dropped elements.

## Requirements *(mandatory)*

### Functional Requirements

#### Presets & Core Architecture

- **FR-001**: The integration MUST provide three pre-configured editor presets: **Bare**, **Docked**, and **Contextual**.
- **FR-002**: The **Bare** preset MUST render only a content-editable surface with no built-in UI controls.
- **FR-003**: The **Docked** preset MUST render a persistent toolbar with configurable groups: text formatting (bold, italic, underline, strikethrough, code), headings (configurable levels), lists (ordered, unordered, checklist), tables, block formatting (blockquote, code block, horizontal rule), links, and undo/redo.
- **FR-004**: The **Contextual** preset MUST display a floating toolbar on text selection with formatting controls and a slash-command palette on "/" input.
- **FR-005**: The Docked toolbar MUST allow showing/hiding individual toolbar groups via configuration.
- **FR-006**: Each official Lexical plugin MUST be exposed as an individually registerable plugin that can be added to any editor preset, following a composable architecture.

#### Slash Commands

- **FR-007**: The slash-command system MUST be available as a standalone plugin that can be registered with any editor preset.
- **FR-008**: The slash-command palette MUST support filtering by typing after "/".
- **FR-009**: The slash-command palette MUST be configurable - developers can define custom commands with labels, icons, descriptions, and handler functions.

#### Serialization & I/O

- **FR-010**: The editor MUST support Markdown, Lexical JSON state, and HTML as input and output formats.
- **FR-011**: The developer MUST be able to configure which format (Markdown, JSON, or HTML) is the default for value binding.
- **FR-012**: The editor MUST support file import and export, allowing content to be saved to and loaded from files in any supported format.

#### Form Integration

- **FR-013**: The editor MUST integrate with BeatUI's form system by extending the `InputOptions<string>` (for Markdown/HTML) or `InputOptions<object>` (for JSON) pattern.
- **FR-014**: The editor MUST support `onChange` (on blur/save) and `onInput` (on every edit) event callbacks, consistent with other BeatUI form inputs.
- **FR-015**: The editor MUST support read-only mode, rendering content as non-editable rich text.

#### Tables

- **FR-016**: The editor MUST support table insertion with configurable initial dimensions (rows and columns).
- **FR-017**: Tables MUST support adding and removing rows and columns, cell-level editing, and keyboard navigation (Tab/Shift+Tab between cells).
- **FR-018**: Tables MUST support cell merging and splitting.
- **FR-019**: Table cells MUST support rich text content (inline formatting, links, lists).
- **FR-020**: Nested tables MUST be supported as an opt-in configuration.

#### Code Blocks & Syntax Highlighting

- **FR-021**: The editor MUST support code blocks with a language selector.
- **FR-022**: Code blocks MUST support syntax highlighting for common programming languages.
- **FR-023**: The developer MUST be able to configure which languages are available and which syntax highlighting engine is used (standard or Shiki-based).

#### Hashtags & Auto-Linking

- **FR-024**: The editor MUST support automatic hashtag detection, styling `#word` patterns as visually distinct, interactive elements.
- **FR-025**: The editor MUST support automatic URL detection, converting typed URLs into clickable links.
- **FR-026**: Auto-link detection MUST be configurable with custom matchers (URL patterns, email patterns, custom schemes).

#### Marks & Annotations

- **FR-027**: The editor MUST support marks (annotations) that can be applied to text ranges with associated metadata.
- **FR-028**: Marks MUST be visually distinct and support hover/click interactions for accessing metadata.
- **FR-029**: Multiple overlapping marks on the same text range MUST be supported.

#### Character Limits

- **FR-030**: The editor MUST support configurable character limits with visual overflow indication.
- **FR-031**: When a character limit is configured, the editor MUST expose the current character count and remaining capacity.

#### History

- **FR-032**: The editor MUST support undo/redo with configurable history depth.
- **FR-033**: Undo/redo MUST be accessible via keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z) and programmatically via the command API.

#### Collaborative Editing

- **FR-034**: The editor MUST support real-time collaborative editing via a CRDT-based backend, with configurable connection provider.
- **FR-035**: Collaborative editing MUST display remote user cursors with distinct colors and name labels.
- **FR-036**: The editor MUST handle offline/reconnection scenarios, queuing and merging changes on reconnect.

#### Speech-to-Text

- **FR-037**: The editor MUST support speech-to-text input via Dragon NaturallySpeaking compatibility and browser speech recognition APIs.

#### Clipboard

- **FR-038**: The editor MUST handle paste events, sanitizing external HTML content into supported rich text nodes.
- **FR-039**: The editor MUST support copy operations that preserve rich text formatting in the clipboard (both HTML and plain text representations).

#### Selection & Text Utilities

- **FR-040**: The editor MUST expose selection utilities for programmatic selection manipulation (get, set, extend, collapse).
- **FR-041**: The editor MUST expose text utilities for programmatic text operations: find text by string or pattern, replace text, count characters and words, and case transformation (uppercase, lowercase). These wrap the `@lexical/text` API surface.

#### Headless / Server-Side

- **FR-042**: The integration MUST support a headless mode for server-side content processing (validation, transformation, serialization) without requiring a DOM environment.

#### Extension Framework

- **FR-043**: The integration MUST expose Lexical's extension framework, allowing developers to create and register custom nodes, commands, and transforms.
- **FR-044**: Custom node types MUST be registerable with serialization/deserialization handlers for all supported output formats.

#### Package & Export Structure

- **FR-045**: All Lexical editor components MUST be exported exclusively from a dedicated `@tempots/beatui/lexical` entry point, separate from the main `@tempots/beatui` export. No Lexical-related code may be re-exported from the main entry point.
- **FR-046**: The editor MUST be lazy-loaded - Lexical packages are only imported when the editor component mounts.
- **FR-047**: The editor MUST properly clean up all resources (editor instance, event listeners, plugins, collaboration connections) when unmounted.

#### Accessibility

- **FR-048**: All editor UI controls (toolbars, floating menus, command palettes, table context menus) MUST be fully keyboard-navigable with visible focus indicators.
- **FR-049**: All interactive elements MUST have appropriate WAI-ARIA roles, labels, and states (e.g., `role="toolbar"`, `aria-pressed` for toggle buttons, `role="listbox"` for command palette).
- **FR-050**: Focus MUST be managed correctly when floating elements (toolbar, command palette) appear and dismiss - focus returns to the editor after dismissal.
- **FR-051**: The editor MUST meet WCAG 2.1 Level AA compliance for all UI components including color contrast, text sizing, and target sizes.

#### Theme Integration

- **FR-052**: The editor MUST integrate with BeatUI's theme system, automatically adapting to light and dark modes.
- **FR-053**: All editor sub-components (toolbars, floating menus, command palettes, tables, code blocks) MUST respect the current theme.

#### Localization

- **FR-054**: All user-facing text in the editor (toolbar tooltips, slash-command labels, placeholder text, ARIA labels, error messages) MUST be localized using BeatUI's i18n system via a dedicated `LexicalI18n` provider created with `makeI18nProvider()`.
- **FR-055**: The `LexicalI18n` provider MUST ship with default English messages and support the same 19 locales as the existing BeatUI and Auth i18n providers (en, es, fr, de, it, pt, ja, zh, ko, ru, ar, nl, pl, tr, vi, hi, fa, he, ur).
- **FR-056**: All editor UI components MUST respect RTL/LTR direction from BeatUI's `Locale` provider, including toolbar layout, floating toolbar positioning, slash-command palette alignment, and table directionality.
- **FR-057**: Developers MUST be able to override individual translation keys by providing custom messages to the `LexicalI18n` provider, following the same pattern as `BeatUII18n` and `AuthI18n`.

#### Feature Configuration

- **FR-058**: The editor MUST support a configurable feature set, allowing developers to enable or disable individual plugins (tables, code blocks, hashtags, marks, auto-link, character limits, collaboration, speech-to-text) independently. Every preset's default plugin set is fully overrideable.
- **FR-059**: The **Docked** and **Contextual** presets MUST enable these plugins by default: rich text, lists, links, code blocks, tables, history, clipboard, and auto-link. Developers can disable any of these or enable additional plugins (hashtags, marks, character limits, collaboration, speech-to-text).
- **FR-060**: The **Bare** preset MUST enable only the minimum set by default: rich text, history, and clipboard. All other plugins are opt-in.
- **FR-061**: The floating toolbar in Contextual mode MUST position itself intelligently relative to the selection, avoiding viewport overflow.

### Key Entities

- **Editor Preset**: A pre-configured combination of editor plugins and UI components (Bare, Docked, Contextual). Defines which features and UI elements are active.
- **Editor Plugin**: A composable unit of functionality corresponding to an official Lexical package that can be registered with any editor instance. Plugins extend the editor's capabilities (formatting, tables, code highlighting, collaboration, etc.).
- **Toolbar Group**: A logical grouping of related toolbar actions (e.g., "Text Formatting" contains bold, italic, underline). Groups can be individually shown or hidden.
- **Slash Command**: A user-invokable action triggered by typing "/" in the editor. Defined by a label, optional icon, description, and handler function.
- **Content Format**: The serialization format for editor content - Markdown (string), Lexical JSON (structured object), or HTML (string).
- **Table Node**: A structured content node containing rows and cells, each cell supporting rich text content. Supports operations like add/remove row/column, merge/split cells.
- **Code Block Node**: A block-level node that renders code with syntax highlighting. Associated with a language identifier and a highlighting engine.
- **Hashtag Node**: An inline node that represents a `#word` pattern, rendered with distinct styling and interactive behavior.
- **Mark Node**: An annotation applied to a text range with associated metadata (author, comment, timestamp). Visually rendered as a highlight.
- **Collaboration Session**: A real-time synchronization context connecting multiple editor instances to a shared document state via a CRDT provider.
- **Lexical I18n Provider**: A localization provider (`LexicalI18n`) created via `makeI18nProvider()` that supplies translated strings for all editor UI text. Follows the same pattern as `BeatUII18n` and `AuthI18n` with locale files per supported language.

## Official Lexical Plugin Coverage

The following table maps every official Lexical package to its integration status in this specification:

| Official Package | Category | Coverage | Relevant FRs |
|------------------|----------|----------|---------------|
| `lexical` (core) | Core | Full | FR-001, FR-006 |
| `@lexical/rich-text` | Core | Full | FR-001 - FR-005 |
| `@lexical/plain-text` | Core | Full | FR-002, FR-054 |
| `@lexical/history` | Core | Full | FR-032, FR-033 |
| `@lexical/list` | Content Nodes | Full | FR-003, FR-004 |
| `@lexical/table` | Content Nodes | Full | FR-016 - FR-020 |
| `@lexical/link` | Content Nodes | Full | FR-003, FR-025, FR-026 |
| `@lexical/code` | Content Nodes | Full | FR-021, FR-022 |
| `@lexical/code-shiki` | Content Nodes | Full | FR-023 |
| `@lexical/hashtag` | Content Nodes | Full | FR-024 |
| `@lexical/mark` | Content Nodes | Full | FR-027 - FR-029 |
| `@lexical/overflow` | Content Nodes | Full | FR-030, FR-031 |
| `@lexical/markdown` | Serialization | Full | FR-010 - FR-012 |
| `@lexical/html` | Serialization | Full | FR-010 - FR-012 |
| `@lexical/file` | Serialization | Full | FR-012 |
| `@lexical/clipboard` | Utilities | Full | FR-038, FR-039 |
| `@lexical/selection` | Utilities | Full | FR-040 |
| `@lexical/text` | Utilities | Full | FR-041 |
| `@lexical/offset` | Utilities | Full | FR-040 |
| `@lexical/utils` | Utilities | Full | Internal use |
| `@lexical/extension` | Framework | Full | FR-043, FR-044 |
| `@lexical/headless` | Server-Side | Full | FR-042 |
| `@lexical/yjs` | Collaboration | Full | FR-034 - FR-036 |
| `@lexical/dragon` | Accessibility | Full | FR-037 |
| `@lexical/react` | Framework Binding | Not applicable | BeatUI uses vanilla JS |
| `@lexical/devtools` | Dev Tooling | Not applicable | Browser extension, not a library integration |
| `@lexical/devtools-core` | Dev Tooling | Not applicable | Internal to devtools |
| `@lexical/eslint-plugin` | Dev Tooling | Not applicable | Developer linting, not runtime |
| `@lexical/tailwind` | Styling | Not applicable | BeatUI uses its own CSS/token system |
| `lexical-playground` | Demo | Not applicable | Reference app, not a library |
| `lexical-website` | Docs | Not applicable | Documentation site |
| `shared` | Internal | Not applicable | Internal utilities |

## Clarifications

### Session 2026-02-03

- Q: Which plugins should be enabled by default in each preset? → A: Docked and Contextual enable common plugins by default (rich text, lists, links, code blocks, tables, history, clipboard, auto-link); Bare enables only rich text + history + clipboard. All presets are fully overrideable.
- Q: What level of keyboard accessibility should editor UI controls meet? → A: Full WCAG 2.1 AA compliance: all UI controls keyboard-navigable, ARIA roles/labels, focus management for floating elements.
- Q: What is the minimum browser support? → A: Modern evergreen browsers only (Chrome, Firefox, Safari, Edge latest 2 versions). No IE11 or legacy mobile browsers.

## Assumptions

- Lexical's core package (`lexical`) provides a framework-agnostic API suitable for integration without React bindings. The integration will use `createEditor()` and register plugins manually (vanilla JS approach).
- The `@lexical/markdown` package provides adequate Markdown serialization/deserialization for standard Markdown features (headings, bold, italic, links, lists, code blocks, blockquotes, horizontal rules, tables).
- The `@lexical/html` package provides adequate HTML import/export for standard semantic HTML elements.
- BeatUI's existing `LinkPortal` pattern for CSS injection will be used for Lexical-specific styles.
- The integration targets Lexical v0.40+ and will track the latest stable release.
- The slash-command palette UI will be implemented as a BeatUI component (not using Lexical's React-based floating menu), ensuring visual consistency with the rest of the design system.
- Collaborative editing requires the consuming application to provide a CRDT backend (e.g., a Yjs WebSocket server). The BeatUI integration provides the client-side bindings but not the server infrastructure.
- The `@lexical/dragon` integration depends on Dragon NaturallySpeaking being installed on the user's system; the editor provides compatibility hooks but not the speech engine itself.
- Syntax highlighting via Shiki (`@lexical/code-shiki`) is offered as an alternative to the default highlighting engine and may carry a larger bundle size. It is opt-in.
- Browser support targets modern evergreen browsers only (Chrome, Firefox, Safari, Edge - latest 2 major versions). IE11 and legacy mobile browsers are not supported. This aligns with Lexical's own browser support matrix and BeatUI's ES2020 target.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can mount a fully functional Bare editor with fewer than 5 lines of configuration code.
- **SC-002**: A developer can mount a fully functional Docked editor with a single component import and default options.
- **SC-003**: The Contextual editor's floating toolbar appears within 150ms of text selection.
- **SC-004**: Content round-trips between Markdown, HTML, and the editor without loss of supported formatting (bold, italic, headings, lists, links, code, blockquotes, tables).
- **SC-005**: The editor's initial bundle loads lazily - zero Lexical code is included in the main application bundle until the editor component mounts.
- **SC-006**: Theme switching between light and dark mode reflects in the editor within the same render cycle as the rest of the BeatUI application.
- **SC-007**: All three presets (Bare, Docked, Contextual) can be imported independently - importing one does not bundle the others.
- **SC-008**: The editor integrates with BeatUI's form system - it can be used inside a form with validation, error states, and value binding like any other BeatUI form input.
- **SC-009**: Every official Lexical feature package (24 of 33 total packages; excluding 9 non-applicable packages) has a corresponding BeatUI plugin wrapper with full API surface coverage.
- **SC-010**: The integration supports all 19 BeatUI locales for every user-facing string in the editor UI.
