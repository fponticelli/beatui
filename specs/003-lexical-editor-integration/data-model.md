# Data Model: Lexical Editor Integration

**Feature**: 003-lexical-editor-integration
**Date**: 2026-02-03
**Phase**: 1 - Design & Contracts

## Entities

### EditorPreset

Represents a pre-configured editor mode that determines which plugins and UI components are active.

| Field | Type | Description |
|-------|------|-------------|
| type | `'bare' \| 'docked' \| 'contextual'` | The preset type |
| plugins | `LexicalPlugin[]` | Active plugins for this preset |
| defaultPlugins | `LexicalPlugin[]` | Plugins enabled by default (overrideable) |
| nodes | `LexicalNodeClass[]` | Computed from active plugins |

**Default plugin sets**:
- Bare: `[richText, history, clipboard]`
- Docked: `[richText, history, clipboard, list, link, autoLink, code, table]`
- Contextual: `[richText, history, clipboard, list, link, autoLink, code, table, slashCommands]`

### LexicalPlugin

A composable unit of functionality that wraps an official `@lexical/*` package.

| Field | Type | Description |
|-------|------|-------------|
| name | `string` | Plugin identifier (e.g., `'rich-text'`, `'table'`) |
| nodes | `LexicalNodeClass[]` | Node types this plugin requires |
| register | `(editor: LexicalEditor) => () => void` | Registration function, returns unsubscribe |
| options | `Record<string, unknown>` | Plugin-specific configuration |

**Lifecycle**: Created → Registered (on editor mount) → Active → Unregistered (on editor unmount)

### ToolbarGroup

A logical grouping of related toolbar actions.

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Group identifier (e.g., `'text-formatting'`, `'headings'`) |
| label | `string` | Localized display label |
| items | `ToolbarItem[]` | Actions in this group |
| visible | `boolean` | Whether this group is shown |

**Standard groups (Docked preset)**:
1. `text-formatting`: Bold, Italic, Underline, Strikethrough, Code
2. `headings`: H1, H2, H3 (configurable levels)
3. `lists`: Ordered, Unordered, Checklist
4. `blocks`: Blockquote, Code Block, Horizontal Rule
5. `tables`: Insert Table
6. `links`: Insert/Edit Link
7. `history`: Undo, Redo

### ToolbarItem

A single toolbar action (button or dropdown).

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Item identifier |
| label | `string` | Localized label (used as tooltip) |
| icon | `TNode \| undefined` | Icon renderable |
| active | `Signal<boolean>` | Whether the format is currently active |
| disabled | `Signal<boolean>` | Whether the action is available |
| command | `LexicalCommand<unknown>` | Command to dispatch on click |
| type | `'button' \| 'toggle' \| 'dropdown'` | Interaction type |

### SlashCommand

A user-invokable action triggered by typing "/" in the editor.

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Command identifier |
| label | `string` | Localized display label |
| description | `string \| undefined` | Localized description text |
| icon | `TNode \| undefined` | Icon renderable |
| keywords | `string[]` | Search/filter keywords |
| handler | `(editor: LexicalEditor) => void` | Execution function |
| category | `string \| undefined` | Grouping category |

**Default commands (Contextual preset)**:
- Text: Paragraph
- Headings: H1, H2, H3
- Lists: Bullet List, Numbered List, Checklist
- Blocks: Blockquote, Code Block, Horizontal Rule
- Tables: Insert Table
- (extensible with custom commands)

### ContentFormat

The serialization format for editor content.

| Field | Type | Description |
|-------|------|-------------|
| type | `'markdown' \| 'json' \| 'html'` | Format identifier |
| serialize | `(editor: LexicalEditor) => string \| object` | Export function |
| deserialize | `(editor: LexicalEditor, content: string \| object) => void` | Import function |

### MarkMetadata

Metadata associated with a Mark (annotation) node.

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Unique mark identifier |
| type | `string` | Mark category (e.g., `'comment'`, `'highlight'`) |
| data | `Record<string, unknown>` | Arbitrary metadata (author, timestamp, text, etc.) |

### CollaborationConfig

Configuration for real-time collaborative editing.

| Field | Type | Description |
|-------|------|-------------|
| doc | `Y.Doc` | Yjs document instance |
| provider | `Provider` | Yjs transport provider (WebSocket, WebRTC, etc.) |
| user | `CollaborationUser` | Current user identity |
| cursorsContainer | `HTMLElement \| undefined` | Container for remote cursor rendering |

### CollaborationUser

Identity of a collaborative editing participant.

| Field | Type | Description |
|-------|------|-------------|
| name | `string` | Display name |
| color | `string` | Cursor/selection color |

### LexicalEditorMessages

Translation message keys for the `LexicalI18n` provider.

| Category | Keys | Example |
|----------|------|---------|
| toolbar | `bold`, `italic`, `underline`, `strikethrough`, `code`, `heading1`-`heading6`, `bulletList`, `numberedList`, `checklist`, `blockquote`, `codeBlock`, `horizontalRule`, `insertTable`, `insertLink`, `undo`, `redo` | `"Bold"` / `"Negrita"` |
| slashCommands | `paragraph`, `heading1`-`heading3`, `bulletList`, `numberedList`, `checklist`, `blockquote`, `codeBlock`, `horizontalRule`, `insertTable` | `"Heading 1"` / `"Titre 1"` |
| table | `insertRow`, `insertColumn`, `deleteRow`, `deleteColumn`, `mergeCells`, `splitCell` | `"Insert Row"` / `"Insertar fila"` |
| code | `selectLanguage`, `plainText` | `"Select language"` / `"Seleccionar idioma"` |
| editor | `placeholder`, `characterCount`, `charactersRemaining` | `"Start typing..."` / `"Empezar a escribir..."` |
| link | `editLink`, `urlLabel`, `openInNewTab`, `removeLink` | `"Edit link"` / `"Editar enlace"` |

## Relationships

```text
EditorPreset 1───* LexicalPlugin
EditorPreset 1───* ToolbarGroup (Docked only)
ToolbarGroup  1───* ToolbarItem
LexicalPlugin *───* LexicalNodeClass (computed)
EditorPreset  1───1 ContentFormat (default)
EditorPreset  0..1─1 CollaborationConfig (optional)
MarkMetadata  *───1 MarkNode (via id)
```

## State Transitions

### Editor Lifecycle
```
Unmounted → Mounting (lazy load) → Mounted (active) → Unmounting (cleanup) → Unmounted
```

### Floating Toolbar
```
Hidden → Detecting Selection → Visible → Dismissed
         ↑_________________________________|
```

### Slash Command Palette
```
Hidden → Detecting "/" → Visible (filtering) → Command Selected → Hidden
                          ↑_____________________|
                          |
                          → Dismissed (Escape/click outside) → Hidden
```

### Collaboration Session
```
Disconnected → Connecting → Connected (syncing) → Disconnected (offline)
                                ↑__________________________|
```
