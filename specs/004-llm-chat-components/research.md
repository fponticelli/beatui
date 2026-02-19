# Research: LLM Chat Components

**Feature**: 004-llm-chat-components
**Date**: 2026-02-19
**Status**: Complete

---

## Table of Contents

1. [Streaming Markdown Rendering](#1-streaming-markdown-rendering)
2. [Virtual Scrolling for Chat](#2-virtual-scrolling-for-chat)
3. [Universal Message Data Model](#3-universal-message-data-model)
4. [Syntax Highlighting for Streaming](#4-syntax-highlighting-for-streaming)
5. [Math and Diagram Rendering](#5-math-and-diagram-rendering)
6. [Scroll Anchoring and Auto-Scroll](#6-scroll-anchoring-and-auto-scroll)

---

## 1. Streaming Markdown Rendering

### Decision: Remend preprocessor + micromark (existing parser) with block-level memoization

### Rationale

BeatUI already uses `micromark` for its `Markdown` component. The simplest upgrade path is to add `remend` (Vercel's standalone markdown healing library) as a preprocessor that auto-closes incomplete markdown constructs during streaming, then feed the healed output through the existing micromark pipeline.

The key performance optimization is **block-level memoization**: split the healed markdown into block-level segments (paragraphs, code fences, lists, headings), cache the HTML output for completed blocks, and only re-parse the last (active) block on each streaming update. This achieves O(n) amortized time vs O(n^2) for naive full re-parse.

### Alternatives Considered

| Library | Pros | Cons | Why Rejected |
|---------|------|------|--------------|
| `streaming-markdown` (smd) | True O(n), append-only DOM, 3KB, recommended by Google Chrome docs | Limited markdown features, custom renderer interface, would require replacing micromark | Migration cost too high; fewer features than micromark |
| `markdown-it-ts` | Purpose-built streaming APIs (`StreamBuffer`, `chunkedParse`), 41-67x faster for append workloads | Newer library, smaller community | Good long-term option if performance becomes a bottleneck |
| `Incremark` | Best benchmarks (37-46x speedup), Solid support, GFM/math/mermaid extensions | v0.3.6, newer project, edge cases with deeply nested structures | Maturity concern for production use; revisit in 6 months |
| `solid-streaming-markdown` | Architecture directly applicable to `@tempots/dom` (fine-grained reactivity) | SolidJS-specific, smaller community | Would need significant adaptation layer |

### Architecture

```
LLM Token Stream → Value<string> signal (accumulated text)
    → remend(text) (heal incomplete markdown)
    → Block Splitter (split into stable blocks + active block)
    → Per-Block Cache (only re-parse changed/new blocks)
    → micromark + extensions (GFM, math)
    → Post-processors (Shiki for code, KaTeX for math, Mermaid for diagrams)
    → @tempots/dom reactive elements
```

### Key Implementation Details

- **Remend** handles: unclosed bold/italic, incomplete code fences, broken links/images, unclosed math blocks, incomplete strikethrough. It is context-aware (respects code blocks, handles LaTeX underscores).
- **Block splitter** uses blank-line boundaries and code fence markers to identify block boundaries. Completed blocks are identified by comparing against the previous render.
- **isStreaming flag**: When `true`, apply remend healing and show Mermaid as code; when `false`, do a final clean render pass without remend.

---

## 2. Virtual Scrolling for Chat

### Decision: `@tanstack/virtual-core` with custom `@tempots/dom` wiring

### Rationale

`@tanstack/virtual-core` is the framework-agnostic core of TanStack Virtual. It provides all the hard primitives (dynamic height measurement via `measureElement` + ResizeObserver, scroll offset observation, scroll position adjustment) without any React dependency. The framework-specific packages (react-virtual, solid-virtual) are thin adapters — we write our own `@tempots/dom` adapter.

### Alternatives Considered

| Library | Pros | Cons | Why Rejected |
|---------|------|------|--------------|
| `virtua` core | ~3KB, auto item size detection, jump compensation, Solid adapter exists | Less widely used than TanStack, smaller community | TanStack has larger ecosystem and better docs |
| Custom implementation | Full control over streaming behavior | ~300-400 lines of core logic, edge-case handling for dynamic heights, resize observers, scroll anchoring | Engineering cost vs. TanStack's battle-tested implementation |
| `react-virtuoso` | Best chat-specific API (MessageList component) | React-only, no extractable core | Framework-locked |

### Key Implementation Details

```typescript
import {
  Virtualizer,
  observeElementRect,
  observeElementOffset,
  elementScroll,
} from '@tanstack/virtual-core'

const virtualizer = new Virtualizer({
  count: messages.length,
  getScrollElement: () => scrollContainer,
  estimateSize: () => 120, // average chat message height
  observeElementRect,
  observeElementOffset,
  scrollToFn: elementScroll,
  measureElement: (el) => el.getBoundingClientRect().height,
  onChange: (instance) => {
    // Drive @tempots/dom reactive updates
    virtualItems.set(instance.getVirtualItems())
  },
})

// Manual lifecycle (required for vanilla JS)
virtualizer._didMount()
virtualizer._willUpdate()
```

### Known Limitations

- Reverse/bottom-anchored chat lists are not officially supported by TanStack Virtual (no official example). Issue [#659](https://github.com/TanStack/virtual/issues/659) reports stuttering when scrolling upward with dynamic heights. Mitigation: use IntersectionObserver-based scroll anchoring (see Section 6) rather than relying solely on TanStack's built-in scroll adjustment.

### Performance Targets

- Render 10-30 visible messages + 5-10 overscan on each side = 20-50 DOM nodes total
- Only observe actively streaming messages with ResizeObserver (not all rendered items)
- Use `requestAnimationFrame`-throttled scroll handling with `{ passive: true }`
- Cache heights for completed messages (they never change after streaming ends)

---

## 3. Universal Message Data Model

### Decision: Multi-part message model (`ChatMessage` with `parts: ContentPart[]`) using discriminated union on `type`

### Rationale

Every major LLM provider and framework has converged on an array-of-parts model:
- **Vercel AI SDK 5.0**: `UIMessage.parts[]` (TextUIPart, ReasoningUIPart, ToolUIPart, FileUIPart, SourceUrlUIPart, etc.)
- **Anthropic**: `Message.content[]` (text, image, tool_use, tool_result, thinking blocks)
- **Google Gemini**: `Content.parts[]` (text, inlineData, functionCall, functionResponse, executableCode)
- **LlamaIndex**: `ChatMessage.blocks[]` (TextBlock, ImageBlock, ToolCallBlock, ThinkingBlock)
- **OpenAI**: Moving toward parts with Responses API `items[]` (message, reasoning, function_call)

A `parts[]` array is the clear convergent direction. It naturally handles multimodal, multi-step assistant messages where text, tool calls, thinking, and images can be interleaved in a single message.

### Alternatives Considered

| Approach | Pros | Cons | Why Rejected |
|----------|------|------|--------------|
| Single `content: string` | Simple | Cannot represent tool calls, thinking, images inline | Too limited for modern LLM output |
| Provider-specific models | Exact API compatibility | N different models, no reuse across providers | UI library should be provider-agnostic |
| OpenAI-style (tool_calls as separate field) | Matches most-used API | Loses ordering between text and tool calls | Anthropic/Gemini embed tool calls in content stream; ordering matters for UI |

### Type Definitions

See `data-model.md` for the full type definitions. Key design decisions:

1. **Roles**: `'system' | 'user' | 'assistant' | 'tool'` — covers all providers
2. **16 content part types** as discriminated union: text, image, audio, video, file, tool-call, tool-result, thinking, source-url, source-document, code, code-result, refusal, step-start, data, resource
3. **Streaming lifecycle states** on parts (from Vercel AI SDK pattern): `'streaming' | 'done'` for text/thinking, `'input-streaming' | 'input-available' | 'output-available' | 'output-error'` for tool calls
4. **Generic `metadata`** field for provider-specific extensions (usage, logprobs, finish_reason, etc.)
5. **`parentId`** for conversation branching support

### Provider Mapping

Adapter/converter functions will be provided for each major provider format:
- `fromOpenAI(messages) → ChatMessage[]`
- `fromAnthropic(messages) → ChatMessage[]`
- `fromGemini(contents) → ChatMessage[]`
- `fromVercelAI(uiMessages) → ChatMessage[]`

These are utility functions, not required for basic usage.

---

## 4. Syntax Highlighting for Streaming

### Decision: Shiki with JavaScript RegExp engine + adaptive throttling

### Rationale

Shiki uses TextMate grammars (same as VS Code), producing the highest-quality syntax highlighting. The JavaScript RegExp engine (`shiki/engine/javascript`) avoids the WASM dependency, reducing bundle size. Shiki's `codeToHast()` method produces HAST (HTML AST) nodes that can be converted directly to `@tempots/dom` elements without `innerHTML`.

### Streaming Strategy

1. **Split code** into complete lines + incomplete last line
2. **Highlight complete lines** using throttled Shiki calls:
   - < 50 lines: highlight every 100ms, debounce 500ms
   - 50-150 lines: 100ms interval, 800ms debounce
   - 150+ lines: skip intermediate highlights, only highlight when streaming stops
3. **Show incomplete last line** as plain monospace text
4. **Use AbortController** to cancel in-flight highlighting when new code arrives
5. **Async yielding**: yield to browser before expensive highlighting to maintain 60fps
6. **Grammar state caching** via `getLastGrammarState()` (experimental Shiki API) to only tokenize new lines

### Alternatives Considered

| Library | Pros | Cons | Why Rejected |
|---------|------|------|--------------|
| Prism.js | Lighter, synchronous | Limited languages/themes, no streaming optimization, less accurate | Quality gap too large for developer-facing chat UI |
| highlight.js | Auto language detection, lighter than Shiki | Less accurate than Shiki, no HAST output | Quality and API concerns |

### Lazy Loading

Languages are loaded on-demand: only the detected language grammar is imported. This keeps the initial bundle small and loads grammars as code blocks appear. Common languages (JS, TS, Python, Bash, JSON) can be pre-bundled.

---

## 5. Math and Diagram Rendering

### Decision: micromark-extension-math + KaTeX for math; Mermaid with validate-then-render for diagrams

### Rationale

**Math**: Since BeatUI already uses micromark, the most natural integration is `micromark-extension-math` which adds `$...$` (inline) and `$$...$$` (block) math syntax. KaTeX renders synchronously (no layout reflow), is dependency-free, and produces consistent output across browsers.

**Diagrams**: Mermaid diagrams cannot be rendered incrementally — they need the complete definition. The standard pattern is validate-then-render: call `mermaid.parse()` to check if the diagram is complete and valid, only then render with `mermaid.render()`.

### Key Details

- **Math**: Use `singleDollarTextMath: false` (double-dollar only) to avoid false positives with currency symbols in LLM output
- **Math**: Cache rendered expressions (keyed by LaTeX source string) to avoid re-rendering identical equations
- **Mermaid**: Set `startOnLoad: false` and render programmatically to avoid DOM scanning conflicts with reactive frameworks
- **Mermaid**: Render to a detached element, then insert the SVG (Mermaid modifies real DOM directly)
- **Mermaid**: Lazy-load (~250KB) only when a `mermaid` code block is detected
- **During streaming**: Show mermaid code blocks as syntax-highlighted code; attempt validation on each update; render SVG when valid

### Bundle Impact

| Dependency | Size (gzipped) | Loading Strategy |
|-----------|----------------|------------------|
| `micromark-extension-math` | ~8KB | Included in chat bundle when math feature enabled |
| `katex` + CSS | ~130KB | Lazy-loaded on first math expression |
| `mermaid` | ~250KB | Lazy-loaded on first mermaid code block |

---

## 6. Scroll Anchoring and Auto-Scroll

### Decision: IntersectionObserver-based `isAtBottom` detection + CSS `overflow-anchor` progressive enhancement

### Rationale

The standard approach used by production chat UIs (Vercel AI SDK, ChatGPT-style interfaces) is:

1. Place a sentinel element at the bottom of the message list
2. Use `IntersectionObserver` to track whether the sentinel is visible (`isAtBottom` signal)
3. When streaming and `isAtBottom` is true, auto-scroll via `scrollIntoView({ block: 'end' })`
4. When user scrolls up, `isAtBottom` becomes false, disabling auto-scroll
5. Show a "scroll to bottom" floating button when `isAtBottom` is false

CSS `overflow-anchor` is used as a progressive enhancement (works in Chrome/Firefox/Edge, not Safari) for native browser scroll anchoring.

### Key Implementation Details

```typescript
const isAtBottom = prop(true)

// IntersectionObserver on sentinel element
const observer = new IntersectionObserver(
  ([entry]) => isAtBottom.set(entry.isIntersecting),
  { root: scrollContainer, threshold: 0 }
)
observer.observe(sentinelElement)

// Auto-scroll when streaming + at bottom
computedOf(isAtBottom, isStreaming)((atBottom, streaming) => {
  if (atBottom && streaming) {
    requestAnimationFrame(() => {
      sentinelElement.scrollIntoView({ block: 'end' })
    })
  }
})
```

### Scroll Position Preservation on History Load

When loading older messages (prepending to the list):
1. Capture `scrollHeight` and `scrollTop` before DOM change
2. Prepend messages
3. After DOM update, set `scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight)`

### Performance

- Use `{ passive: true }` for all scroll event listeners
- Throttle scroll handlers to `requestAnimationFrame`
- For the streaming message, observe only the active message with ResizeObserver (not all rendered items)
- Use `behavior: 'instant'` for auto-scroll during streaming (smooth is too slow), `behavior: 'smooth'` for the "scroll to bottom" button click

---

## Sources

### Streaming Markdown
- [Vercel Streamdown](https://github.com/vercel/streamdown) — Open-source streaming markdown renderer
- [Remend](https://vercel.com/changelog/new-npm-package-for-automatic-recovery-of-broken-streaming-markdown) — Standalone markdown healing preprocessor
- [streaming-markdown (smd)](https://github.com/thetarnav/streaming-markdown) — Append-only DOM streaming parser
- [Semidown](https://github.com/chuanqisun/semidown) — Semi-incremental markdown parser
- [Incremark](https://www.incremark.com/) — High-performance incremental streaming parser
- [markdown-it-ts](https://github.com/Simon-He95/markdown-it-ts) — TypeScript markdown-it with streaming APIs
- [solid-streaming-markdown](https://github.com/andi23rosca/solid-streaming-markdown) — Fine-grained reactive streaming parser
- [Google Chrome: Render LLM Responses](https://developer.chrome.com/docs/ai/render-llm-responses) — Best practices guide
- [Shopify Sidekick Streaming](https://shopify.engineering/sidekicks-improved-streaming) — Buffered state machine approach

### Virtual Scrolling
- [TanStack Virtual](https://tanstack.com/virtual/latest/docs/introduction) — Framework-agnostic virtual scrolling
- [TanStack Virtual-Core API](https://tanstack.com/virtual/latest/docs/api/virtualizer) — Core Virtualizer reference
- [Virtua](https://github.com/inokawa/virtua) — Zero-config virtual list (~3KB)
- [TanStack Virtual #659](https://github.com/TanStack/virtual/issues/659) — Dynamic height stutter bug
- [Open WebUI Performance Discussion](https://github.com/open-webui/open-webui/discussions/13787) — Large chat history performance

### Message Data Model
- [Vercel AI SDK 5 UIMessage](https://ai-sdk.dev/docs/reference/ai-sdk-core/ui-message) — parts[] model reference
- [Vercel AI SDK 5 Blog](https://vercel.com/blog/ai-sdk-5) — Migration to parts model
- [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat) — Message format
- [Anthropic Messages API](https://docs.anthropic.com/en/api/messages) — Content block format
- [Gemini API Reference](https://ai.google.dev/api/generate-content) — Parts format
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25) — Content types
- [LlamaIndex ContentBlock PR](https://github.com/run-llama/llama_index/pull/17039) — blocks[] model

### Syntax Highlighting
- [Shiki](https://shiki.style/) — TextMate grammar-based highlighter
- [shiki-stream](https://github.com/antfu/shiki-stream) — Streaming transform for Shiki
- [Shiki Grammar State Discussion](https://github.com/shikijs/shiki/discussions/891) — Incremental highlighting

### Math & Diagrams
- [micromark-extension-math](https://github.com/micromark/micromark-extension-math) — Math syntax for micromark
- [KaTeX](https://katex.org/) — Fast math typesetting
- [Mermaid.js](https://mermaid.js.org/) — Diagram rendering

### Scroll Anchoring
- [CSS overflow-anchor (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor)
- [CSS-Tricks: Pin Scrolling to Bottom](https://css-tricks.com/books/greatest-css-tricks/pin-scrolling-to-bottom/)
- [Intuitive Scrolling for Chatbot Streaming](https://tuffstuff9.hashnode.dev/intuitive-scrolling-for-chatbot-message-streaming)
