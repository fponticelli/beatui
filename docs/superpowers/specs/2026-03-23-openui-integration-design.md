# OpenUI Lang Integration for BeatUI

**Date**: 2026-03-23
**Status**: Approved
**Entry point**: `@tempots/beatui/openui`

## Overview

A Tempo-native OpenUI Lang renderer that lets LLMs generate live BeatUI interfaces. An LLM receives a system prompt describing the BeatUI component library, streams back OpenUI Lang markup, and a parser + renderer turns that into reactive BeatUI components — no React dependency.

## Architecture

Three layers, each independently testable and reusable:

```
┌─────────────────────────────────────────────┐
│  Streaming Adapters (fromSSE, fromFetch, …) │
│  → produce Signal<string>                   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  OpenUIRenderer (Tempo component)           │
│  ├── Streaming parser (incremental)         │
│  ├── Node resolver (AST → Renderable)       │
│  ├── Skeleton placeholders (forward refs)   │
│  └── Action context (callback + signal)     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Component Library                          │
│  ├── beatuiLibrary (all components)         │
│  ├── defineComponent (Zod + Tempo renderer) │
│  ├── createLibrary (registry + .prompt())   │
│  └── .extend() for custom components        │
└─────────────────────────────────────────────┘
```

## File Structure

```
packages/beatui/src/openui/
├── index.ts                    # Entry point: re-exports public API
├── parser/
│   ├── tokenizer.ts            # Line-oriented lexer
│   ├── parser.ts               # Tokenized lines → AST (ParseResult)
│   ├── streaming-parser.ts     # Incremental parser for streaming
│   └── types.ts                # AST node types, ParseResult, errors
├── library/
│   ├── define-component.ts     # defineComponent()
│   ├── library.ts              # createLibrary()
│   ├── types.ts                # Library, DefinedComponent, ComponentGroup types
│   └── prompt-generator.ts     # Generates LLM system prompt from library definition
├── registry/
│   ├── index.ts                # beatuiLibrary — all pre-registered BeatUI components
│   ├── layout.ts               # Stack, Flex, Card, Divider, Accordion, etc.
│   ├── button.ts               # Button, ToggleButton, CopyButton, etc.
│   ├── data.ts                 # DataTable, Avatar, Badge, StatCard, ProgressBar, etc.
│   ├── form.ts                 # TextInput, NumberInput, Select, DatePicker, etc.
│   ├── navigation.ts           # Tabs, Breadcrumbs, Pagination, Stepper, etc.
│   ├── overlay.ts              # Modal, Drawer, Tooltip, Popover, etc.
│   ├── format.ts               # FormatNumber, FormatDate, etc.
│   └── typography.ts           # Kbd, Label, etc.
├── renderer/
│   ├── openui-renderer.ts      # OpenUIRenderer Tempo component
│   ├── node-resolver.ts        # AST node → Tempo Renderable resolution
│   ├── skeleton.ts             # Placeholder for unresolved forward references
│   └── action-context.ts       # Action dispatch (callback + signal)
└── streaming/
    ├── from-sse.ts             # SSE → Value<string> adapter
    ├── from-fetch.ts           # fetch ReadableStream → Value<string>
    └── from-websocket.ts       # WebSocket → Value<string>
```

## Layer 1: Parser

Pure functions. No DOM dependency. The parser accepts an optional `ComponentNameChecker` interface (not the full `Library` type) to validate component names without creating an upward dependency on Layer 2.

```ts
interface ComponentNameChecker {
  has(name: string): boolean
}
```

### OpenUI Lang grammar

```
statement     := identifier "=" expression
expression    := component | string | number | boolean | null | array | object | reference
component     := TypeName "(" args ")"
args          := expression ("," expression)*
array         := "[" (expression ("," expression)*)? "]"
object        := "{" (key ":" expression ("," key ":" expression)*)? "}"
string        := '"' chars '"'    // supports JSON escape sequences: \", \\, \n, \t, \r, \uXXXX
reference     := identifier
```

Strings support standard JSON escape sequences (`\"`, `\\`, `\n`, `\t`, `\r`, `\uXXXX`). Multi-line strings are not supported — each statement occupies a single line. A component call's arguments may span multiple lines if a line ends with an incomplete expression (open paren, bracket, or brace).

### AST types

```ts
type ASTNode =
  | { type: 'component'; name: string; args: ASTNode[] }
  | { type: 'string'; value: string }
  | { type: 'number'; value: number }
  | { type: 'boolean'; value: boolean }
  | { type: 'null' }
  | { type: 'array'; items: ASTNode[] }
  | { type: 'object'; entries: Record<string, ASTNode> }
  | { type: 'reference'; name: string }

interface Statement {
  value: ASTNode
}

interface ParseResult {
  root: ASTNode | null
  statements: Map<string, Statement>
  meta: {
    incomplete: boolean
    unresolved: string[]
    statementCount: number
    errors: ParseError[]
  }
}

interface ParseError {
  line: number
  message: string
  code: 'syntax' | 'unknown-component' | 'validation'
}
```

### Two parser modes

- **`createParser(checker?)`** — Synchronous, full-text. For non-streaming use (cached responses). Accepts an optional `ComponentNameChecker` for component name validation.
- **`createStreamingParser(checker?)`** — Incremental. `push(chunk)` as text arrives, `getResult()` at any point. Each `push` returns a `ParseResult`. The checker parameter is optional; when provided, the parser validates component names, populating `meta.errors` for unknown components.

Note: Arg count validation against Zod schemas happens in the renderer layer (Layer 4), not the parser. The parser only checks component name existence.

## Layer 2: Component Library

### defineComponent

```ts
interface DefinedComponent<T extends z.ZodObject<any> = z.ZodObject<any>> {
  name: string
  props: T
  description: string
  renderer: (props: z.infer<T>, children: Renderable[]) => Renderable
}

function defineComponent<T extends z.ZodObject<any>>(config: {
  name: string
  props: T
  description: string
  renderer: (props: z.infer<T>, children: Renderable[]) => Renderable
}): DefinedComponent<T>
```

Zod schema key order defines positional argument mapping (matching OpenUI convention). **This is an explicit contract**: the insertion order of keys in `z.object()` IS the positional argument order. Reordering schema fields changes the positional mapping and will break existing LLM prompts. Reactive wrappers (`Value<T>`) are handled by the renderer layer; Zod schemas describe plain values.

### createLibrary

```ts
interface Library {
  readonly components: ReadonlyMap<string, DefinedComponent>
  /** Default root component name. When the LLM's first statement is `root = ...`,
   *  this determines the expected wrapper component. Defaults to 'Stack'. */
  readonly root: string | undefined

  get(name: string): DefinedComponent | undefined
  has(name: string): boolean
  prompt(options?: PromptOptions): string
  /** Export all component Zod schemas as JSON Schema objects — useful for
   *  function-calling / tool-use LLM patterns as an alternative to OpenUI Lang. */
  toJSONSchema(): object
  extend(config: { components?: DefinedComponent[]; root?: string }): Library
}

interface PromptOptions {
  examples?: boolean
  additionalRules?: string[]
  groups?: ComponentGroup[]
}

interface ComponentGroup {
  name: string
  description: string
  components: string[]
}

function createLibrary(config: {
  components: DefinedComponent[]
  root?: string
  groups?: ComponentGroup[]
}): Library
```

`extend()` lets consumers add custom components on top of `beatuiLibrary`.

### Prompt generation

`library.prompt()` produces a system prompt describing all components with their schemas, grouped and formatted for LLM consumption.

## Layer 3: Component Registry

### beatuiLibrary

Pre-registers all BeatUI components suitable for LLM generation, organized by category:

- **Layout**: Stack, Flex, Card, Divider, Accordion, Center, Group, Collapse
- **Button**: Button, ToggleButton, CopyButton, CloseButton, ToggleButtonGroup
- **Data Display**: StatCard, Badge, AutoColorBadge, Avatar, AvatarGroup, ProgressBar, DataTable, Skeleton, Indicator, HistoryTimeline, Icon
- **Form**: TextInput, NumberInput, PasswordInput, EmailInput, TextArea, CheckboxInput, Switch, RadioGroup, NativeSelect, DropdownInput, ComboboxInput, DatePicker, TimePicker, RatingInput, SliderInput, ColorInput, TagInput, OTPInput, SegmentedInput
- **Navigation**: Tabs, Breadcrumbs, Pagination, Stepper, TreeView, Sidebar
- **Overlay**: Modal, Drawer, Tooltip, Popover
- **Format**: FormatNumber, FormatDate, FormatTime, FormatDateTime, FormatRelativeTime, FormatFileSize
- **Typography**: Kbd, Label

### Excluded components

Infrastructure/provider components not suitable for LLM generation: `Theme`, `Locale`, `NotificationProvider`, `AppShell`, `BeatUI`, `WithBreakpoint`, `Spotlight`, `BlockCommandPalette`, editor integrations (Lexical, Monaco, ProseMirror). Available via `extend()` if needed.

### Mapping strategy

Each component's Zod schema is a simplified projection of the full BeatUI options — only props meaningful for LLM generation. The renderer layer wraps plain values into static `Value<T>` when calling actual BeatUI components.

## Layer 4: Renderer

### OpenUIRenderer

```ts
interface OpenUIRendererOptions {
  library: Library
  response: Value<string>
  isStreaming?: Value<boolean>
  onAction?: (event: ActionEvent) => void
  onError?: (errors: ParseError[]) => void
  onComplete?: () => void
  initialState?: Record<string, unknown>
  className?: Value<string>
  /** Show warning notices for unknown components / parse errors. Default: false. */
  debug?: boolean
}

function OpenUIRenderer(options: OpenUIRendererOptions): Renderable
```

### Rendering pipeline

1. **Parse** — Creates a streaming parser internally. On each `response` change, calls `push(newChunk)` for an updated `ParseResult`.
2. **Resolve** — Walks the AST. For each `component` node, looks up the `DefinedComponent`, validates positional args against Zod schema, calls the `renderer` with parsed props.
3. **Forward references** — The resolver maintains a `Map<string, Signal<Renderable>>` for all references. Unresolved references start as `Skeleton` placeholders. Each reference slot is rendered via `MapSignal(slot, identity)` inside an `html.div` wrapper (never at root — per Tempo convention). When the defining statement arrives, the signal is `.set()` to the resolved component, and `MapSignal` swaps the skeleton for the real content.
4. **Reactivity** — The initial implementation re-renders the full tree on each `ParseResult` update. This is acceptable for streaming UI generation where the tree is built incrementally and parse results arrive at LLM token speed (~60 tokens/sec). Future optimization: per-statement signals that only update changed subtrees.
5. **Disposal** — Rendered components can rely on Tempo's `OnDispose` for cleanup. When a `MapSignal` updates (e.g., forward ref resolution), the previous `Renderable` is automatically disposed by Tempo. When the `OpenUIRenderer` itself unmounts, all child components are disposed.
6. **Completion** — When `isStreaming` transitions to `false`, any still-unresolved forward references are replaced with an `EmptyState` (or removed) and `onComplete` fires. Permanently unresolved references indicate an incomplete LLM response.

### Action dispatch

```ts
type ActionEvent = ButtonAction | FormSubmitAction

interface ButtonAction {
  kind: 'button'
  type: string
  params: Record<string, unknown>
  humanFriendlyMessage: string
}

interface FormSubmitAction {
  kind: 'form'
  type: string
  formName: string
  formState: Record<string, unknown>
  humanFriendlyMessage: string
}

interface ActionContext {
  onAction?: (event: ActionEvent) => void
  actions: Signal<ActionEvent[]>
}
```

Provided to all rendered components via a Tempo provider. Buttons with `actionType` and form submissions dispatch through this context — both the callback fires and the signal updates.

### Error handling

- **Unknown component names** — Rendered as a warning `Notice` when `debug: true`, silently skipped otherwise. Errors reported via `onError` callback.
- **Zod validation failures** — Component renders with valid props, invalid props fall back to defaults. Errors available in `ParseResult.meta.errors` and reported via `onError`.
- **Malformed lines** — Skipped, error recorded in `meta.errors` and reported via `onError`.

## Layer 5: Streaming Adapters

Optional helpers producing `Signal<string>` from common streaming sources. Adapters return `Signal<string>` (mutable reactive), which is assignable to `Value<string>` (the supertype accepted by `OpenUIRenderer`). This means the renderer also accepts static strings for non-streaming use (e.g., cached responses).

```ts
interface StreamOptions {
  onComplete?: () => void
  onError?: (error: Error) => void
  extractContent?: (chunk: unknown) => string
}

function fromSSE(url: string, options?: StreamOptions & EventSourceInit): {
  response: Signal<string>
  isStreaming: Signal<boolean>
  abort: () => void
}

function fromFetch(input: RequestInfo, init?: RequestInit, options?: StreamOptions): {
  response: Signal<string>
  isStreaming: Signal<boolean>
  abort: () => void
}

function fromWebSocket(url: string, options?: StreamOptions & { protocols?: string[] }): {
  response: Signal<string>
  isStreaming: Signal<boolean>
  close: () => void
  send: (data: string) => void
}
```

The `extractContent` option handles protocol differences (e.g., extracting delta content from OpenAI's SSE JSON chunks).

## Public API Surface

```ts
// Parser
export { createParser, createStreamingParser }
export type { ParseResult, ParseError, ASTNode, Statement }

// Library
export { defineComponent, createLibrary }
export type { DefinedComponent, Library, ComponentGroup, PromptOptions }

// Pre-built registry
export { beatuiLibrary }

// Renderer
export { OpenUIRenderer }
export type { OpenUIRendererOptions, ActionEvent, ActionContext }

// Streaming adapters
export { fromSSE, fromFetch, fromWebSocket }
export type { StreamOptions }
```

## Dependencies

- **Runtime**: `zod` (peer dependency)
- **Peer**: `@tempots/dom`, `@tempots/ui`, `@tempots/std` (same as main library)
- **No React dependency**

## Build Configuration

Specific changes required:

1. **`vite.config.ts`** — Add `openui: resolve(__dirname, 'src/openui/index.ts')` to the `entry` object
2. **`vite.config.ts`** — Add `'openui'` to the `fileName` function's entry name check (line ~148)
3. **`vite.config.ts`** — Add `if (id === 'zod' || id.startsWith('zod/')) return true` to `rollupOptions.external`
4. **`vite.config.ts`** — Add `'src/openui/**'` to coverage exclusions
5. **`package.json`** — Add `./openui` export block following existing pattern:
   ```json
   "./openui": {
     "types": "./dist/types/openui/index.d.ts",
     "import": "./dist/openui/index.es.js",
     "require": "./dist/openui/index.cjs.js",
     "default": "./dist/openui/index.es.js"
   }
   ```
6. **`package.json`** — Add `zod` to `peerDependencies` and `peerDependenciesMeta` (optional)

## End-to-End Usage

```ts
import { beatuiLibrary, OpenUIRenderer, fromFetch } from '@tempots/beatui/openui'
import { BeatUI } from '@tempots/beatui'

const systemPrompt = beatuiLibrary.prompt({ examples: true })

const stream = fromFetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Show me a dashboard with revenue stats' },
    ],
  }),
}, {
  extractContent: (chunk) => { /* parse streaming format */ },
})

BeatUI(
  { enableAppearance: true },
  OpenUIRenderer({
    library: beatuiLibrary,
    response: stream.response,
    isStreaming: stream.isStreaming,
    onAction: (event) => {
      console.log('User action:', event.type, event.params)
    },
  }),
)
```

### Custom component extension

```ts
import { beatuiLibrary, defineComponent, OpenUIRenderer } from '@tempots/beatui/openui'
import { z } from 'zod'

const MyChart = defineComponent({
  name: 'RevenueChart',
  props: z.object({
    labels: z.array(z.string()),
    values: z.array(z.number()),
    color: z.string().optional(),
  }),
  description: 'Line chart showing revenue over time.',
  renderer: (props) => /* custom chart component */,
})

const myLibrary = beatuiLibrary.extend({ components: [MyChart] })
const systemPrompt = myLibrary.prompt()
```
