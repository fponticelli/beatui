# Implementation Plan: LLM Chat Components

**Branch**: `004-llm-chat-components` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-llm-chat-components/spec.md`

## Summary

Implement a comprehensive set of LLM chat UI components for BeatUI, organized as a new optional entry point (`@tempots/beatui/chat`). The components cover: core chat layout (container, message list, input), rich content rendering (streaming markdown, syntax-highlighted code blocks, math, diagrams), agentic/tool-use visualization (thinking blocks, tool call displays, status bars), and conversation management (sidebar, branching, reactions). Built on `@tempots/dom` reactive primitives with a universal multi-part message data model compatible with all major LLM providers.

## Technical Context

**Language/Version**: TypeScript 5.9+ (ES2020 target), matching existing BeatUI codebase
**Primary Dependencies**:
- `@tempots/dom` ^35.1.0 (reactive DOM, fine-grained signals)
- `@tempots/ui` ^14.1.0 (UI utilities)
- `@tempots/std` ~0.25.2 (standard utilities)
- `remend` (streaming markdown healing/preprocessing)
- `micromark` + extensions (existing markdown parser, extended with math/GFM)
- `shiki` with JS RegExp engine (syntax highlighting, lazy-loaded per language)
- `katex` (LaTeX math rendering, optional)
- `mermaid` (diagram rendering, lazy-loaded, optional)
- `@tanstack/virtual-core` (framework-agnostic virtual scrolling)
**Storage**: N/A (client-side component state only; consumers manage persistence)
**Testing**: Vitest with jsdom environment + `@testing-library/dom` (matching existing test setup)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari latest), desktop and mobile
**Project Type**: Library package (monorepo: `packages/beatui/`)
**Performance Goals**:
- First message render: < 16ms
- Streaming token render: < 8ms per token (no visible jank)
- Scroll performance: 60fps during active streaming
- Virtual scrolling: supports 1000+ messages
**Constraints**:
- Chat entry point (`@tempots/beatui/chat`) < 50KB gzipped (core, without optional deps)
- Optional features (Shiki, KaTeX, Mermaid) lazy-loaded, not in core bundle
- Must work with existing BeatUI theme system (light/dark)
- Must follow existing CSS architecture (layers, `bc-` prefix)
- Must integrate with existing i18n system for RTL support
**Scale/Scope**: ~43 components across 6 tiers; Phase 1 targets ~15 core + rich content components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is currently a template with placeholder values (no project-specific principles have been ratified). Therefore, no specific gates block this feature. The following general best practices are applied as implicit gates:

| Gate | Status | Notes |
|------|--------|-------|
| Components are self-contained and independently testable | PASS | Each component is a standalone function with typed options |
| Test coverage required | PASS | Unit tests with Vitest + jsdom planned for all Tier 1-2 components |
| No unnecessary complexity | PASS | Phased approach; each tier independently deliverable |
| Follows existing codebase patterns | PASS | Uses existing CSS architecture, component patterns, entry points |
| Backwards compatible | PASS | New entry point; no changes to existing components |

## Project Structure

### Documentation (this feature)

```text
specs/004-llm-chat-components/
├── plan.md              # This file
├── research.md          # Phase 0 output - technical research findings
├── data-model.md        # Phase 1 output - message data model and types
├── quickstart.md        # Phase 1 output - integration guide
├── contracts/           # Phase 1 output - component API contracts
│   ├── chat-container.ts
│   ├── message-list.ts
│   ├── message-bubble.ts
│   ├── chat-input.ts
│   ├── streaming-text.ts
│   ├── code-block.ts
│   ├── thinking-block.ts
│   └── tool-call-display.ts
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/beatui/
├── src/
│   ├── chat/                              # New: chat entry point
│   │   ├── index.ts                       # Public API exports
│   │   ├── types.ts                       # ChatMessage, ContentPart, etc.
│   │   ├── components/
│   │   │   ├── chat-container.ts          # Top-level chat layout
│   │   │   ├── message-list.ts            # Virtualized message list
│   │   │   ├── message-bubble.ts          # Individual message display
│   │   │   ├── chat-input.ts              # Auto-resizing input with send/stop
│   │   │   ├── system-message.ts          # Inline system messages
│   │   │   ├── typing-indicator.ts        # Loading/thinking animation
│   │   │   ├── streaming-text.ts          # Token-by-token text rendering
│   │   │   ├── code-block.ts              # Syntax-highlighted code + copy
│   │   │   ├── copy-button.ts             # Universal copy-to-clipboard
│   │   │   ├── thinking-block.ts          # Collapsible reasoning display
│   │   │   ├── tool-call-display.ts       # Tool call visualization
│   │   │   ├── tool-call-chain.ts         # Multi-step tool timeline
│   │   │   ├── agent-status-bar.ts        # Long-running agent status
│   │   │   ├── message-actions.ts         # Hover action bar
│   │   │   ├── message-reactions.ts       # Thumbs up/down feedback
│   │   │   ├── conversation-list.ts       # Sidebar conversation list
│   │   │   ├── welcome-screen.ts          # New conversation empty state
│   │   │   ├── scroll-to-bottom.ts        # Floating scroll button
│   │   │   └── context-window-indicator.ts # Token usage display
│   │   └── utils/
│   │       ├── streaming-markdown.ts      # Remend + micromark streaming pipeline
│   │       ├── block-memoizer.ts          # Block-level parse memoization
│   │       ├── virtual-chat-list.ts       # TanStack virtual-core adapter
│   │       ├── scroll-anchor.ts           # IntersectionObserver scroll anchoring
│   │       └── clipboard.ts              # Clipboard API wrapper
│   ├── styles/
│   │   └── layers/
│   │       └── 03.components/
│   │           └── chat/                  # New: chat component styles
│   │               ├── _chat-container.css
│   │               ├── _message-bubble.css
│   │               ├── _chat-input.css
│   │               ├── _code-block.css
│   │               ├── _thinking-block.css
│   │               ├── _tool-call.css
│   │               ├── _typing-indicator.css
│   │               ├── _conversation-list.css
│   │               └── _welcome-screen.css
│   └── tokens/
│       └── chat.ts                        # New: chat-specific design tokens
├── tests/
│   └── chat/                              # New: chat component tests
│       ├── chat-container.test.ts
│       ├── message-bubble.test.ts
│       ├── chat-input.test.ts
│       ├── streaming-text.test.ts
│       ├── code-block.test.ts
│       ├── thinking-block.test.ts
│       ├── tool-call-display.test.ts
│       ├── copy-button.test.ts
│       └── types.test.ts                  # Data model type tests
```

**Structure Decision**: Follow existing BeatUI monorepo pattern with a new `src/chat/` directory as an optional entry point (`@tempots/beatui/chat`), matching the pattern of `src/lexical/`, `src/monaco/`, `src/markdown/`. CSS files go in the existing layered architecture under `src/styles/layers/03.components/chat/`. Design tokens in `src/tokens/chat.ts`.

## Complexity Tracking

No constitution violations. The phased approach ensures each tier can be delivered independently.

| Design Decision | Why Chosen | Simpler Alternative Rejected Because |
|----------------|------------|--------------------------------------|
| `@tanstack/virtual-core` for virtual scrolling | Battle-tested, framework-agnostic core; avoids writing 300+ lines of custom virtualizer | Custom implementation lacks edge-case handling for dynamic heights, resize observers, scroll anchoring |
| `remend` + micromark (not custom streaming parser) | Minimal migration from existing `Markdown` component; remend is battle-tested at Vercel | Custom streaming parser (like `streaming-markdown`) would require replacing existing micromark pipeline |
| Shiki (not Prism/highlight.js) for syntax highlighting | VS Code-quality output, grammar state caching for streaming, HAST output avoids innerHTML | Prism is lighter but has far fewer language grammars and no streaming optimization support |
| Multi-part message model (`parts[]` array) | Industry convergence (Vercel AI SDK 5, Anthropic, Gemini, LlamaIndex all use this) | Single `content: string` field cannot represent tool calls, thinking, images inline |
