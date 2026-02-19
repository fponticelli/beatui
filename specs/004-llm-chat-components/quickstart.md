# Quickstart: LLM Chat Components

**Feature**: 004-llm-chat-components
**Date**: 2026-02-19

---

## Installation

```bash
pnpm add @tempots/beatui
```

The chat components are available as an optional entry point:

```typescript
import { ChatContainer, MessageList, MessageBubble, ChatInput, StreamingText } from '@tempots/beatui/chat'
```

### Peer Dependencies

The chat entry point requires the existing BeatUI peer dependencies:

```bash
pnpm add @tempots/dom @tempots/ui @tempots/std
```

### Optional Dependencies (lazy-loaded)

These are loaded on-demand when specific features are used:

| Feature | Package | When Loaded |
|---------|---------|-------------|
| Syntax highlighting | `shiki` | First code block rendered |
| Math rendering | `katex` | First math expression rendered |
| Diagrams | `mermaid` | First mermaid code block rendered |

No need to install these manually — they are dynamic imports.

---

## Basic Usage

### Minimal Chat Interface

```typescript
import { render, prop } from '@tempots/dom'
import {
  ChatContainer,
  MessageList,
  MessageBubble,
  ChatInput,
  type ChatMessage,
} from '@tempots/beatui/chat'

// Reactive state
const messages = prop<ChatMessage[]>([])
const isStreaming = prop(false)

// Mount the chat UI
render(
  document.getElementById('app')!,
  ChatContainer(
    { maxWidth: '768px' },
    MessageList({
      messages,
      isStreaming,
    }),
    ChatInput({
      placeholder: 'Type a message...',
      isGenerating: isStreaming,
      onSend: (text) => handleSend(text),
      onStop: () => handleStop(),
    }),
  ),
)

// Example send handler
async function handleSend(text: string) {
  // Add user message
  messages.set((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: 'user',
      parts: [{ type: 'text', text, state: 'done' }],
      status: 'complete',
      createdAt: Date.now(),
    },
  ])

  // Add placeholder assistant message
  const assistantId = crypto.randomUUID()
  messages.set((prev) => [
    ...prev,
    {
      id: assistantId,
      role: 'assistant',
      parts: [{ type: 'text', text: '', state: 'streaming' }],
      status: 'streaming',
      createdAt: Date.now(),
    },
  ])

  isStreaming.set(true)

  // Stream response from your LLM API
  const stream = await callLLMAPI(text)
  let accumulated = ''

  for await (const chunk of stream) {
    accumulated += chunk
    messages.set((prev) =>
      prev.map((m) =>
        m.id === assistantId
          ? { ...m, parts: [{ type: 'text', text: accumulated, state: 'streaming' }] }
          : m,
      ),
    )
  }

  // Finalize
  messages.set((prev) =>
    prev.map((m) =>
      m.id === assistantId
        ? {
            ...m,
            parts: [{ type: 'text', text: accumulated, state: 'done' }],
            status: 'complete',
          }
        : m,
    ),
  )
  isStreaming.set(false)
}
```

---

### With Thinking and Tool Calls

```typescript
import {
  ChatContainer,
  MessageList,
  ChatInput,
  type ChatMessage,
  type ContentPart,
} from '@tempots/beatui/chat'

// A message with thinking + text + tool call
const assistantMessage: ChatMessage = {
  id: 'msg_2',
  role: 'assistant',
  parts: [
    {
      type: 'thinking',
      text: 'The user is asking about weather. I should use the weather tool.',
      state: 'done',
      durationMs: 1500,
    },
    {
      type: 'text',
      text: 'Let me check the weather for you.',
      state: 'done',
    },
    {
      type: 'tool-call',
      toolCallId: 'tc_1',
      toolName: 'get_weather',
      input: { location: 'San Francisco', units: 'fahrenheit' },
      state: 'output-available',
    },
    {
      type: 'tool-result',
      toolCallId: 'tc_1',
      toolName: 'get_weather',
      output: '72°F, Sunny',
      durationMs: 800,
    },
    {
      type: 'text',
      text: 'The weather in San Francisco is **72°F and Sunny**! Perfect day to be outside.',
      state: 'done',
    },
  ],
  status: 'complete',
  model: 'claude-sonnet-4-5-20250929',
  createdAt: Date.now(),
}
```

The `MessageBubble` component automatically renders each part type with the appropriate sub-component:

- `TextPart` → `StreamingText` (markdown rendering)
- `ThinkingPart` → `ThinkingBlock` (collapsible)
- `ToolCallPart` + `ToolResultPart` → `ToolCallDisplay`
- `ImagePart` → Image display with lightbox
- `CodePart` → `CodeBlock`

---

### With Conversation Sidebar

```typescript
import {
  ChatContainer,
  MessageList,
  ChatInput,
  ConversationList,
  type ConversationSummary,
} from '@tempots/beatui/chat'

const conversations = prop<ConversationSummary[]>([
  { id: '1', title: 'Weather discussion', updatedAt: Date.now() - 3600000 },
  { id: '2', title: 'Code review help', updatedAt: Date.now() },
])
const activeConversationId = prop('2')

ChatContainer(
  {
    sidebar: ConversationList({
      conversations,
      activeId: activeConversationId,
      onSelect: (id) => loadConversation(id),
      onCreate: () => createNewConversation(),
      onDelete: (id) => deleteConversation(id),
      onRename: (id, title) => renameConversation(id, title),
    }),
  },
  MessageList({ messages, isStreaming }),
  ChatInput({ onSend: handleSend, isGenerating: isStreaming }),
)
```

---

### Custom Message Rendering

Override the default rendering for specific content part types:

```typescript
MessageBubble({
  message: myMessage,
  renderPart: (part) => {
    if (part.type === 'tool-call' && part.toolName === 'chart') {
      // Custom chart visualization for chart tool calls
      return MyChartComponent({ data: part.input })
    }
    // Return null to use the default renderer
    return null
  },
})
```

---

### Theming

Chat components automatically integrate with BeatUI's theme system:

```typescript
import { BeatUI } from '@tempots/beatui'
import { ChatContainer, MessageList, ChatInput } from '@tempots/beatui/chat'

// Wrap in BeatUI root provider for theme support
render(
  document.getElementById('app')!,
  BeatUI(
    { appearance: 'dark' },
    ChatContainer(
      {},
      MessageList({ messages }),
      ChatInput({ onSend: handleSend }),
    ),
  ),
)
```

Chat-specific design tokens can be customized via CSS custom properties:

```css
:root {
  --chat-bubble-user-bg: var(--color-primary-100);
  --chat-bubble-assistant-bg: var(--color-surface-secondary);
  --chat-bubble-max-width: 80%;
  --chat-input-bg: var(--color-surface-primary);
  --chat-thinking-bg: var(--color-surface-tertiary);
  --chat-code-block-bg: var(--color-surface-inset);
}
```

---

## Component Reference

| Component | Import | Description |
|-----------|--------|-------------|
| `ChatContainer` | `@tempots/beatui/chat` | Top-level layout with optional sidebar |
| `MessageList` | `@tempots/beatui/chat` | Virtualized message list with auto-scroll |
| `MessageBubble` | `@tempots/beatui/chat` | Individual message with actions |
| `ChatInput` | `@tempots/beatui/chat` | Auto-resizing input with send/stop |
| `StreamingText` | `@tempots/beatui/chat` | Streaming markdown renderer |
| `CodeBlock` | `@tempots/beatui/chat` | Syntax-highlighted code + copy |
| `ThinkingBlock` | `@tempots/beatui/chat` | Collapsible reasoning display |
| `ToolCallDisplay` | `@tempots/beatui/chat` | Tool call visualization |
| `ToolCallChain` | `@tempots/beatui/chat` | Multi-step tool timeline |
| `ConversationList` | `@tempots/beatui/chat` | Sidebar conversation list |
| `WelcomeScreen` | `@tempots/beatui/chat` | New conversation empty state |
| `CopyButton` | `@tempots/beatui/chat` | Universal copy-to-clipboard |
| `TypingIndicator` | `@tempots/beatui/chat` | Loading/thinking animation |
| `SystemMessage` | `@tempots/beatui/chat` | Inline system messages |

See [contracts/](./contracts/) for full TypeScript API definitions.
