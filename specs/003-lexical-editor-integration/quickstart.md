# Quickstart: Lexical Editor Integration

**Feature**: 003-lexical-editor-integration

## Installation

The Lexical editor is included in `@tempots/beatui`. No additional packages needed unless using collaboration.

```bash
# Already installed with BeatUI
pnpm add @tempots/beatui

# For collaborative editing only:
pnpm add yjs y-websocket
```

## Bare Editor (Headless, No UI)

Minimal editor surface with no built-in controls. Maximum flexibility.

```typescript
import { BareEditor } from '@tempots/beatui/lexical'
import { prop } from '@tempots/dom'

const content = prop('# Hello World\n\nStart editing...')

BareEditor({
  value: content,
  format: 'markdown',
  onInput: (md) => console.log('Content:', md),
})
```

## Docked Editor (Full Toolbar)

Traditional WYSIWYG editor with a persistent toolbar. Ready to use out of the box.

```typescript
import { DockedEditor } from '@tempots/beatui/lexical'
import { prop } from '@tempots/dom'

const content = prop('')

DockedEditor({
  value: content,
  format: 'markdown',
  onChange: (md) => saveToServer(md),
})
```

### Customizing the toolbar

```typescript
DockedEditor({
  value: content,
  toolbar: {
    hiddenGroups: ['tables', 'history'],
    maxHeadingLevel: 2,
  },
})
```

## Contextual Editor (Floating Controls)

Clean editing surface with floating toolbar on selection and slash commands.

```typescript
import { ContextualEditor } from '@tempots/beatui/lexical'
import { prop } from '@tempots/dom'

const content = prop('')

ContextualEditor({
  value: content,
  format: 'markdown',
  placeholder: 'Type "/" for commands...',
  onChange: (md) => saveToServer(md),
})
```

### Custom slash commands

```typescript
ContextualEditor({
  value: content,
  slashCommands: {
    commands: [
      {
        id: 'callout',
        label: 'Callout',
        description: 'Insert a callout block',
        keywords: ['info', 'warning', 'note'],
        handler: (editor) => {
          // Insert custom node
        },
      },
    ],
  },
})
```

## Form Integration

Use the editor as a form input with validation and error states.

```typescript
import { LexicalEditorInput } from '@tempots/beatui/lexical'
import { InputControl } from '@tempots/beatui'

InputControl(
  {
    label: 'Description',
    error: descriptionError,
    hint: 'Supports Markdown formatting',
  },
  LexicalEditorInput({
    value: description,
    format: 'markdown',
    onChange: (md) => validateDescription(md),
  })
)
```

## Plugin Configuration

Enable or disable features per editor instance.

```typescript
DockedEditor({
  value: content,
  plugins: {
    table: true,
    code: { languages: ['javascript', 'typescript', 'python', 'go'] },
    hashtag: { onHashtagClick: (tag) => navigateToTag(tag) },
    autoLink: true,
    overflow: { maxLength: 5000, onOverflow: (over) => setWarning(over) },
    mark: true,
  },
  marks: {
    onMarkClick: (id, meta) => showCommentThread(id),
  },
})
```

## Multi-Format Output

Read content in any supported format.

```typescript
const editor = prop<LexicalEditor | null>(null)

BareEditor({
  value: content,
  format: 'json',
  onReady: (e) => editor.value = e,
})

// Later: read content in different formats
editor.value?.update(() => {
  const markdown = $convertToMarkdownString(TRANSFORMERS)
  const html = $generateHtmlFromNodes(editor.value!, null)
  const json = editor.value!.getEditorState().toJSON()
})
```

## Read-Only Mode

Render content as non-editable rich text.

```typescript
DockedEditor({
  value: content,
  readOnly: true,
})
```

## Theme Integration

The editor automatically adapts to BeatUI's light/dark theme. No configuration needed.

```typescript
// Theme is inherited from the BeatUI provider
Provide(Theme, { appearance: 'dark' },
  DockedEditor({ value: content })
)
```

## Localization

Editor UI text is automatically localized via BeatUI's locale system.

```typescript
import { Provide } from '@tempots/dom'
import { Locale } from '@tempots/beatui'

// Editor text follows the active locale
Provide(Locale, {},
  DockedEditor({ value: content })
)
```

## Headless (Server-Side)

Process editor content on the server without a DOM.

```typescript
import { createHeadlessEditor } from '@tempots/beatui/lexical'

const editor = createHeadlessEditor()

// Load JSON state and convert to markdown
editor.setEditorState(editor.parseEditorState(jsonFromDB))
editor.update(() => {
  const markdown = $convertToMarkdownString(TRANSFORMERS)
  return markdown
})
```

## Collaborative Editing

Enable real-time collaboration (requires `yjs` and a provider).

```typescript
import { DockedEditor } from '@tempots/beatui/lexical'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const ydoc = new Y.Doc()
const provider = new WebsocketProvider('wss://collab.example.com', 'room-123', ydoc)

DockedEditor({
  value: content,
  plugins: {
    yjs: {
      doc: ydoc,
      provider,
      user: { name: 'Alice', color: '#ff6b6b' },
    },
  },
})
```
