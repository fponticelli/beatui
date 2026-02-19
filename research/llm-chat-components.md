# LLM Chat Components Research

**Date:** 2026-02-19
**Status:** Research / Proposal
**Context:** Components for BeatUI (`@tempots/beatui`) to support sophisticated LLM chat conversations and interactions

---

## Executive Summary

Modern LLM chat interfaces have evolved far beyond simple message lists. The 2025-2026 landscape demands purpose-built UI components that handle streaming partial content, rich formatted output (code, math, diagrams), tool-call visualization, reasoning displays, artifact rendering, conversation branching, and agentic workflows. BeatUI already has strong foundations (Lexical editor, Markdown renderer, Avatar, Layout primitives, theme system) but lacks chat-specific components entirely.

This document proposes a comprehensive set of components organized into tiers by priority.

---

## Table of Contents

1. [Existing BeatUI Foundations](#existing-beatui-foundations)
2. [Tier 1 - Core Chat Components](#tier-1---core-chat-components)
3. [Tier 2 - Rich Content Rendering](#tier-2---rich-content-rendering)
4. [Tier 3 - Agentic & Tool-Use Components](#tier-3---agentic--tool-use-components)
5. [Tier 4 - Artifact / Canvas System](#tier-4---artifact--canvas-system)
6. [Tier 5 - Advanced Conversation UX](#tier-5---advanced-conversation-ux)
7. [Tier 6 - Productivity & Polish](#tier-6---productivity--polish)
8. [Component Catalog](#component-catalog)
9. [Architecture Considerations](#architecture-considerations)
10. [Sources & References](#sources--references)

---

## Existing BeatUI Foundations

The following existing components provide a strong base for building LLM chat UI:

| Existing Component | Relevance to Chat |
|---|---|
| **Lexical Editor** | Rich text input with markdown, slash commands, Yjs collaboration |
| **Markdown** (`@tempots/beatui/markdown`) | Render model responses with GFM support |
| **Monaco Editor** (`@tempots/beatui/monaco`) | Code block editing and display |
| **Avatar / AvatarGroup** | User and assistant identity display |
| **AppShell** | Full-page layout with sidebar for conversation list |
| **ScrollablePanel** | Message list scrolling with edge detection |
| **Stack** | Flex layout primitives for message alignment |
| **Button / ToggleButton** | Action buttons (send, regenerate, copy, like/dislike) |
| **TextArea / TextInput** | Chat input fields |
| **Modal / Drawer / Popover** | Settings panels, conversation history, context menus |
| **Tooltip** | Hover information on tool calls, timestamps |
| **Skeleton** | Loading placeholders for streaming |
| **Badge** | Status indicators, model labels |
| **Icon** (Iconify) | Action and status iconography |
| **Notification system** | System messages, error alerts |
| **Theme system** | Light/dark mode support |
| **i18n** | Multilingual chat interfaces |

**Key gaps:** No message bubble, chat list, chat input wrapper, streaming text display, code block with copy, thinking indicator, or tool-call visualization.

---

## Tier 1 - Core Chat Components

These are the minimum viable components needed for any LLM chat interface.

### 1.1 `ChatContainer`

Top-level container that orchestrates the chat layout.

- Manages the split between message list and input area
- Handles auto-scroll behavior (scroll-to-bottom on new messages, pause when user scrolls up)
- Provides a "scroll to bottom" floating button when not at the bottom
- Accepts optional sidebar slot for conversation list
- Responsive: full-width on mobile, constrained-width on desktop

### 1.2 `MessageList`

Virtualized, scrollable list of messages.

- Efficient rendering for long conversations (virtual scrolling or windowing)
- Groups consecutive messages from the same sender
- Supports date separators between message groups
- Handles dynamic height as streaming messages grow
- Anchor scrolling: stays at bottom during streaming, preserves position when loading history
- Empty state when no messages exist

### 1.3 `MessageBubble`

Individual message display container.

- Variant styling for `user`, `assistant`, `system`, and `error` roles
- Avatar display (configurable position: left, right, or hidden)
- Sender name and optional model name badge
- Timestamp display (relative or absolute, toggleable on hover)
- Action bar on hover: copy, regenerate, edit, like/dislike, branch
- Support for multi-part messages (text + images + tool calls in one message)
- Visual distinction between complete and still-streaming messages
- Collapsed/expanded state for long messages

### 1.4 `ChatInput`

Composable chat input area.

- Auto-resizing textarea that grows with content (up to a configurable max height)
- Send button (enabled only when input is non-empty or attachments exist)
- Stop button (visible during active generation, cancels the stream)
- Keyboard shortcuts: Enter to send, Shift+Enter for newline, Escape to cancel
- Slot for attachment button and file preview row
- Slot for model selector, temperature, or other parameters
- Optional character/token count display
- Disabled state while waiting for response (configurable)
- Paste support for images (inline preview before send)

### 1.5 `ConversationList`

Sidebar listing past conversations.

- Search/filter conversations
- Conversation title (auto-generated or user-edited)
- Last message preview and timestamp
- Active conversation highlight
- New conversation button
- Drag-to-reorder or folder organization
- Context menu (rename, delete, archive, export)

### 1.6 `SystemMessage`

Inline system-level messages within the chat.

- Styled distinctly from user/assistant messages (centered, muted)
- Used for: "conversation started", "model changed", "context cleared", errors
- Optional icon prefix

### 1.7 `TypingIndicator`

Shows the assistant is generating a response.

- Animated dots or pulsing indicator
- Optional label: "Thinking...", "Searching...", "Generating code..."
- Appears in the message list at the position where the response will appear
- Disappears when streaming begins

---

## Tier 2 - Rich Content Rendering

Components for rendering the diverse content types that LLMs produce.

### 2.1 `StreamingText`

Progressive text rendering optimized for token-by-token streaming.

- Renders tokens as they arrive without re-parsing the entire content
- Smooth animation (word-by-word or character-by-character reveal)
- Cursor/caret indicator at the streaming position
- Memoization of already-parsed blocks (critical for performance)
- Handles incomplete markdown gracefully (unclosed bold, partial code fences)
- Compatible with `MarkdownRenderer` for final display

### 2.2 `MarkdownRenderer` (Enhanced)

Extended markdown rendering beyond the current `Markdown` component.

- **GitHub Flavored Markdown**: tables, task lists, strikethrough, autolinks
- **Syntax-highlighted code blocks** with language detection and copy button
- **LaTeX/KaTeX** math rendering (inline `$...$` and block `$$...$$`)
- **Mermaid diagrams** rendered as interactive SVGs
- **Collapsible sections** for `<details>` tags
- **Image rendering** with lightbox on click
- **Table of contents** generation for long responses
- **Link safety**: sanitize URLs, warn on external links
- **Streaming-aware**: handles partial markdown during streaming

### 2.3 `CodeBlock`

Dedicated code display component.

- Syntax highlighting via Shiki or Prism (lazy-loaded per language)
- Language label badge
- Copy-to-clipboard button
- Line numbers (toggleable)
- Line highlighting (for diffs or emphasis)
- Word wrap toggle
- Collapsible for long blocks (show first N lines with "expand" button)
- Optional "Run" button for supported languages (sandboxed)
- Optional "Apply to file" or "Insert" action for IDE-like workflows
- Diff view mode (before/after) for code modifications

### 2.4 `InlineCode`

Styled inline code spans within message text.

- Monospace font with subtle background
- Copy on click (optional)

### 2.5 `ImageDisplay`

Image rendering within messages.

- User-uploaded images (thumbnails with lightbox)
- AI-generated images (with generation metadata)
- Loading placeholder while image generates
- Zoom/pan capabilities
- Download button
- Gallery mode for multiple images

### 2.6 `FileAttachment`

Display for file attachments in messages.

- File icon based on type
- File name, size, type metadata
- Preview for supported types (PDF, images, text)
- Download action
- Remove action (for user's pending attachments in input)

### 2.7 `Citation`

Inline citation/reference markers.

- Superscript numbered references `[1]`, `[2]`
- Hover popover showing source title, URL, and snippet
- Click to expand source panel
- Grouped citation list at the end of a message

### 2.8 `TableDisplay`

Enhanced table rendering for structured data.

- Sortable columns
- Horizontal scroll for wide tables
- Row highlighting
- Copy table as CSV/TSV
- Optional pagination for large datasets

---

## Tier 3 - Agentic & Tool-Use Components

Components for visualizing LLM tool calls, multi-step reasoning, and agentic workflows. This is the fastest-growing area in 2025-2026.

### 3.1 `ThinkingBlock`

Display for model reasoning/thinking tokens (extended thinking, chain-of-thought).

- Collapsible section with "Thinking..." header
- Animated expand/collapse
- Duration indicator (how long the model spent thinking)
- Token count for the reasoning trace
- Distinct visual styling (muted background, italicized text)
- Streaming-aware: shows thinking in real-time or after completion

### 3.2 `ToolCallDisplay`

Visualization of a tool/function call made by the model.

- Tool name with icon
- Collapsible input parameters (formatted JSON or key-value display)
- Execution status indicator: `pending`, `running`, `success`, `error`
- Duration of execution
- Collapsible output/result display
- Error message display with retry option
- Visual connector to the message that triggered it

### 3.3 `ToolCallChain`

Visualization of multi-step tool call sequences.

- Vertical timeline/stepper showing sequential tool calls
- Each step shows: tool name, brief status, duration
- Expandable details for each step
- Overall progress indicator
- Parallel tool calls shown side-by-side
- Final result highlighted

### 3.4 `AgentStatusBar`

Persistent status indicator for long-running agentic tasks.

- Current action description ("Searching the web...", "Reading file...", "Running tests...")
- Progress indicator (determinate or indeterminate)
- Cancel/stop button
- Elapsed time
- Step counter ("Step 3 of ~7")

### 3.5 `SearchResultsCard`

Display for web search or RAG retrieval results.

- Source title, URL, and favicon
- Snippet/excerpt text
- Relevance score (optional)
- Expandable full content
- "Used in response" indicator

### 3.6 `MCPToolBadge`

Badge indicating MCP (Model Context Protocol) server tools availability.

- Connected server indicator
- Hover tooltip listing available tools
- Connection status (connected, disconnected, error)

### 3.7 `ApprovalPrompt`

Human-in-the-loop confirmation UI for sensitive tool actions.

- Description of the proposed action
- Parameters display
- Approve / Deny / Modify buttons
- Timeout indicator
- Risk level badge (informational, caution, danger)

---

## Tier 4 - Artifact / Canvas System

Components for the "artifact" or "canvas" pattern popularized by Claude Artifacts and ChatGPT Canvas.

### 4.1 `ArtifactPanel`

Side panel for rendering standalone artifacts.

- Slide-in panel adjacent to chat (resizable)
- Tab bar for multiple artifacts
- Artifact type indicator (code, document, visualization, app)
- Version history with navigation between versions
- Close / minimize / maximize controls
- Responsive: full-screen overlay on mobile

### 4.2 `ArtifactPreview`

Inline preview card within a message that links to the full artifact.

- Compact card with title, type icon, and preview thumbnail
- Click to open in `ArtifactPanel`
- Quick actions: copy, download, open in new tab

### 4.3 `CodeArtifact`

Full code artifact with editing capabilities.

- Monaco editor integration for editing
- Multi-file support with file tabs
- Run/preview for HTML/JS/CSS
- Diff view against previous versions
- Download as file or zip

### 4.4 `DocumentArtifact`

Rich document artifact.

- Rendered markdown/HTML content
- Inline editing with ProseMirror or Lexical
- Export as PDF, Markdown, or HTML
- Version comparison

### 4.5 `VisualizationArtifact`

Interactive visualization artifact.

- Sandboxed iframe for HTML/JS visualizations
- Mermaid diagram rendering
- Chart rendering (Vega-Lite, Chart.js)
- SVG rendering and manipulation
- Interactive 3D (Three.js)

### 4.6 `ReactArtifact`

Live React component preview (sandboxed).

- Sandboxed rendering of AI-generated React components
- Hot-reload on edits
- Props panel for interactive experimentation
- Error boundary with friendly error display

---

## Tier 5 - Advanced Conversation UX

Components for power-user conversation management.

### 5.1 `MessageBranching`

Conversation forking and branching at any message.

- Branch indicator on messages that have multiple continuations
- Branch navigation arrows (left/right) to switch between branches
- Branch count badge
- Visual tree view of conversation branches (optional)
- Merge or compare branches

### 5.2 `MessageEditor`

Edit a previously sent user message.

- Inline editing mode that replaces the message bubble content
- Save / Cancel buttons
- Option to regenerate from the edited message (creates a new branch)
- Edit history indicator

### 5.3 `RegenerateControl`

Regenerate the assistant's response.

- Regenerate button in the message action bar
- Option to select a different model for regeneration
- Navigation between multiple generations (response 1/3, 2/3, etc.)
- Side-by-side comparison mode

### 5.4 `ModelSelector`

Select or switch the LLM model.

- Dropdown or modal with available models
- Model metadata: name, provider, capability badges (vision, tools, reasoning)
- Context window size and pricing indicators
- Quick-switch in the chat input area
- Per-message model display

### 5.5 `ConversationSearch`

Search within the current conversation.

- Search bar with result highlighting
- Navigate between matches (prev/next)
- Filter by role (user only, assistant only)
- Full-text search across all conversations

### 5.6 `ContextWindowIndicator`

Visualize the conversation's token usage.

- Progress bar showing tokens used vs. context window limit
- Breakdown: system prompt, conversation history, latest message
- Warning when approaching limit
- Suggestion to summarize or start new conversation

### 5.7 `MessageReactions`

Feedback mechanism for messages.

- Thumbs up / thumbs down buttons
- Optional detailed feedback form on downvote
- Reaction state persisted and displayed
- Useful for RLHF data collection

---

## Tier 6 - Productivity & Polish

Components that enhance the overall experience.

### 6.1 `PromptTemplates`

Pre-defined prompt templates and shortcuts.

- Template library (grid or list view)
- Template categories and search
- Variable placeholders with fill-in form
- Custom template creation and saving
- Slash command integration (`/template`)

### 6.2 `ShareConversation`

Export and share conversations.

- Generate shareable link
- Export as Markdown, JSON, PDF, or image
- Privacy controls (redact user messages, system prompts)
- Embed snippet for websites

### 6.3 `VoiceInput`

Speech-to-text input mode.

- Microphone button in chat input
- Real-time transcription display
- Language selection
- Voice activity detection (auto-stop)

### 6.4 `VoiceOutput`

Text-to-speech for assistant responses.

- Play button on messages
- Voice selection
- Speed control
- Auto-play option for new messages

### 6.5 `TokenUsageDisplay`

Display token consumption and costs.

- Input/output token counts per message
- Running total for conversation
- Cost estimate (when pricing is configured)
- Model-specific token counting

### 6.6 `KeyboardShortcutsPanel`

Discoverable keyboard shortcuts.

- Shortcut overlay (triggered by `?` or shortcut key)
- Categorized shortcuts: navigation, editing, actions
- Customizable bindings

### 6.7 `WelcomeScreen`

Empty state when starting a new conversation.

- Greeting with model name/capabilities
- Suggested prompts or conversation starters
- Quick-access to recent conversations
- Capability cards (what the model can do)

### 6.8 `CopyButton`

Universal copy-to-clipboard component.

- Click to copy with visual feedback (checkmark)
- Tooltip showing "Copy" / "Copied!"
- Works on code blocks, messages, and inline content
- Configurable content formatter

---

## Component Catalog

Summary table of all proposed components with priority and complexity.

| # | Component | Tier | Priority | Complexity | Depends On |
|---|---|---|---|---|---|
| 1 | `ChatContainer` | 1 | Critical | Medium | MessageList, ChatInput |
| 2 | `MessageList` | 1 | Critical | High | MessageBubble, virtual scrolling |
| 3 | `MessageBubble` | 1 | Critical | Medium | Avatar, CopyButton |
| 4 | `ChatInput` | 1 | Critical | Medium | TextArea, Button |
| 5 | `ConversationList` | 1 | High | Medium | Search, context menu |
| 6 | `SystemMessage` | 1 | High | Low | - |
| 7 | `TypingIndicator` | 1 | High | Low | - |
| 8 | `StreamingText` | 2 | Critical | High | Memoization, parser |
| 9 | `MarkdownRenderer` | 2 | Critical | High | Existing Markdown, CodeBlock, KaTeX |
| 10 | `CodeBlock` | 2 | Critical | Medium | Shiki/Prism, CopyButton |
| 11 | `InlineCode` | 2 | High | Low | - |
| 12 | `ImageDisplay` | 2 | High | Medium | Lightbox |
| 13 | `FileAttachment` | 2 | Medium | Low | Icon |
| 14 | `Citation` | 2 | Medium | Medium | Popover |
| 15 | `TableDisplay` | 2 | Medium | Medium | Existing Table |
| 16 | `ThinkingBlock` | 3 | Critical | Medium | Collapse animation |
| 17 | `ToolCallDisplay` | 3 | Critical | Medium | CodeBlock (for params) |
| 18 | `ToolCallChain` | 3 | High | Medium | ToolCallDisplay, timeline |
| 19 | `AgentStatusBar` | 3 | High | Low | ProgressBar |
| 20 | `SearchResultsCard` | 3 | Medium | Low | Card |
| 21 | `MCPToolBadge` | 3 | Medium | Low | Badge, Tooltip |
| 22 | `ApprovalPrompt` | 3 | Medium | Medium | Button, Card |
| 23 | `ArtifactPanel` | 4 | High | High | Panel, tabs, resize |
| 24 | `ArtifactPreview` | 4 | High | Low | Card |
| 25 | `CodeArtifact` | 4 | High | High | Monaco, diff |
| 26 | `DocumentArtifact` | 4 | Medium | High | Lexical/ProseMirror |
| 27 | `VisualizationArtifact` | 4 | Medium | High | Sandboxed iframe |
| 28 | `ReactArtifact` | 4 | Low | Very High | Sandbox, bundler |
| 29 | `MessageBranching` | 5 | High | High | Tree data structure |
| 30 | `MessageEditor` | 5 | High | Medium | ChatInput variant |
| 31 | `RegenerateControl` | 5 | High | Medium | ModelSelector |
| 32 | `ModelSelector` | 5 | Medium | Medium | Dropdown |
| 33 | `ConversationSearch` | 5 | Medium | Medium | Search, highlighting |
| 34 | `ContextWindowIndicator` | 5 | Medium | Low | ProgressBar |
| 35 | `MessageReactions` | 5 | Medium | Low | Button, Icon |
| 36 | `PromptTemplates` | 6 | Medium | Medium | Modal, form |
| 37 | `ShareConversation` | 6 | Low | Medium | Export utilities |
| 38 | `VoiceInput` | 6 | Low | Medium | Web Speech API |
| 39 | `VoiceOutput` | 6 | Low | Medium | Web Speech API |
| 40 | `TokenUsageDisplay` | 6 | Low | Low | Badge |
| 41 | `KeyboardShortcutsPanel` | 6 | Low | Low | Modal |
| 42 | `WelcomeScreen` | 6 | Medium | Low | Card, Button |
| 43 | `CopyButton` | 6 | Critical | Low | Tooltip |

---

## Architecture Considerations

### Entry Point Strategy

Following BeatUI's existing pattern of optional entry points, chat components should be a separate subpath:

```
@tempots/beatui/chat        - Core chat components (Tiers 1, 5, 6)
@tempots/beatui/chat-render - Rich content rendering (Tier 2)
@tempots/beatui/chat-agent  - Agentic/tool-use components (Tier 3)
@tempots/beatui/chat-artifact - Artifact/canvas system (Tier 4)
```

This keeps bundle sizes minimal -- consumers only import what they need.

### Data Model

A well-defined message data model is essential. Key considerations:

```typescript
interface ChatMessage {
  id: string
  parentId: string | null          // For branching
  role: 'user' | 'assistant' | 'system' | 'tool'
  parts: MessagePart[]             // Multi-part messages
  model?: string                   // Which model generated this
  timestamp: number
  status: 'pending' | 'streaming' | 'complete' | 'error'
  metadata?: Record<string, unknown>
}

type MessagePart =
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'tool-call'; toolName: string; args: unknown; status: ToolCallStatus; result?: unknown }
  | { type: 'thinking'; content: string; durationMs?: number }
  | { type: 'citation'; sources: CitationSource[] }
  | { type: 'artifact'; artifactId: string; artifactType: string }
  | { type: 'file'; name: string; size: number; mimeType: string; url: string }
  | { type: 'error'; message: string; code?: string }
```

This multi-part message model (inspired by Vercel AI SDK 5.0's `message.parts` array) is the current industry standard and allows flexible composition of content types within a single message.

### Streaming Architecture

Streaming is the defining UX challenge of LLM chat. Key decisions:

1. **Token-level reactivity**: Use `@tempots/dom`'s `Value<T>` signals to efficiently update only the changing parts of the UI
2. **Memoized block parsing**: Parse completed markdown blocks once, only re-parse the active streaming block
3. **Backpressure handling**: Buffer tokens if rendering falls behind
4. **Abort controller integration**: Clean cancellation of streams

### Accessibility Requirements

- ARIA roles: `log` for message list, `status` for typing indicator
- Screen reader announcements for new messages
- Keyboard navigation between messages
- Focus management when sending/receiving
- Reduced motion support for streaming animations
- High contrast mode support

### CSS Architecture

Following existing BeatUI conventions:

- Component class prefix: `bc-chat-*` (e.g., `bc-chat-bubble`, `bc-chat-input`)
- CSS files in `src/styles/layers/03.components/chat/`
- Design tokens for chat-specific values (bubble colors, spacing, max-widths)
- Dark mode support via existing theme system

### Performance Targets

- **First message render**: < 16ms
- **Streaming token render**: < 8ms per token
- **Scroll performance**: 60fps during streaming
- **Memory**: Efficient for conversations with 1000+ messages (virtualization)
- **Code highlighting**: Lazy-loaded per language to minimize initial bundle

---

## Recommended Implementation Order

1. **Phase 1 - Foundation**: `CopyButton`, `TypingIndicator`, `SystemMessage`, `MessageBubble`, `ChatInput`, `MessageList`, `ChatContainer`
2. **Phase 2 - Rich Content**: `StreamingText`, `CodeBlock`, `MarkdownRenderer` (enhanced), `InlineCode`, `ImageDisplay`
3. **Phase 3 - Agentic**: `ThinkingBlock`, `ToolCallDisplay`, `ToolCallChain`, `AgentStatusBar`, `ApprovalPrompt`
4. **Phase 4 - Power Features**: `MessageBranching`, `MessageEditor`, `RegenerateControl`, `ConversationList`, `ModelSelector`, `WelcomeScreen`
5. **Phase 5 - Artifacts**: `ArtifactPanel`, `ArtifactPreview`, `CodeArtifact`, `DocumentArtifact`, `VisualizationArtifact`
6. **Phase 6 - Polish**: Everything else as needed

---

## Sources & References

- [LlamaIndex Chat UI](https://ui.llamaindex.ai/) - React component library for LLM chat interfaces
- [Vercel AI SDK Elements](https://vercel.com/academy/ai-sdk/ai-elements) - 20+ production-ready AI interface components
- [Vercel Streamdown](https://vercel.com/changelog/introducing-streamdown) - AI-optimized streaming markdown renderer
- [shadcn/ui AI Components](https://www.shadcn.io/ai) - 25+ React components for conversational AI
- [Vercel AI SDK Markdown Chatbot with Memoization](https://ai-sdk.dev/cookbook/next/markdown-chatbot-with-memoization) - Performance patterns for streaming markdown
- [Vercel AI SDK Message Component](https://ai-sdk.dev/elements/components/message) - Message parts architecture
- [HuggingFace Chat UI](https://github.com/huggingface/chat-ui) - Open-source chat UI with MCP tool support
- [Open Source Chat UIs for LLMs 2026](https://poornaprakashsr.medium.com/5-best-open-source-chat-uis-for-llms-in-2025-11282403b18f) - LobeChat, Open WebUI, AnythingLLM
- [Generative UI Frameworks 2026](https://medium.com/@akshaychame2/the-complete-guide-to-generative-ui-frameworks-in-2026-fde71c4fa8cc) - CopilotKit, ChatKit, Thesys C1
- [LLM Chat UI Concepts](https://www.danielcorin.com/posts/2025/llm-chat-ui-concepts/) - Thought eddies and conversation patterns
- [What Building an LLM Chat UI Taught Me](https://www.techsistence.com/p/what-did-building-an-llm-chat-ui) - Practical lessons on token management
- [Best Chatbot UIs 2026](https://www.jotform.com/ai/agents/best-chatbot-ui/) - Design best practices and accessibility
- [Conversational AI UI Comparison 2025](https://intuitionlabs.ai/articles/conversational-ai-ui-comparison-2025) - ChatGPT, Claude, Gemini compared
- [Agentic UI: Post-Chatbot Paradigm](https://medium.com/@ulmeanuadrian/interfaces-that-think-what-agentic-ui-is-and-why-chatbots-are-already-obsolete-dfe8ebbc7a12) - UI generation vs text generation
- [Agentic LLMs in 2025](https://datasciencedojo.com/blog/agentic-llm-in-2025/) - Tool calling, memory, reasoning
- [2025 LLM Year in Review (Karpathy)](https://karpathy.bearblog.dev/year-in-review-2025/) - Reasoning tokens and test-time compute
- [ChatGPT Branch Conversations](https://scalevise.com/resources/chatgpt-branch-conversations/) - Conversation forking UX
- [LibreChat Forking](https://www.librechat.ai/docs/features/fork) - Granular message forking options
- [GitChat](https://github.com/DrustZ/GitChat) - Git-inspired conversation branching
- [Branching UX Analysis](https://medium.com/@nikivergis/ai-chat-tools-dont-match-how-we-actually-think-exploring-the-ux-of-branching-conversations-259107496afb) - UX research on branching patterns
- [Chat SDK Artifacts](https://chat-sdk.dev/docs/customization/artifacts) - Open-source artifact system
- [Claude Artifacts](https://support.claude.com/en/articles/11649427-use-artifacts-to-visualize-and-create-ai-apps-without-ever-writing-a-line-of-code) - Artifact patterns
- [Canvas vs Artifacts Comparison](https://www.aifire.co/p/detailed-comparison-for-interactive-tools-canvas-or-artifacts) - Design patterns
- [Generative UI with React Server Components](https://vercel.com/templates/next.js/rsc-genui) - Generative UI patterns
- [Multi-Step & Generative UI](https://vercel.com/academy/ai-sdk/multi-step-and-generative-ui) - Tool chaining patterns
- [AI UI Patterns](https://www.patterns.dev/react/ai-ui-patterns/) - Emerging design patterns for AI interfaces
- [IBM MCP Context Forge LLM Chat](https://ibm.github.io/mcp-context-forge/using/clients/llm-chat/) - Thinking steps and tool badges
- [TypingMind](https://www.typingmind.com/) - Feature-rich LLM chat frontend
- [Playliner Branching](https://docs.playliner.com/introduction/branching/) - Chat SDK branching implementation
