# Data Model: LLM Chat Components

**Feature**: 004-llm-chat-components
**Date**: 2026-02-19

---

## Core Types

### Message Roles

```typescript
/**
 * The role of a message sender.
 * - `system`: System/developer instructions
 * - `user`: Human user input
 * - `assistant`: LLM-generated output
 * - `tool`: Tool execution result
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool'
```

### Content Parts (Discriminated Union)

```typescript
/**
 * Streaming lifecycle state for text and thinking parts.
 */
export type StreamingState = 'streaming' | 'done'

/**
 * Lifecycle state for tool call parts (Vercel AI SDK pattern).
 */
export type ToolCallState =
  | 'input-streaming'
  | 'input-available'
  | 'output-available'
  | 'output-error'

// --- Individual Part Types ---

export interface TextPart {
  type: 'text'
  text: string
  state?: StreamingState
}

export interface ImagePart {
  type: 'image'
  /** URL or data URI */
  url?: string
  /** Raw base64 data (without data URI prefix) */
  data?: string
  mimeType?: string
  alt?: string
}

export interface AudioPart {
  type: 'audio'
  url?: string
  data?: string
  mimeType?: string
  transcript?: string
}

export interface VideoPart {
  type: 'video'
  url?: string
  data?: string
  mimeType?: string
}

export interface FilePart {
  type: 'file'
  url?: string
  data?: string
  mimeType?: string
  filename?: string
  /** File size in bytes */
  size?: number
}

export interface ToolCallPart {
  type: 'tool-call'
  /** Unique ID for correlating with tool results */
  toolCallId: string
  toolName: string
  /** Parsed input arguments */
  input: Record<string, unknown>
  state?: ToolCallState
}

export interface ToolResultPart {
  type: 'tool-result'
  toolCallId: string
  toolName?: string
  /** Result content (string or nested parts for multimodal results) */
  output: string | ContentPart[]
  isError?: boolean
  /** Execution duration in milliseconds */
  durationMs?: number
}

export interface ThinkingPart {
  type: 'thinking'
  text: string
  state?: StreamingState
  /** Duration the model spent thinking (milliseconds) */
  durationMs?: number
}

export interface SourceUrlPart {
  type: 'source-url'
  sourceId: string
  url: string
  title?: string
  /** Optional snippet/excerpt from the source */
  snippet?: string
}

export interface SourceDocumentPart {
  type: 'source-document'
  sourceId: string
  mimeType?: string
  title?: string
  filename?: string
}

export interface CodePart {
  type: 'code'
  code: string
  language?: string
}

export interface CodeResultPart {
  type: 'code-result'
  outcome?: 'success' | 'error'
  output: string
}

export interface RefusalPart {
  type: 'refusal'
  text: string
}

export interface StepStartPart {
  type: 'step-start'
  label?: string
}

export interface DataPart {
  type: 'data'
  dataType: string
  data: unknown
  id?: string
}

export interface ResourcePart {
  type: 'resource'
  uri: string
  mimeType?: string
  text?: string
  data?: string
}

// --- Union Type ---

export type ContentPart =
  | TextPart
  | ImagePart
  | AudioPart
  | VideoPart
  | FilePart
  | ToolCallPart
  | ToolResultPart
  | ThinkingPart
  | SourceUrlPart
  | SourceDocumentPart
  | CodePart
  | CodeResultPart
  | RefusalPart
  | StepStartPart
  | DataPart
  | ResourcePart
```

### Chat Message

```typescript
/**
 * Message delivery status.
 */
export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error'

/**
 * A single message in a chat conversation.
 *
 * @example
 * ```typescript
 * const message: ChatMessage = {
 *   id: 'msg_001',
 *   role: 'assistant',
 *   parts: [
 *     { type: 'thinking', text: 'Let me analyze...', state: 'done', durationMs: 3200 },
 *     { type: 'text', text: 'Here is my analysis...', state: 'done' },
 *     { type: 'tool-call', toolCallId: 'tc_1', toolName: 'search', input: { query: 'BeatUI' }, state: 'output-available' },
 *   ],
 *   status: 'complete',
 *   createdAt: 1708300800000,
 * }
 * ```
 */
export interface ChatMessage<TMetadata = Record<string, unknown>> {
  /** Unique message identifier */
  id: string
  /** Parent message ID for branching support. null = root message */
  parentId?: string | null
  /** The role of the message sender */
  role: MessageRole
  /** Array of content parts */
  parts: ContentPart[]
  /** Overall message status */
  status: MessageStatus
  /** Which model generated this (for assistant messages) */
  model?: string
  /** Unix timestamp (milliseconds) */
  createdAt: number
  /** Provider-specific or application-specific metadata */
  metadata?: TMetadata
}
```

### Conversation

```typescript
/**
 * A conversation is an ordered collection of messages, potentially with branches.
 */
export interface Conversation {
  /** Unique conversation identifier */
  id: string
  /** User-visible title (auto-generated or manually set) */
  title: string
  /** Unix timestamp (milliseconds) */
  createdAt: number
  /** Unix timestamp (milliseconds) */
  updatedAt: number
  /** Messages in chronological order (flattened from tree) */
  messages: ChatMessage[]
}

/**
 * Summary info for displaying in a conversation list.
 */
export interface ConversationSummary {
  id: string
  title: string
  /** Preview of the last message content */
  lastMessagePreview?: string
  updatedAt: number
  /** Number of messages in the conversation */
  messageCount?: number
}
```

### Tool Definition

```typescript
/**
 * Definition of a tool available to the model.
 * Used for display in MCPToolBadge and ApprovalPrompt components.
 */
export interface ToolDefinition {
  name: string
  description?: string
  /** JSON Schema for the tool's input parameters */
  inputSchema?: Record<string, unknown>
  /** Behavioral hints (MCP ToolAnnotations) */
  annotations?: {
    title?: string
    readOnlyHint?: boolean
    destructiveHint?: boolean
    idempotentHint?: boolean
  }
}
```

### Message Reactions

```typescript
export type ReactionType = 'thumbs-up' | 'thumbs-down'

export interface MessageReaction {
  type: ReactionType
  /** Optional feedback comment (typically on thumbs-down) */
  comment?: string
}
```

---

## Entity Relationships

```
Conversation 1──* ChatMessage
ChatMessage 1──* ContentPart
ChatMessage ?──1 ChatMessage (parentId → id, for branching)
ChatMessage ?──1 MessageReaction
ToolCallPart 1──1 ToolResultPart (via toolCallId)
```

---

## State Transitions

### ChatMessage.status

```
pending ──→ streaming ──→ complete
                │
                └──→ error
```

- `pending`: Message created but not yet being generated (user message waiting to send, or assistant response not yet started)
- `streaming`: Tokens are actively arriving (assistant messages only)
- `complete`: Message fully received
- `error`: Generation failed (may have partial content in parts)

### ToolCallPart.state

```
input-streaming ──→ input-available ──→ output-available
                                   │
                                   └──→ output-error
```

- `input-streaming`: Tool call arguments are being streamed
- `input-available`: Arguments fully received, tool execution pending or in progress
- `output-available`: Tool returned a result successfully
- `output-error`: Tool execution failed

### TextPart.state / ThinkingPart.state

```
streaming ──→ done
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `ChatMessage.id` | Non-empty string, unique within conversation |
| `ChatMessage.role` | One of: `system`, `user`, `assistant`, `tool` |
| `ChatMessage.parts` | Non-empty array (at least one part) |
| `ChatMessage.createdAt` | Positive integer (Unix ms) |
| `ToolCallPart.toolCallId` | Non-empty string, unique within message |
| `ToolResultPart.toolCallId` | Must match an existing ToolCallPart.toolCallId |
| `SourceUrlPart.url` | Valid URL string |
| `ImagePart` | At least one of `url` or `data` must be set |
| `FilePart` | At least one of `url` or `data` must be set |

---

## Design Decisions

1. **`parts[]` over `content: string`**: The multi-part model is the industry standard (Vercel AI SDK 5, Anthropic, Gemini, LlamaIndex). It naturally represents interleaved content types in a single message.

2. **`parentId` for branching**: Simple pointer-based tree structure. The UI component (`MessageBranching`) resolves the tree from flat message arrays. This avoids forcing a tree data structure on consumers.

3. **Timestamps as Unix ms (number)**: Simpler than ISO strings for sorting and comparison. Consumers can format as needed using Intl.DateTimeFormat.

4. **Generic `metadata`**: Rather than typing provider-specific fields (usage, logprobs, finish_reason), metadata is a generic parameter. Consumers can type it as needed: `ChatMessage<{ usage: { inputTokens: number, outputTokens: number } }>`.

5. **`durationMs` on ToolResultPart and ThinkingPart**: Essential for agentic UIs where users need to see how long tools and thinking took. Not part of the standard provider models but universally needed in UIs.
