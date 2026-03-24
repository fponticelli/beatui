# OpenUI Lang Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `@tempots/beatui/openui` — a Tempo-native OpenUI Lang parser, component library system, and renderer that lets LLMs generate live BeatUI interfaces.

**Architecture:** Three independent layers (parser → library → renderer) plus streaming adapters. The parser is pure functions with no DOM dependency. The library layer maps Zod schemas to Tempo renderers. The renderer walks the parsed AST and produces reactive BeatUI components via `MapSignal`, with forward-reference resolution via per-reference `Prop<ASTNode | null>` signals.

**Tech Stack:** TypeScript, Zod, `@tempots/dom` (signals, `MapSignal`, `Provide`/`Use`), `@tempots/beatui` components

**Spec:** `docs/superpowers/specs/2026-03-23-openui-integration-design.md`

---

## File Map

### Parser (Layer 1) — no DOM dependency
| File | Responsibility |
|------|---------------|
| `src/openui/parser/types.ts` | `ASTNode`, `Statement`, `ParseResult`, `ParseError`, `ComponentNameChecker` types |
| `src/openui/parser/tokenizer.ts` | Line-oriented lexer: splits input into lines, handles multi-line continuations (open parens/brackets/braces), produces raw line strings |
| `src/openui/parser/parser.ts` | `createParser(checker?)` — synchronous full-text parse. Tokenizes → parses each line → returns `ParseResult` |
| `src/openui/parser/streaming-parser.ts` | `createStreamingParser(checker?)` — incremental parser with `push(chunk)` / `getResult()` |

### Library (Layer 2)
| File | Responsibility |
|------|---------------|
| `src/openui/library/types.ts` | `DefinedComponent`, `Library`, `ComponentGroup`, `PromptOptions` interfaces |
| `src/openui/library/define-component.ts` | `defineComponent()` — pairs a Zod schema with a Tempo renderer |
| `src/openui/library/library.ts` | `createLibrary()` — component registry with `get`, `has`, `extend`, `prompt`, `toJSONSchema` |
| `src/openui/library/prompt-generator.ts` | Generates LLM system prompt text from a `Library` |

### Registry (Layer 3)
| File | Responsibility |
|------|---------------|
| `src/openui/registry/layout.ts` | `defineComponent` calls for Stack, Flex, Card, Divider, Accordion, Center, Group, Collapse |
| `src/openui/registry/button.ts` | Button, ToggleButton, CopyButton, CloseButton, ToggleButtonGroup |
| `src/openui/registry/data.ts` | StatCard, Badge, AutoColorBadge, Avatar, AvatarGroup, ProgressBar, DataTable, Skeleton, Indicator, HistoryTimeline, Icon |
| `src/openui/registry/form.ts` | TextInput, NumberInput, PasswordInput, EmailInput, TextArea, CheckboxInput, Switch, RadioGroup, NativeSelect, DropdownInput, ComboboxInput, DatePicker, TimePicker, RatingInput, SliderInput, ColorInput, TagInput, OTPInput, SegmentedInput |
| `src/openui/registry/navigation.ts` | Tabs, Breadcrumbs, Pagination, Stepper, TreeView, Sidebar |
| `src/openui/registry/overlay.ts` | Modal, Drawer, Tooltip, Popover |
| `src/openui/registry/format.ts` | FormatNumber, FormatDate, FormatTime, FormatDateTime, FormatRelativeTime, FormatFileSize |
| `src/openui/registry/typography.ts` | Kbd, Label |
| `src/openui/registry/index.ts` | Assembles `beatuiLibrary` from all category files |

### Renderer (Layer 4)
| File | Responsibility |
|------|---------------|
| `src/openui/renderer/action-context.ts` | `ActionContextProvider` (Tempo Provider), `ActionEvent`, `ButtonAction`, `FormSubmitAction` types |
| `src/openui/renderer/node-resolver.ts` | Walks `ASTNode` tree, resolves components via library, maps positional args to Zod-validated props, returns `TNode` |
| `src/openui/renderer/skeleton.ts` | Skeleton placeholder for unresolved forward references |
| `src/openui/renderer/openui-renderer.ts` | `OpenUIRenderer` Tempo component — wires parser + resolver + action context |

### Streaming Adapters (Layer 5)
| File | Responsibility |
|------|---------------|
| `src/openui/streaming/types.ts` | Shared `StreamOptions` interface |
| `src/openui/streaming/from-sse.ts` | `fromSSE()` — EventSource → `Signal<string>` |
| `src/openui/streaming/from-fetch.ts` | `fromFetch()` — fetch ReadableStream → `Signal<string>` |
| `src/openui/streaming/from-websocket.ts` | `fromWebSocket()` — WebSocket → `Signal<string>` |

### Entry Point & Build
| File | Responsibility |
|------|---------------|
| `src/openui/index.ts` | Public API barrel export |
| `packages/beatui/vite.config.ts` | Add entry, fileName, external for zod |
| `packages/beatui/package.json` | Add `./openui` export, zod peer dep |

### Tests
| File | Tests |
|------|-------|
| `tests/openui/parser/tokenizer.test.ts` | Line splitting, multi-line continuation, escape sequences |
| `tests/openui/parser/parser.test.ts` | Full-text parsing: all expression types, error handling, component name checking |
| `tests/openui/parser/streaming-parser.test.ts` | Incremental parsing, forward refs, chunk boundaries |
| `tests/openui/library/define-component.test.ts` | Schema-to-props mapping, positional args |
| `tests/openui/library/library.test.ts` | Registry, extend, prompt generation, toJSONSchema |
| `tests/openui/renderer/node-resolver.test.ts` | AST → TNode resolution, Zod validation, error fallbacks |
| `tests/openui/renderer/action-context.test.ts` | Provider creation, action dispatch, signal accumulation |
| `tests/openui/renderer/openui-renderer.test.ts` | End-to-end: static render, forward refs, streaming, completion |
| `tests/openui/streaming/from-fetch.test.ts` | ReadableStream → signal, disposal, extractContent |
| `tests/openui/registry/registry.test.ts` | Smoke tests for all registry categories — component count, names, basic render |

---

## Task 1: Build Configuration

**Files:**
- Modify: `packages/beatui/vite.config.ts`
- Modify: `packages/beatui/package.json`

- [ ] **Step 1: Add openui entry to vite.config.ts**

In `packages/beatui/vite.config.ts`, add to the `entry` object (after `'better-auth'` line ~127):

```ts
openui: resolve(__dirname, 'src/openui/index.ts'),
```

Add `'openui'` to the `fileName` function's conditional (line ~148). Add it to the `||` chain:

```ts
entryName === 'better-auth' ||
entryName === 'openui' ||
entryName === 'tailwind'
```

Add zod to the external function (after the `ajv-formats` check, line ~198):

```ts
if (id === 'zod' || id.startsWith('zod/')) return true
```

Add to coverage exclusions (line ~101, in the `exclude` array):

```ts
'src/openui/**',
```

- [ ] **Step 2: Add openui export to package.json**

In `packages/beatui/package.json`, add to the `exports` object (after `./better-auth`):

```json
"./openui": {
  "types": "./dist/types/openui/index.d.ts",
  "import": "./dist/openui/index.es.js",
  "require": "./dist/openui/index.cjs.js",
  "default": "./dist/openui/index.es.js"
}
```

Add to `peerDependencies`:

```json
"zod": "^3.23.0"
```

Add to `peerDependenciesMeta`:

```json
"zod": { "optional": true }
```

- [ ] **Step 3: Install zod as dev dependency for tests**

Run: `pnpm --filter @tempots/beatui add -D zod`

- [ ] **Step 4: Create stub entry point so build doesn't break**

Create `packages/beatui/src/openui/index.ts`:

```ts
/**
 * OpenUI Lang integration for `@tempots/beatui/openui`.
 *
 * Parses OpenUI Lang markup from LLM responses and renders live BeatUI
 * components. Includes a pre-built component library, streaming adapters,
 * and an extensible component registration system.
 *
 * ```ts
 * import { beatuiLibrary, OpenUIRenderer, fromFetch } from '@tempots/beatui/openui'
 * ```
 *
 * @module
 */

// Will be populated as layers are implemented
export {}
```

- [ ] **Step 5: Verify build succeeds**

Run: `pnpm --filter @tempots/beatui build`
Expected: Build succeeds with the new openui entry point (empty)

- [ ] **Step 6: Commit**

```bash
git add packages/beatui/vite.config.ts packages/beatui/package.json packages/beatui/src/openui/index.ts
git commit -m "feat(openui): add build configuration and stub entry point"
```

---

## Task 2: Parser Types

**Files:**
- Create: `packages/beatui/src/openui/parser/types.ts`
- Test: `packages/beatui/tests/openui/parser/types.test.ts`

- [ ] **Step 1: Write the types file**

Create `packages/beatui/src/openui/parser/types.ts`:

```ts
/**
 * AST node types for OpenUI Lang.
 *
 * OpenUI Lang is a line-oriented DSL where each statement is:
 *   identifier = Expression
 *
 * Expressions can be components, primitives, arrays, objects, or references.
 */

/** A node in the OpenUI Lang AST. */
export type ASTNode =
  | { type: 'component'; name: string; args: ASTNode[] }
  | { type: 'string'; value: string }
  | { type: 'number'; value: number }
  | { type: 'boolean'; value: boolean }
  | { type: 'null' }
  | { type: 'array'; items: ASTNode[] }
  | { type: 'object'; entries: Record<string, ASTNode> }
  | { type: 'reference'; name: string }

/** A parsed statement (the value side of `identifier = expression`). */
export interface Statement {
  value: ASTNode
}

/** Result of parsing OpenUI Lang text. */
export interface ParseResult {
  /** The resolved root AST node (from the `root = ...` statement), or null if not yet defined. */
  root: ASTNode | null
  /** All parsed statements keyed by identifier. */
  statements: Map<string, Statement>
  /** Metadata about the parse. */
  meta: {
    /** Whether the input appears incomplete (e.g., unclosed expression). */
    incomplete: boolean
    /** Identifiers referenced but not yet defined (forward references). */
    unresolved: string[]
    /** Number of successfully parsed statements. */
    statementCount: number
    /** Parse errors encountered. */
    errors: ParseError[]
  }
}

/** A parse error with location and classification. */
export interface ParseError {
  /** 1-based line number where the error occurred. */
  line: number
  /** Human-readable error description. */
  message: string
  /** Error classification. */
  code: 'syntax' | 'unknown-component' | 'validation'
}

/**
 * Minimal interface for checking component name existence.
 * Keeps the parser layer decoupled from the library layer.
 */
export interface ComponentNameChecker {
  has(name: string): boolean
}
```

- [ ] **Step 2: Write a type-level smoke test**

Create `packages/beatui/tests/openui/parser/types.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import type { ASTNode, ParseResult, ParseError, ComponentNameChecker } from '../../../src/openui/parser/types'

describe('Parser types', () => {
  it('ASTNode discriminated union covers all variants', () => {
    const nodes: ASTNode[] = [
      { type: 'component', name: 'Button', args: [{ type: 'string', value: 'Click' }] },
      { type: 'string', value: 'hello' },
      { type: 'number', value: 42 },
      { type: 'boolean', value: true },
      { type: 'null' },
      { type: 'array', items: [] },
      { type: 'object', entries: {} },
      { type: 'reference', name: 'myRef' },
    ]
    expect(nodes).toHaveLength(8)
  })

  it('ParseResult has expected shape', () => {
    const result: ParseResult = {
      root: null,
      statements: new Map(),
      meta: { incomplete: false, unresolved: [], statementCount: 0, errors: [] },
    }
    expect(result.meta.statementCount).toBe(0)
  })

  it('ComponentNameChecker is a minimal interface', () => {
    const checker: ComponentNameChecker = { has: (name: string) => name === 'Button' }
    expect(checker.has('Button')).toBe(true)
    expect(checker.has('Unknown')).toBe(false)
  })
})
```

- [ ] **Step 3: Run tests**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/parser/types.test.ts`
Expected: 3 tests pass

- [ ] **Step 4: Commit**

```bash
git add packages/beatui/src/openui/parser/types.ts packages/beatui/tests/openui/parser/types.test.ts
git commit -m "feat(openui): add parser AST types"
```

---

## Task 3: Tokenizer

**Files:**
- Create: `packages/beatui/src/openui/parser/tokenizer.ts`
- Test: `packages/beatui/tests/openui/parser/tokenizer.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/beatui/tests/openui/parser/tokenizer.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { tokenizeLines } from '../../../src/openui/parser/tokenizer'

describe('tokenizeLines', () => {
  it('splits simple single-line statements', () => {
    const input = 'root = Stack([a, b])\na = Button("Click")'
    expect(tokenizeLines(input)).toEqual([
      'root = Stack([a, b])',
      'a = Button("Click")',
    ])
  })

  it('handles multi-line continuation with open paren', () => {
    const input = 'root = Stack(\n  [a, b]\n)'
    expect(tokenizeLines(input)).toEqual([
      'root = Stack(\n  [a, b]\n)',
    ])
  })

  it('handles multi-line continuation with open bracket', () => {
    const input = 'items = [\n  "one",\n  "two"\n]'
    expect(tokenizeLines(input)).toEqual([
      'items = [\n  "one",\n  "two"\n]',
    ])
  })

  it('handles multi-line continuation with open brace', () => {
    const input = 'obj = {\n  key: "val"\n}'
    expect(tokenizeLines(input)).toEqual([
      'obj = {\n  key: "val"\n}',
    ])
  })

  it('ignores empty lines', () => {
    const input = 'a = Button("Hi")\n\nb = Card("World")'
    expect(tokenizeLines(input)).toEqual([
      'a = Button("Hi")',
      'b = Card("World")',
    ])
  })

  it('handles strings with escaped quotes', () => {
    const input = 'a = Button("Say \\"hello\\"")'
    expect(tokenizeLines(input)).toEqual([
      'a = Button("Say \\"hello\\"")',
    ])
  })

  it('returns empty array for empty input', () => {
    expect(tokenizeLines('')).toEqual([])
  })

  it('handles nested brackets and parens', () => {
    const input = 'root = Stack([Card([Button("A"), Button("B")])])'
    expect(tokenizeLines(input)).toEqual([
      'root = Stack([Card([Button("A"), Button("B")])])',
    ])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/parser/tokenizer.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement the tokenizer**

Create `packages/beatui/src/openui/parser/tokenizer.ts`:

```ts
/**
 * Line-oriented lexer for OpenUI Lang.
 *
 * Splits raw input text into logical lines, joining physical lines when an
 * expression spans multiple lines (unclosed parens, brackets, or braces).
 * Respects string literals so delimiters inside strings are not counted.
 */

/**
 * Splits OpenUI Lang source text into logical statement lines.
 *
 * A logical line may span multiple physical lines when an expression has
 * unclosed delimiters (parentheses, brackets, braces). String contents
 * (inside double quotes) are skipped so that delimiter characters inside
 * strings don't affect grouping.
 *
 * @param input - Raw OpenUI Lang source text
 * @returns Array of logical line strings, one per statement
 */
export function tokenizeLines(input: string): string[] {
  if (!input) return []

  const physicalLines = input.split('\n')
  const result: string[] = []
  let current = ''
  let depth = 0 // nesting depth of ( [ {

  for (const line of physicalLines) {
    const trimmed = line.trim()
    if (trimmed === '' && depth === 0) continue

    current = current ? current + '\n' + line : line

    // Scan the line for delimiters, skipping string contents
    let inString = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inString) {
        if (ch === '\\') {
          i++ // skip escaped character
        } else if (ch === '"') {
          inString = false
        }
      } else {
        if (ch === '"') {
          inString = true
        } else if (ch === '(' || ch === '[' || ch === '{') {
          depth++
        } else if (ch === ')' || ch === ']' || ch === '}') {
          depth = Math.max(0, depth - 1)
        }
      }
    }

    if (depth === 0) {
      result.push(current)
      current = ''
    }
  }

  // If there's leftover (incomplete expression), include it
  if (current) {
    result.push(current)
  }

  return result
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/parser/tokenizer.test.ts`
Expected: 8 tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/openui/parser/tokenizer.ts packages/beatui/tests/openui/parser/tokenizer.test.ts
git commit -m "feat(openui): add line-oriented tokenizer"
```

---

## Task 4: Expression Parser

**Files:**
- Create: `packages/beatui/src/openui/parser/parser.ts`
- Test: `packages/beatui/tests/openui/parser/parser.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/beatui/tests/openui/parser/parser.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { createParser } from '../../../src/openui/parser/parser'
import type { ASTNode, ParseResult } from '../../../src/openui/parser/types'

describe('createParser', () => {
  const parse = createParser()

  describe('primitive expressions', () => {
    it('parses string values', () => {
      const r = parse('root = "hello"')
      expect(r.root).toEqual({ type: 'string', value: 'hello' })
    })

    it('parses string escape sequences', () => {
      const r = parse('root = "say \\"hi\\"\\n"')
      expect(r.root).toEqual({ type: 'string', value: 'say "hi"\n' })
    })

    it('parses numbers', () => {
      const r = parse('root = 42')
      expect(r.root).toEqual({ type: 'number', value: 42 })
    })

    it('parses negative numbers', () => {
      const r = parse('root = -3.14')
      expect(r.root).toEqual({ type: 'number', value: -3.14 })
    })

    it('parses booleans', () => {
      expect(parse('root = true').root).toEqual({ type: 'boolean', value: true })
      expect(parse('root = false').root).toEqual({ type: 'boolean', value: false })
    })

    it('parses null', () => {
      expect(parse('root = null').root).toEqual({ type: 'null' })
    })
  })

  describe('composite expressions', () => {
    it('parses arrays', () => {
      const r = parse('root = [1, "two", true]')
      expect(r.root).toEqual({
        type: 'array',
        items: [
          { type: 'number', value: 1 },
          { type: 'string', value: 'two' },
          { type: 'boolean', value: true },
        ],
      })
    })

    it('parses empty arrays', () => {
      expect(parse('root = []').root).toEqual({ type: 'array', items: [] })
    })

    it('parses objects', () => {
      const r = parse('root = {name: "test", count: 5}')
      expect(r.root).toEqual({
        type: 'object',
        entries: {
          name: { type: 'string', value: 'test' },
          count: { type: 'number', value: 5 },
        },
      })
    })

    it('parses empty objects', () => {
      expect(parse('root = {}').root).toEqual({ type: 'object', entries: {} })
    })
  })

  describe('components', () => {
    it('parses component with no args', () => {
      const r = parse('root = Divider()')
      expect(r.root).toEqual({ type: 'component', name: 'Divider', args: [] })
    })

    it('parses component with positional args', () => {
      const r = parse('root = Button("Click", "filled", "md")')
      expect(r.root).toEqual({
        type: 'component',
        name: 'Button',
        args: [
          { type: 'string', value: 'Click' },
          { type: 'string', value: 'filled' },
          { type: 'string', value: 'md' },
        ],
      })
    })

    it('parses nested components', () => {
      const r = parse('root = Stack([Button("A"), Button("B")])')
      expect(r.root).toEqual({
        type: 'component',
        name: 'Stack',
        args: [{
          type: 'array',
          items: [
            { type: 'component', name: 'Button', args: [{ type: 'string', value: 'A' }] },
            { type: 'component', name: 'Button', args: [{ type: 'string', value: 'B' }] },
          ],
        }],
      })
    })
  })

  describe('references', () => {
    it('parses references', () => {
      const r = parse('root = Stack([btn])\nbtn = Button("Hi")')
      expect(r.root).toEqual({
        type: 'component',
        name: 'Stack',
        args: [{ type: 'array', items: [{ type: 'reference', name: 'btn' }] }],
      })
      expect(r.statements.get('btn')).toEqual({
        value: { type: 'component', name: 'Button', args: [{ type: 'string', value: 'Hi' }] },
      })
      expect(r.meta.unresolved).toEqual([])
    })

    it('tracks unresolved forward references', () => {
      const r = parse('root = Stack([missing])')
      expect(r.meta.unresolved).toEqual(['missing'])
    })
  })

  describe('metadata', () => {
    it('counts statements', () => {
      const r = parse('root = Stack([a])\na = Button("X")')
      expect(r.meta.statementCount).toBe(2)
    })

    it('reports syntax errors for malformed lines', () => {
      const r = parse('root = \na = Button("ok")')
      expect(r.meta.errors.length).toBeGreaterThan(0)
      expect(r.meta.errors[0].code).toBe('syntax')
    })
  })

  describe('multi-line statements', () => {
    it('parses multi-line component calls', () => {
      const r = parse('root = Stack(\n  [Button("A"), Button("B")]\n)')
      expect(r.root).toEqual({
        type: 'component',
        name: 'Stack',
        args: [{
          type: 'array',
          items: [
            { type: 'component', name: 'Button', args: [{ type: 'string', value: 'A' }] },
            { type: 'component', name: 'Button', args: [{ type: 'string', value: 'B' }] },
          ],
        }],
      })
    })
  })

  describe('error recovery', () => {
    it('continues parsing after a malformed line', () => {
      const r = parse('bad = \na = Button("ok")')
      expect(r.meta.errors.length).toBeGreaterThan(0)
      expect(r.statements.has('a')).toBe(true)
      expect(r.meta.statementCount).toBeGreaterThanOrEqual(1)
    })
  })

  describe('component name checking', () => {
    it('reports unknown components when checker is provided', () => {
      const checker = { has: (name: string) => name === 'Button' }
      const parseWithChecker = createParser(checker)
      const r = parseWithChecker('root = FakeComponent("hi")')
      expect(r.meta.errors).toContainEqual(
        expect.objectContaining({ code: 'unknown-component' })
      )
    })

    it('does not report known components', () => {
      const checker = { has: (name: string) => name === 'Button' }
      const parseWithChecker = createParser(checker)
      const r = parseWithChecker('root = Button("hi")')
      expect(r.meta.errors.filter(e => e.code === 'unknown-component')).toEqual([])
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/parser/parser.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement the parser**

Create `packages/beatui/src/openui/parser/parser.ts`. The parser must:

1. Use `tokenizeLines()` to split input into logical lines
2. For each line, extract `identifier = expression` via regex split on first `=`
3. Parse the expression string recursively:
   - Strings: `"..."` with JSON escape handling (`\"`, `\\`, `\n`, `\t`, `\r`, `\uXXXX`)
   - Numbers: regex match for `-?\d+(\.\d+)?`
   - Booleans: literal `true` / `false`
   - Null: literal `null`
   - Arrays: `[` ... `]` with comma-separated expressions
   - Objects: `{` key `:` value `,` ... `}`
   - Components: `TypeName(` ... `)` where TypeName starts with uppercase
   - References: any other identifier (starts with lowercase)
4. Track all identifiers defined and referenced. Compute `unresolved` as referenced minus defined.
5. If a `ComponentNameChecker` is provided, validate component names and add `unknown-component` errors.
6. Return `ParseResult` with `root` from the `root = ...` statement.

Export signature:

```ts
export function createParser(checker?: ComponentNameChecker): (input: string) => ParseResult
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/parser/parser.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/openui/parser/parser.ts packages/beatui/tests/openui/parser/parser.test.ts
git commit -m "feat(openui): add synchronous expression parser"
```

---

## Task 5: Streaming Parser

**Files:**
- Create: `packages/beatui/src/openui/parser/streaming-parser.ts`
- Test: `packages/beatui/tests/openui/parser/streaming-parser.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/beatui/tests/openui/parser/streaming-parser.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { createStreamingParser } from '../../../src/openui/parser/streaming-parser'

describe('createStreamingParser', () => {
  it('parses a complete input in one push', () => {
    const parser = createStreamingParser()
    const result = parser.push('root = Button("Hi")')
    expect(result.root).toEqual({
      type: 'component', name: 'Button', args: [{ type: 'string', value: 'Hi' }],
    })
  })

  it('parses incrementally across multiple pushes', () => {
    const parser = createStreamingParser()

    const r1 = parser.push('root = Stack([btn])\n')
    expect(r1.root).not.toBeNull()
    expect(r1.meta.unresolved).toEqual(['btn'])

    const r2 = parser.push('btn = Button("Click")')
    expect(r2.meta.unresolved).toEqual([])
    expect(r2.statements.has('btn')).toBe(true)
  })

  it('handles chunks that split mid-statement', () => {
    const parser = createStreamingParser()

    const r1 = parser.push('root = Stack(')
    expect(r1.meta.incomplete).toBe(true)

    const r2 = parser.push('[a, b])')
    expect(r2.meta.incomplete).toBe(false)
    expect(r2.root).not.toBeNull()
  })

  it('getResult returns current state without pushing', () => {
    const parser = createStreamingParser()
    parser.push('root = Button("X")')
    const result = parser.getResult()
    expect(result.root).toEqual({
      type: 'component', name: 'Button', args: [{ type: 'string', value: 'X' }],
    })
  })

  it('accumulates statements across pushes', () => {
    const parser = createStreamingParser()
    parser.push('a = Button("A")\n')
    parser.push('b = Button("B")\n')
    parser.push('root = Stack([a, b])')
    const r = parser.getResult()
    expect(r.meta.statementCount).toBe(3)
    expect(r.statements.has('a')).toBe(true)
    expect(r.statements.has('b')).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/parser/streaming-parser.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement the streaming parser**

Create `packages/beatui/src/openui/parser/streaming-parser.ts`. It must:

1. Maintain an internal text buffer that grows with each `push(chunk)`
2. On each `push`, append the chunk to the buffer, then re-parse the full buffer using the same logic as `createParser`
3. Return the current `ParseResult`
4. `getResult()` returns the last computed `ParseResult` without re-parsing

Export:

```ts
export function createStreamingParser(checker?: ComponentNameChecker): {
  push(chunk: string): ParseResult
  getResult(): ParseResult
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/parser/streaming-parser.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/openui/parser/streaming-parser.ts packages/beatui/tests/openui/parser/streaming-parser.test.ts
git commit -m "feat(openui): add incremental streaming parser"
```

---

## Task 6: Library Types & defineComponent

**Files:**
- Create: `packages/beatui/src/openui/library/types.ts`
- Create: `packages/beatui/src/openui/library/define-component.ts`
- Test: `packages/beatui/tests/openui/library/define-component.test.ts`

- [ ] **Step 1: Write the library types**

Create `packages/beatui/src/openui/library/types.ts`:

```ts
import type { z } from 'zod'
import type { Renderable } from '@tempots/dom'
import type { ComponentNameChecker } from '../parser/types'

/** A component definition pairing a Zod schema with a Tempo renderer. */
export interface DefinedComponent<T extends z.ZodObject<any> = z.ZodObject<any>> {
  name: string
  props: T
  description: string
  renderer: (props: z.infer<T>, children: Renderable[]) => Renderable
}

/** Options for system prompt generation. */
export interface PromptOptions {
  /** Include usage examples in the prompt. */
  examples?: boolean
  /** Additional rules to append to the prompt. */
  additionalRules?: string[]
  /** Component groups for organized prompt sections. */
  groups?: ComponentGroup[]
}

/** A named group of components for prompt organization. */
export interface ComponentGroup {
  name: string
  description: string
  components: string[]
}

/** A component library with registry, prompt generation, and extensibility. */
export interface Library extends ComponentNameChecker {
  readonly components: ReadonlyMap<string, DefinedComponent>
  readonly root: string | undefined

  get(name: string): DefinedComponent | undefined
  has(name: string): boolean
  prompt(options?: PromptOptions): string
  toJSONSchema(): object
  extend(config: { components?: DefinedComponent[]; root?: string }): Library
}
```

- [ ] **Step 2: Write the failing tests**

Create `packages/beatui/tests/openui/library/define-component.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { defineComponent } from '../../../src/openui/library/define-component'
import { html } from '@tempots/dom'

describe('defineComponent', () => {
  it('creates a DefinedComponent with name, schema, description, and renderer', () => {
    const comp = defineComponent({
      name: 'TestButton',
      props: z.object({
        label: z.string(),
        variant: z.enum(['filled', 'outline']).optional(),
      }),
      description: 'A test button.',
      renderer: (props) => html.button(props.label),
    })

    expect(comp.name).toBe('TestButton')
    expect(comp.description).toBe('A test button.')
    expect(comp.props).toBeDefined()
    expect(typeof comp.renderer).toBe('function')
  })

  it('preserves Zod schema key order for positional arg mapping', () => {
    const comp = defineComponent({
      name: 'Card',
      props: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        size: z.enum(['sm', 'md', 'lg']).optional(),
      }),
      description: 'A card.',
      renderer: (props) => html.div(props.title),
    })

    const keys = Object.keys(comp.props.shape)
    expect(keys).toEqual(['title', 'subtitle', 'size'])
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/library/define-component.test.ts`
Expected: FAIL

- [ ] **Step 4: Implement defineComponent**

Create `packages/beatui/src/openui/library/define-component.ts`:

```ts
import type { z } from 'zod'
import type { Renderable } from '@tempots/dom'
import type { DefinedComponent } from './types'

/**
 * Defines an OpenUI component by pairing a Zod schema with a Tempo renderer.
 *
 * The Zod schema's key insertion order determines positional argument mapping
 * in OpenUI Lang. This is an explicit contract — reordering schema fields
 * changes the positional mapping.
 *
 * @param config - Component definition with name, Zod schema, description, and renderer
 * @returns A frozen DefinedComponent object
 */
export function defineComponent<T extends z.ZodObject<any>>(config: {
  name: string
  props: T
  description: string
  renderer: (props: z.infer<T>, children: Renderable[]) => Renderable
}): DefinedComponent<T> {
  return Object.freeze({ ...config })
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/library/define-component.test.ts`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add packages/beatui/src/openui/library/types.ts packages/beatui/src/openui/library/define-component.ts packages/beatui/tests/openui/library/define-component.test.ts
git commit -m "feat(openui): add library types and defineComponent"
```

---

## Task 7: createLibrary & Prompt Generator

**Files:**
- Create: `packages/beatui/src/openui/library/library.ts`
- Create: `packages/beatui/src/openui/library/prompt-generator.ts`
- Test: `packages/beatui/tests/openui/library/library.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/beatui/tests/openui/library/library.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { html } from '@tempots/dom'
import { defineComponent } from '../../../src/openui/library/define-component'
import { createLibrary } from '../../../src/openui/library/library'

const TestButton = defineComponent({
  name: 'Button',
  props: z.object({ label: z.string(), variant: z.enum(['filled', 'outline']).optional() }),
  description: 'A clickable button.',
  renderer: (props) => html.button(props.label),
})

const TestCard = defineComponent({
  name: 'Card',
  props: z.object({ title: z.string() }),
  description: 'A content card.',
  renderer: (props) => html.div(props.title),
})

describe('createLibrary', () => {
  it('registers components by name', () => {
    const lib = createLibrary({ components: [TestButton, TestCard] })
    expect(lib.has('Button')).toBe(true)
    expect(lib.has('Card')).toBe(true)
    expect(lib.has('Unknown')).toBe(false)
  })

  it('get returns component or undefined', () => {
    const lib = createLibrary({ components: [TestButton] })
    expect(lib.get('Button')?.name).toBe('Button')
    expect(lib.get('Missing')).toBeUndefined()
  })

  it('components map is readonly', () => {
    const lib = createLibrary({ components: [TestButton] })
    expect(lib.components.size).toBe(1)
  })

  it('stores root component name', () => {
    const lib = createLibrary({ components: [TestButton], root: 'Button' })
    expect(lib.root).toBe('Button')
  })

  it('defaults root to undefined', () => {
    const lib = createLibrary({ components: [TestButton] })
    expect(lib.root).toBeUndefined()
  })

  describe('extend', () => {
    it('creates a new library with additional components', () => {
      const lib = createLibrary({ components: [TestButton] })
      const extended = lib.extend({ components: [TestCard] })
      expect(extended.has('Button')).toBe(true)
      expect(extended.has('Card')).toBe(true)
      // Original unchanged
      expect(lib.has('Card')).toBe(false)
    })

    it('can override root', () => {
      const lib = createLibrary({ components: [TestButton], root: 'Button' })
      const extended = lib.extend({ root: 'Card', components: [TestCard] })
      expect(extended.root).toBe('Card')
    })
  })

  describe('prompt', () => {
    it('generates a non-empty system prompt', () => {
      const lib = createLibrary({ components: [TestButton, TestCard] })
      const prompt = lib.prompt()
      expect(prompt).toContain('Button')
      expect(prompt).toContain('Card')
      expect(prompt).toContain('label')
      expect(prompt).toContain('OpenUI Lang')
    })

    it('includes group headers when groups are provided', () => {
      const lib = createLibrary({
        components: [TestButton, TestCard],
        groups: [{ name: 'Interactive', description: 'Clickable elements', components: ['Button'] }],
      })
      const prompt = lib.prompt()
      expect(prompt).toContain('Interactive')
    })
  })

  describe('toJSONSchema', () => {
    it('returns valid JSON Schema objects for each component', () => {
      const lib = createLibrary({ components: [TestButton] })
      const schema = lib.toJSONSchema() as Record<string, any>
      expect(schema).toHaveProperty('Button')
      expect(schema.Button.type).toBe('object')
      expect(schema.Button.properties).toHaveProperty('label')
      expect(schema.Button.properties.label.type).toBe('string')
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/library/library.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement prompt-generator.ts**

Create `packages/beatui/src/openui/library/prompt-generator.ts`. It must:

1. Accept a `ReadonlyMap<string, DefinedComponent>`, optional `PromptOptions`, and optional `ComponentGroup[]`
2. Generate a system prompt string with:
   - Header explaining OpenUI Lang syntax (`identifier = Expression`)
   - Component listing grouped by `ComponentGroup` (or ungrouped if no groups)
   - For each component: name, description, positional args with types derived from Zod schema `.shape` keys
   - Optional examples section
   - Rules section (root must be assigned, use references for composition)
3. Return the prompt string

```ts
export function generatePrompt(
  components: ReadonlyMap<string, DefinedComponent>,
  groups?: ComponentGroup[],
  options?: PromptOptions,
): string
```

- [ ] **Step 4: Implement library.ts**

Create `packages/beatui/src/openui/library/library.ts`. It must:

1. Build a `Map<string, DefinedComponent>` from the input array
2. Implement `get`, `has`, `prompt` (delegates to `generatePrompt`), `toJSONSchema` (uses `zodToJsonSchema` from zod or manual conversion of `.shape`), `extend` (creates a new library merging components)
3. `Library` extends `ComponentNameChecker` so it can be passed directly to the parser

```ts
export function createLibrary(config: {
  components: DefinedComponent[]
  root?: string
  groups?: ComponentGroup[]
}): Library
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/library/library.test.ts`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add packages/beatui/src/openui/library/library.ts packages/beatui/src/openui/library/prompt-generator.ts packages/beatui/tests/openui/library/library.test.ts
git commit -m "feat(openui): add createLibrary with prompt generation"
```

---

## Task 8: Action Context Provider

**Files:**
- Create: `packages/beatui/src/openui/renderer/action-context.ts`
- Test: `packages/beatui/tests/openui/renderer/action-context.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/beatui/tests/openui/renderer/action-context.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { render, Provide, Use, html, prop } from '@tempots/dom'
import { ActionContextProvider } from '../../../src/openui/renderer/action-context'
import type { ActionEvent } from '../../../src/openui/renderer/action-context'

describe('ActionContextProvider', () => {
  it('provides action context to children', () => {
    let captured: ActionEvent[] | undefined

    const tree = Provide(ActionContextProvider, {},
      Use(ActionContextProvider, (ctx) => {
        captured = ctx.actions.value
        return html.div('test')
      })
    )

    const clear = render(tree, document.body)
    expect(captured).toEqual([])
    clear(true)
  })

  it('dispatches button actions via onAction callback', () => {
    const events: ActionEvent[] = []

    const tree = Provide(ActionContextProvider, { onAction: (e) => events.push(e) },
      Use(ActionContextProvider, (ctx) => {
        ctx.onAction?.({
          kind: 'button',
          type: 'open_url',
          params: { url: 'https://example.com' },
          humanFriendlyMessage: 'Open example',
        })
        return html.div('test')
      })
    )

    const clear = render(tree, document.body)
    expect(events).toHaveLength(1)
    expect(events[0].kind).toBe('button')
    clear(true)
  })

  it('accumulates actions in the signal', () => {
    let actionsSignal: ActionEvent[] | undefined

    const tree = Provide(ActionContextProvider, {},
      Use(ActionContextProvider, (ctx) => {
        const action: ActionEvent = {
          kind: 'button',
          type: 'test',
          params: {},
          humanFriendlyMessage: 'test',
        }
        ctx.actions.update(prev => [...prev, action])
        actionsSignal = ctx.actions.value
        return html.div('test')
      })
    )

    const clear = render(tree, document.body)
    expect(actionsSignal).toHaveLength(1)
    clear(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/renderer/action-context.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement action-context.ts**

Create `packages/beatui/src/openui/renderer/action-context.ts`:

```ts
import { makeProviderMark, prop, type Provider, type Signal } from '@tempots/dom'

/** A button click action. */
export interface ButtonAction {
  kind: 'button'
  type: string
  params: Record<string, unknown>
  humanFriendlyMessage: string
}

/** A form submission action. */
export interface FormSubmitAction {
  kind: 'form'
  type: string
  formName: string
  formState: Record<string, unknown>
  humanFriendlyMessage: string
}

/** Discriminated union of all action types. Use `OneOfKind` for type-safe handling. */
export type ActionEvent = ButtonAction | FormSubmitAction

/** Context for dispatching and observing actions from rendered OpenUI components. */
export interface ActionContext {
  onAction?: (event: ActionEvent) => void
  actions: Signal<ActionEvent[]>
}

interface ActionContextOptions {
  onAction?: (event: ActionEvent) => void
}

/**
 * Tempo Provider for the OpenUI action dispatch system.
 *
 * Wrap rendered content with `Provide(ActionContextProvider, { onAction }, ...)`.
 * Component renderers access it via `Use(ActionContextProvider, (ctx) => ...)`.
 */
export const ActionContextProvider: Provider<ActionContext, ActionContextOptions> = {
  mark: makeProviderMark<ActionContext>('OpenUI:ActionContext'),
  create: (options: ActionContextOptions = {}) => {
    const actions = prop<ActionEvent[]>([])
    const ctx: ActionContext = {
      onAction: options.onAction,
      actions,
    }
    return {
      value: ctx,
      dispose: () => actions.dispose(),
    }
  },
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/renderer/action-context.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/openui/renderer/action-context.ts packages/beatui/tests/openui/renderer/action-context.test.ts
git commit -m "feat(openui): add ActionContext Tempo provider"
```

---

## Task 9: Node Resolver & Skeleton

**Files:**
- Create: `packages/beatui/src/openui/renderer/skeleton.ts`
- Create: `packages/beatui/src/openui/renderer/node-resolver.ts`
- Test: `packages/beatui/tests/openui/renderer/node-resolver.test.ts`

- [ ] **Step 1: Write the skeleton test**

Add to the top of `packages/beatui/tests/openui/renderer/node-resolver.test.ts` (created in step 2):

```ts
import { OpenUISkeleton } from '../../../src/openui/renderer/skeleton'

describe('OpenUISkeleton', () => {
  it('renders a skeleton placeholder with correct CSS class', () => {
    const clear = render(html.div(OpenUISkeleton()), document.body)
    const el = document.body.querySelector('.bc-skeleton')
    expect(el).not.toBeNull()
    clear(true)
  })
})
```

- [ ] **Step 2: Implement the skeleton placeholder**

Create `packages/beatui/src/openui/renderer/skeleton.ts`:

```ts
import { html, attr } from '@tempots/dom'
import type { TNode } from '@tempots/dom'

/**
 * Renders a skeleton placeholder for unresolved forward references.
 * Reuses BeatUI's Skeleton CSS class for consistent appearance.
 */
export function OpenUISkeleton(): TNode {
  return html.div(
    attr.class('bc-skeleton bc-skeleton--text'),
    attr.style('min-height: 1.5em; width: 100%;'),
  )
}
```

- [ ] **Step 3: Write the failing tests for node-resolver**

Create `packages/beatui/tests/openui/renderer/node-resolver.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { html, render } from '@tempots/dom'
import { defineComponent } from '../../../src/openui/library/define-component'
import { createLibrary } from '../../../src/openui/library/library'
import { resolveNode } from '../../../src/openui/renderer/node-resolver'
import type { ASTNode } from '../../../src/openui/parser/types'

const TestButton = defineComponent({
  name: 'Button',
  props: z.object({ label: z.string(), variant: z.enum(['filled', 'outline']).optional() }),
  description: 'A button.',
  renderer: (props) => html.button(props.label),
})

const TestStack = defineComponent({
  name: 'Stack',
  props: z.object({ children: z.array(z.unknown()).optional() }),
  description: 'Vertical stack.',
  renderer: (_props, children) => html.div(...children),
})

const lib = createLibrary({ components: [TestButton, TestStack] })

describe('resolveNode', () => {
  it('resolves string nodes to text', () => {
    const node: ASTNode = { type: 'string', value: 'hello' }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    expect(document.body.textContent).toContain('hello')
    clear(true)
  })

  it('resolves number nodes to text', () => {
    const node: ASTNode = { type: 'number', value: 42 }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    expect(document.body.textContent).toContain('42')
    clear(true)
  })

  it('resolves component nodes with positional args', () => {
    const node: ASTNode = {
      type: 'component',
      name: 'Button',
      args: [{ type: 'string', value: 'Click me' }],
    }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    expect(document.body.textContent).toContain('Click me')
    clear(true)
  })

  it('returns empty for unknown components', () => {
    const node: ASTNode = { type: 'component', name: 'Unknown', args: [] }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    // Should not throw, renders nothing or a debug notice
    clear(true)
  })

  it('returns a placeholder TNode for reference nodes', () => {
    const node: ASTNode = { type: 'reference', name: 'someRef' }
    const resolved = resolveNode(node, lib)
    // References return a placeholder — the renderer handles actual resolution
    const clear = render(html.div(resolved), document.body)
    // Should render without throwing (skeleton or empty placeholder)
    clear(true)
  })

  it('resolves array nodes as children', () => {
    const node: ASTNode = {
      type: 'array',
      items: [
        { type: 'string', value: 'A' },
        { type: 'string', value: 'B' },
      ],
    }
    const resolved = resolveNode(node, lib)
    const clear = render(html.div(resolved), document.body)
    expect(document.body.textContent).toContain('A')
    expect(document.body.textContent).toContain('B')
    clear(true)
  })
})
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/renderer/node-resolver.test.ts`
Expected: FAIL

- [ ] **Step 5: Implement node-resolver.ts**

Create `packages/beatui/src/openui/renderer/node-resolver.ts`. It must:

1. Accept an `ASTNode` and a `Library`
2. Recursively walk the AST:
   - `string` → text node (the string value as TNode)
   - `number` → text node (String(value))
   - `boolean` → text node (String(value))
   - `null` → `Empty`
   - `array` → `Fragment` of resolved children
   - `object` → pass through as plain object (used as component props)
   - `component` → look up `DefinedComponent` in library, map positional args to Zod schema keys, call `safeParse` to validate, call `renderer(validatedProps, resolvedChildren)`
   - `reference` → return a placeholder (the caller handles ref resolution)
3. For component resolution: get Zod schema `.shape` keys in order, zip with `args`, build a props object, call `schema.safeParse()`. On validation failure, use defaults for invalid fields.
4. Return `TNode`

```ts
export function resolveNode(node: ASTNode, library: Library, debug?: boolean): TNode
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/renderer/node-resolver.test.ts`
Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add packages/beatui/src/openui/renderer/skeleton.ts packages/beatui/src/openui/renderer/node-resolver.ts packages/beatui/tests/openui/renderer/node-resolver.test.ts
git commit -m "feat(openui): add node resolver and skeleton placeholder"
```

---

## Task 10: OpenUIRenderer Component

**Files:**
- Create: `packages/beatui/src/openui/renderer/openui-renderer.ts`
- Test: `packages/beatui/tests/openui/renderer/openui-renderer.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/beatui/tests/openui/renderer/openui-renderer.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { html, render, prop } from '@tempots/dom'
import { defineComponent } from '../../../src/openui/library/define-component'
import { createLibrary } from '../../../src/openui/library/library'
import { OpenUIRenderer } from '../../../src/openui/renderer/openui-renderer'

const TestButton = defineComponent({
  name: 'Button',
  props: z.object({ label: z.string() }),
  description: 'A button.',
  renderer: (props) => html.button(props.label),
})

const TestStack = defineComponent({
  name: 'Stack',
  props: z.object({ children: z.array(z.unknown()).optional() }),
  description: 'Stack layout.',
  renderer: (_props, children) => html.div(...children),
})

const lib = createLibrary({ components: [TestButton, TestStack], root: 'Stack' })

describe('OpenUIRenderer', () => {
  it('renders a static response', () => {
    const tree = OpenUIRenderer({
      library: lib,
      response: 'root = Button("Hello")',
    })
    const clear = render(tree, document.body)
    expect(document.body.textContent).toContain('Hello')
    clear(true)
  })

  it('renders with forward references', () => {
    const tree = OpenUIRenderer({
      library: lib,
      response: 'root = Stack([btn])\nbtn = Button("World")',
    })
    const clear = render(tree, document.body)
    expect(document.body.textContent).toContain('World')
    clear(true)
  })

  it('updates reactively when response signal changes', () => {
    const response = prop('')
    const tree = OpenUIRenderer({
      library: lib,
      response,
    })
    const clear = render(tree, document.body)

    response.set('root = Button("First")')
    // Tempo signals propagate synchronously — no setTimeout needed
    expect(document.body.textContent).toContain('First')

    clear(true)
  })

  it('calls onAction when action is dispatched', () => {
    // This is an integration test — verifying the ActionContextProvider
    // is wired up. Detailed action tests are in action-context.test.ts.
    const actions: unknown[] = []
    const tree = OpenUIRenderer({
      library: lib,
      response: 'root = Button("Test")',
      onAction: (e) => actions.push(e),
    })
    const clear = render(tree, document.body)
    // Button doesn't auto-dispatch, so just verify no errors
    clear(true)
  })

  it('calls onComplete when streaming ends', () => {
    let completed = false
    const response = prop('')
    const isStreaming = prop(true)

    const tree = OpenUIRenderer({
      library: lib,
      response,
      isStreaming,
      onComplete: () => { completed = true },
    })
    const clear = render(tree, document.body)

    response.set('root = Button("Done")')
    isStreaming.set(false)
    // Tempo signals propagate synchronously
    expect(completed).toBe(true)
    clear(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/renderer/openui-renderer.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement openui-renderer.ts**

Create `packages/beatui/src/openui/renderer/openui-renderer.ts`. It must:

1. Accept `OpenUIRendererOptions` (library, response, isStreaming, onAction, onError, onComplete, initialState, className, debug)
2. Return `html.div(attr.class(options.className), Provide(ActionContextProvider, { onAction }, MapSignal(parseResultSignal, ...)))` — the outer `html.div` ensures `MapSignal` is never root
3. Inside: create a streaming parser from `library`, create a `Prop<ParseResult>` signal
4. Use `Value.on(response, ...)` to detect changes — compute delta text, call `parser.push(delta)`, update the `ParseResult` prop
5. `MapSignal(parseResultSignal, (result) => ...)` resolves the root AST node via `resolveNode`
6. Forward references: maintain `Map<string, Prop<ASTNode | null>>`. Each reference renders as `MapSignal(refSlot, (node) => node ? resolveNode(node) : OpenUISkeleton())` inside an `html.div` wrapper
7. When `isStreaming` transitions to `false`, replace unresolved refs with empty and call `onComplete`

```ts
export function OpenUIRenderer(options: OpenUIRendererOptions): Renderable
```

Refer to the spec (section "Layer 4: Renderer") for the exact rendering pipeline.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/renderer/openui-renderer.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/openui/renderer/openui-renderer.ts packages/beatui/tests/openui/renderer/openui-renderer.test.ts
git commit -m "feat(openui): add OpenUIRenderer Tempo component"
```

---

## Task 11: Streaming Adapters

**Files:**
- Create: `packages/beatui/src/openui/streaming/from-fetch.ts`
- Create: `packages/beatui/src/openui/streaming/from-sse.ts`
- Create: `packages/beatui/src/openui/streaming/from-websocket.ts`
- Test: `packages/beatui/tests/openui/streaming/from-fetch.test.ts`

- [ ] **Step 1: Write the failing tests for fromFetch**

Create `packages/beatui/tests/openui/streaming/from-fetch.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { fromFetch } from '../../../src/openui/streaming/from-fetch'

function mockFetchResponse(chunks: string[]): void {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
        await new Promise(r => setTimeout(r, 5))
      }
      controller.close()
    },
  })

  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(stream, { status: 200 })
  )
}

describe('fromFetch', () => {
  it('accumulates streamed text into response signal', async () => {
    mockFetchResponse(['root = ', 'Button("Hi")'])

    const { response, isStreaming, abort } = fromFetch('/api/test')

    // Wait for stream to complete
    await vi.waitFor(() => {
      expect(isStreaming.value).toBe(false)
    }, { timeout: 1000 })

    expect(response.value).toBe('root = Button("Hi")')
    abort()
    vi.restoreAllMocks()
  })

  it('applies extractContent transformer', async () => {
    // Note: this test assumes each enqueue produces exactly one reader.read() result.
    // In real usage, ReadableStream chunks may be split at arbitrary byte boundaries.
    // The extractContent callback receives decoded text per chunk.
    mockFetchResponse(['{"content":"hello"}', '{"content":" world"}'])

    const { response, isStreaming, abort } = fromFetch('/api/test', undefined, {
      extractContent: (chunk) => {
        const parsed = JSON.parse(chunk as string)
        return parsed.content
      },
    })

    await vi.waitFor(() => {
      expect(isStreaming.value).toBe(false)
    }, { timeout: 1000 })

    expect(response.value).toBe('hello world')
    abort()
    vi.restoreAllMocks()
  })

  it('disposes signals on abort', async () => {
    mockFetchResponse(['data'])

    const { response, abort } = fromFetch('/api/test')

    await vi.waitFor(() => expect(response.value).toBe('data'), { timeout: 1000 })

    abort()
    // After abort, signals should be disposed — accessing .value may throw or return last value
    // The key thing is abort() doesn't throw
    vi.restoreAllMocks()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/streaming/from-fetch.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement all three streaming adapters**

Create `packages/beatui/src/openui/streaming/from-fetch.ts`:

Must create `prop('')` for response, `prop(true)` for isStreaming, call `fetch()`, read the `ReadableStream` with a `TextDecoder`, accumulate chunks (applying `extractContent` if provided), update signals, set `isStreaming` to `false` on completion. `abort()` must abort the fetch controller and dispose both props.

Create `packages/beatui/src/openui/streaming/from-sse.ts`:

Must create `EventSource`, accumulate `event.data` chunks into `response` prop, dispose on `abort()`.

Create `packages/beatui/src/openui/streaming/from-websocket.ts`:

Must create `WebSocket`, accumulate `message.data` chunks, expose `send()` for bidirectional communication, dispose on `close()`.

First, create a shared types file `packages/beatui/src/openui/streaming/types.ts`:

```ts
/** Options shared by all streaming adapters. */
export interface StreamOptions {
  onComplete?: () => void
  onError?: (error: Error) => void
  extractContent?: (chunk: unknown) => string
}
```

All three adapters import `StreamOptions` from `./types`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/streaming/from-fetch.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/openui/streaming/ packages/beatui/tests/openui/streaming/
git commit -m "feat(openui): add streaming adapters (fromFetch, fromSSE, fromWebSocket)"
```

---

## Task 12: Component Registry (Layout + Button + Data)

**Files:**
- Create: `packages/beatui/src/openui/registry/layout.ts`
- Create: `packages/beatui/src/openui/registry/button.ts`
- Create: `packages/beatui/src/openui/registry/data.ts`

- [ ] **Step 1: Implement layout registry**

Create `packages/beatui/src/openui/registry/layout.ts`. Register: Stack, Flex, Card, Divider, Accordion, Center, Group, Collapse.

Each follows this pattern (example for Stack):

```ts
import { z } from 'zod'
import { defineComponent } from '../library/define-component'
import { Stack } from '../../components/layout/stack'
import type { Renderable } from '@tempots/dom'

export const BUIStack = defineComponent({
  name: 'Stack',
  props: z.object({
    children: z.array(z.unknown()).optional(),
  }),
  description: 'Vertical stack layout arranging children in a column with consistent spacing.',
  renderer: (_props, children) => Stack(...children),
})
```

Export an array: `export const layoutComponents = [BUIStack, BUIFlex, BUICard, ...]`

For each component, reference the actual BeatUI import path (e.g., `../../components/layout/stack`, `../../components/layout/flex`). The Zod schema should include only LLM-relevant props (simplified projection).

- [ ] **Step 2: Implement button registry**

Create `packages/beatui/src/openui/registry/button.ts`. Register: Button, ToggleButton, CopyButton, CloseButton, ToggleButtonGroup.

Button example:

```ts
export const BUIButton = defineComponent({
  name: 'Button',
  props: z.object({
    label: z.string(),
    variant: z.enum(['filled', 'light', 'outline', 'dashed', 'default', 'subtle', 'text']).optional(),
    size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
    color: z.string().optional(),
    disabled: z.boolean().optional(),
    actionType: z.string().optional(),
    actionParams: z.record(z.unknown()).optional(),
  }),
  description: 'Clickable button. Use actionType/actionParams to trigger actions.',
  renderer: (props) => Button({
    variant: props.variant,
    size: props.size,
    color: props.color as ThemeColorName,
    disabled: props.disabled,
  }, props.label),
})
```

Export: `export const buttonComponents = [BUIButton, ...]`

- [ ] **Step 3: Implement data registry**

Create `packages/beatui/src/openui/registry/data.ts`. Register: StatCard, Badge, AutoColorBadge, Avatar, AvatarGroup, ProgressBar, DataTable, Skeleton, Indicator, HistoryTimeline, Icon.

Export: `export const dataComponents = [...]`

- [ ] **Step 4: Verify build compiles**

Run: `pnpm --filter @tempots/beatui build`
Expected: No type errors in registry files

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/openui/registry/layout.ts packages/beatui/src/openui/registry/button.ts packages/beatui/src/openui/registry/data.ts
git commit -m "feat(openui): add layout, button, and data component registries"
```

---

## Task 13: Component Registry (Form + Navigation + Overlay + Format + Typography)

**Files:**
- Create: `packages/beatui/src/openui/registry/form.ts`
- Create: `packages/beatui/src/openui/registry/navigation.ts`
- Create: `packages/beatui/src/openui/registry/overlay.ts`
- Create: `packages/beatui/src/openui/registry/format.ts`
- Create: `packages/beatui/src/openui/registry/typography.ts`

- [ ] **Step 1: Implement form registry**

Register: TextInput, NumberInput, PasswordInput, EmailInput, TextArea, CheckboxInput, Switch, RadioGroup, NativeSelect, DropdownInput, ComboboxInput, DatePicker, TimePicker, RatingInput, SliderInput, ColorInput, TagInput, OTPInput, SegmentedInput.

**Important**: Form input components live under `src/components/form/input/`, not `src/components/form/`. Imports should be like:
```ts
import { TextInput } from '../../components/form/input/text-input'
import { NumberInput } from '../../components/form/input/number-input'
```

Export: `export const formComponents = [...]`

- [ ] **Step 2: Implement navigation registry**

Register: Tabs, Breadcrumbs, Pagination, Stepper, TreeView, Sidebar.

Export: `export const navigationComponents = [...]`

- [ ] **Step 3: Implement overlay registry**

Register: Modal, Drawer, Tooltip, Popover.

Export: `export const overlayComponents = [...]`

- [ ] **Step 4: Implement format registry**

Register: FormatNumber, FormatDate, FormatTime, FormatDateTime, FormatRelativeTime, FormatFileSize.

Export: `export const formatComponents = [...]`

- [ ] **Step 5: Implement typography registry**

Register: Kbd, Label.

Export: `export const typographyComponents = [...]`

- [ ] **Step 6: Verify build compiles**

Run: `pnpm --filter @tempots/beatui build`
Expected: No type errors

- [ ] **Step 7: Commit**

```bash
git add packages/beatui/src/openui/registry/
git commit -m "feat(openui): add form, navigation, overlay, format, typography registries"
```

---

## Task 14: Assemble beatuiLibrary & Registry Index

**Files:**
- Create: `packages/beatui/src/openui/registry/index.ts`

- [ ] **Step 1: Create the registry index**

Create `packages/beatui/src/openui/registry/index.ts`:

```ts
import { createLibrary } from '../library/library'
import { layoutComponents } from './layout'
import { buttonComponents } from './button'
import { dataComponents } from './data'
import { formComponents } from './form'
import { navigationComponents } from './navigation'
import { overlayComponents } from './overlay'
import { formatComponents } from './format'
import { typographyComponents } from './typography'

/**
 * Pre-built BeatUI component library for OpenUI Lang.
 *
 * Contains all BeatUI components suitable for LLM generation,
 * organized by category. Use `beatuiLibrary.prompt()` to generate
 * a system prompt for your LLM.
 *
 * Extend with custom components via `beatuiLibrary.extend({ components: [...] })`.
 */
export const beatuiLibrary = createLibrary({
  components: [
    ...layoutComponents,
    ...buttonComponents,
    ...dataComponents,
    ...formComponents,
    ...navigationComponents,
    ...overlayComponents,
    ...formatComponents,
    ...typographyComponents,
  ],
  root: 'Stack',
  groups: [
    { name: 'Layout', description: 'Structural containers and layout primitives', components: ['Stack', 'Flex', 'Card', 'Divider', 'Accordion', 'Center', 'Group', 'Collapse'] },
    { name: 'Button', description: 'Interactive buttons and toggles', components: ['Button', 'ToggleButton', 'CopyButton', 'CloseButton', 'ToggleButtonGroup'] },
    { name: 'Data Display', description: 'Content presentation and visualization', components: ['StatCard', 'Badge', 'AutoColorBadge', 'Avatar', 'AvatarGroup', 'ProgressBar', 'DataTable', 'Skeleton', 'Indicator', 'HistoryTimeline', 'Icon'] },
    { name: 'Form', description: 'User input controls', components: ['TextInput', 'NumberInput', 'PasswordInput', 'EmailInput', 'TextArea', 'CheckboxInput', 'Switch', 'RadioGroup', 'NativeSelect', 'DropdownInput', 'ComboboxInput', 'DatePicker', 'TimePicker', 'RatingInput', 'SliderInput', 'ColorInput', 'TagInput', 'OTPInput', 'SegmentedInput'] },
    { name: 'Navigation', description: 'Navigation and wayfinding', components: ['Tabs', 'Breadcrumbs', 'Pagination', 'Stepper', 'TreeView', 'Sidebar'] },
    { name: 'Overlay', description: 'Floating and modal content', components: ['Modal', 'Drawer', 'Tooltip', 'Popover'] },
    { name: 'Format', description: 'Localized value formatting', components: ['FormatNumber', 'FormatDate', 'FormatTime', 'FormatDateTime', 'FormatRelativeTime', 'FormatFileSize'] },
    { name: 'Typography', description: 'Text and label elements', components: ['Kbd', 'Label'] },
  ],
})
```

- [ ] **Step 2: Verify beatuiLibrary builds and prompt generates**

Run: `pnpm --filter @tempots/beatui build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add packages/beatui/src/openui/registry/index.ts
git commit -m "feat(openui): assemble beatuiLibrary with all component registries"
```

---

## Task 15: Registry Smoke Tests

**Files:**
- Test: `packages/beatui/tests/openui/registry/registry.test.ts`

- [ ] **Step 1: Write registry smoke tests**

Create `packages/beatui/tests/openui/registry/registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { render, html } from '@tempots/dom'
import { beatuiLibrary } from '../../../src/openui/registry'
import { layoutComponents } from '../../../src/openui/registry/layout'
import { buttonComponents } from '../../../src/openui/registry/button'
import { dataComponents } from '../../../src/openui/registry/data'
import { formComponents } from '../../../src/openui/registry/form'
import { navigationComponents } from '../../../src/openui/registry/navigation'
import { overlayComponents } from '../../../src/openui/registry/overlay'
import { formatComponents } from '../../../src/openui/registry/format'
import { typographyComponents } from '../../../src/openui/registry/typography'

describe('Component registries', () => {
  it('layout registry exports expected components', () => {
    expect(layoutComponents.length).toBeGreaterThanOrEqual(8)
    const names = layoutComponents.map(c => c.name)
    expect(names).toContain('Stack')
    expect(names).toContain('Card')
    expect(names).toContain('Flex')
  })

  it('button registry exports expected components', () => {
    expect(buttonComponents.length).toBeGreaterThanOrEqual(3)
    const names = buttonComponents.map(c => c.name)
    expect(names).toContain('Button')
  })

  it('data registry exports expected components', () => {
    expect(dataComponents.length).toBeGreaterThanOrEqual(5)
    const names = dataComponents.map(c => c.name)
    expect(names).toContain('StatCard')
    expect(names).toContain('Badge')
  })

  it('form registry exports expected components', () => {
    expect(formComponents.length).toBeGreaterThanOrEqual(10)
    const names = formComponents.map(c => c.name)
    expect(names).toContain('TextInput')
    expect(names).toContain('NumberInput')
  })

  it('navigation registry exports expected components', () => {
    expect(navigationComponents.length).toBeGreaterThanOrEqual(4)
    const names = navigationComponents.map(c => c.name)
    expect(names).toContain('Tabs')
  })

  it('overlay registry exports expected components', () => {
    expect(overlayComponents.length).toBeGreaterThanOrEqual(3)
  })

  it('format registry exports expected components', () => {
    expect(formatComponents.length).toBeGreaterThanOrEqual(4)
  })

  it('typography registry exports expected components', () => {
    expect(typographyComponents.length).toBeGreaterThanOrEqual(2)
  })
})

describe('beatuiLibrary', () => {
  it('contains all registered components', () => {
    const totalExpected = layoutComponents.length + buttonComponents.length +
      dataComponents.length + formComponents.length + navigationComponents.length +
      overlayComponents.length + formatComponents.length + typographyComponents.length
    expect(beatuiLibrary.components.size).toBe(totalExpected)
  })

  it('every component name in library matches a registered component', () => {
    for (const [name, comp] of beatuiLibrary.components) {
      expect(comp.name).toBe(name)
      expect(comp.description.length).toBeGreaterThan(0)
    }
  })

  it('renders a basic Button component from the registry', () => {
    const buttonDef = beatuiLibrary.get('Button')
    expect(buttonDef).toBeDefined()
    const rendered = buttonDef!.renderer({ label: 'Test' }, [])
    const clear = render(html.div(rendered), document.body)
    expect(document.body.textContent).toContain('Test')
    clear(true)
  })

  it('renders a basic Stack component from the registry', () => {
    const stackDef = beatuiLibrary.get('Stack')
    expect(stackDef).toBeDefined()
    const rendered = stackDef!.renderer({}, [html.span('child')])
    const clear = render(html.div(rendered), document.body)
    expect(document.body.textContent).toContain('child')
    clear(true)
  })
})
```

- [ ] **Step 2: Run registry tests**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/registry/registry.test.ts`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add packages/beatui/tests/openui/registry/registry.test.ts
git commit -m "test(openui): add registry smoke tests"
```

---

## Task 16: Wire Up Entry Point & Final Exports

**Files:**
- Modify: `packages/beatui/src/openui/index.ts`

- [ ] **Step 1: Update the entry point with all exports**

Replace the stub in `packages/beatui/src/openui/index.ts`:

```ts
/**
 * OpenUI Lang integration for `@tempots/beatui/openui`.
 *
 * Parses OpenUI Lang markup from LLM responses and renders live BeatUI
 * components. Includes a pre-built component library, streaming adapters,
 * and an extensible component registration system.
 *
 * ```ts
 * import { beatuiLibrary, OpenUIRenderer, fromFetch } from '@tempots/beatui/openui'
 * ```
 *
 * @module
 */

// Parser
export { createParser } from './parser/parser'
export { createStreamingParser } from './parser/streaming-parser'
export type { ParseResult, ParseError, ASTNode, Statement, ComponentNameChecker } from './parser/types'

// Library
export { defineComponent } from './library/define-component'
export { createLibrary } from './library/library'
export type { DefinedComponent, Library, ComponentGroup, PromptOptions } from './library/types'

// Pre-built registry
export { beatuiLibrary } from './registry'

// Renderer
export { OpenUIRenderer } from './renderer/openui-renderer'
export { ActionContextProvider } from './renderer/action-context'
export type { OpenUIRendererOptions } from './renderer/openui-renderer'
export type { ActionEvent, ButtonAction, FormSubmitAction, ActionContext } from './renderer/action-context'

// Streaming adapters
export { fromSSE } from './streaming/from-sse'
export { fromFetch } from './streaming/from-fetch'
export { fromWebSocket } from './streaming/from-websocket'
export type { StreamOptions } from './streaming/types'
```

- [ ] **Step 2: Run full build**

Run: `pnpm --filter @tempots/beatui build`
Expected: Build succeeds, `dist/openui/` directory is created with `index.es.js` and `index.cjs.js`

- [ ] **Step 3: Run all openui tests**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/`
Expected: All tests pass

- [ ] **Step 4: Run the full test suite to verify no regressions**

Run: `pnpm test`
Expected: All existing tests still pass

- [ ] **Step 5: Commit**

```bash
git add packages/beatui/src/openui/index.ts
git commit -m "feat(openui): wire up public API entry point"
```

---

## Task 17: Integration Smoke Test

**Files:**
- Create: `packages/beatui/tests/openui/integration.test.ts`

- [ ] **Step 1: Write an end-to-end integration test**

Create `packages/beatui/tests/openui/integration.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { html, render, prop } from '@tempots/dom'
import {
  beatuiLibrary,
  OpenUIRenderer,
  createParser,
  createStreamingParser,
  defineComponent,
  createLibrary,
} from '../../src/openui'

describe('OpenUI integration', () => {
  it('beatuiLibrary has all expected component groups', () => {
    expect(beatuiLibrary.has('Stack')).toBe(true)
    expect(beatuiLibrary.has('Button')).toBe(true)
    expect(beatuiLibrary.has('TextInput')).toBe(true)
    expect(beatuiLibrary.has('Card')).toBe(true)
    expect(beatuiLibrary.has('FormatNumber')).toBe(true)
  })

  it('generates a system prompt', () => {
    const prompt = beatuiLibrary.prompt()
    expect(prompt).toContain('OpenUI Lang')
    expect(prompt).toContain('Stack')
    expect(prompt).toContain('Button')
    expect(prompt.length).toBeGreaterThan(500)
  })

  it('parser + renderer round-trip: static', () => {
    const input = 'root = Stack([Button("Hello")])'
    const tree = OpenUIRenderer({
      library: beatuiLibrary,
      response: input,
    })
    const clear = render(tree, document.body)
    expect(document.body.textContent).toContain('Hello')
    clear(true)
  })

  it('extend library with custom component', () => {
    const MyWidget = defineComponent({
      name: 'MyWidget',
      props: z.object({ title: z.string() }),
      description: 'Custom widget.',
      renderer: (props) => html.div(props.title),
    })

    const extended = beatuiLibrary.extend({ components: [MyWidget] })
    expect(extended.has('MyWidget')).toBe(true)
    expect(extended.has('Button')).toBe(true) // original still present

    const prompt = extended.prompt()
    expect(prompt).toContain('MyWidget')
  })

  it('streaming parser resolves forward references incrementally', () => {
    const parser = createStreamingParser(beatuiLibrary)

    const r1 = parser.push('root = Stack([card])\n')
    expect(r1.meta.unresolved).toContain('card')

    const r2 = parser.push('card = Card("Dashboard")')
    expect(r2.meta.unresolved).not.toContain('card')
  })
})
```

- [ ] **Step 2: Run integration test**

Run: `pnpm --filter @tempots/beatui test -- tests/openui/integration.test.ts`
Expected: All tests pass

- [ ] **Step 3: Run full test suite one final time**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add packages/beatui/tests/openui/integration.test.ts
git commit -m "test(openui): add integration smoke tests"
```
