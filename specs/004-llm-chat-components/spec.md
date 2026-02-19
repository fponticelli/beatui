# Feature Specification: LLM Chat Components

**Feature Branch**: `004-llm-chat-components`
**Created**: 2026-02-19
**Status**: Draft
**Input**: Research document: `research/llm-chat-components.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Chat Conversation (Priority: P1)

A developer integrates BeatUI chat components to build a simple LLM chat interface. They render a message list with user and assistant messages, provide a text input for sending messages, and display streaming assistant responses with proper markdown rendering.

**Why this priority**: This is the foundational use case. Without basic chat rendering and input, no other chat features are useful. Every LLM chat app needs this.

**Independent Test**: Can be fully tested by rendering a ChatContainer with a static list of messages and a ChatInput, then verifying that messages display correctly with role-based styling, markdown renders properly, and the input sends messages. Delivers a complete minimal chat UI.

**Acceptance Scenarios**:

1. **Given** a ChatContainer with messages, **When** rendered, **Then** user messages appear right-aligned and assistant messages left-aligned with distinct styling
2. **Given** a ChatInput with a send handler, **When** the user types text and presses Enter, **Then** the onSend callback fires with the message content and the input clears
3. **Given** a ChatInput, **When** Shift+Enter is pressed, **Then** a newline is inserted instead of sending
4. **Given** a MessageBubble with markdown content, **When** rendered, **Then** markdown is parsed and displayed with proper formatting (bold, lists, links, etc.)
5. **Given** a MessageList with messages, **When** a new message is added, **Then** the list auto-scrolls to the bottom
6. **Given** a MessageList where the user has scrolled up, **When** a new message arrives, **Then** auto-scroll does NOT activate and a "scroll to bottom" button appears

---

### User Story 2 - Streaming Responses with Code Blocks (Priority: P1)

A developer displays assistant responses that stream in token-by-token, including code blocks with syntax highlighting and a copy button. The streaming text handles incomplete markdown gracefully.

**Why this priority**: Streaming is the defining UX of LLM chat. Code blocks with copy buttons are the most requested feature in developer-facing chat UIs.

**Independent Test**: Can be tested by providing a reactive Value<string> that grows over time (simulating streaming) and verifying that text renders progressively, code blocks highlight correctly once complete, and the copy button copies code to clipboard.

**Acceptance Scenarios**:

1. **Given** a StreamingText component with a growing content signal, **When** tokens arrive, **Then** text appears progressively without full re-render
2. **Given** streaming content with a partial code fence (`` ```js\nconst x = `` still streaming), **When** rendered, **Then** no rendering errors occur and partial content displays gracefully
3. **Given** a completed code block, **When** rendered, **Then** it displays with syntax highlighting, a language label, and a copy button
4. **Given** a code block copy button, **When** clicked, **Then** the code content is copied to clipboard and the button shows a "Copied" confirmation
5. **Given** a streaming message, **When** rendered, **Then** a cursor/caret indicator is visible at the streaming position

---

### User Story 3 - Thinking and Tool Call Display (Priority: P2)

A developer displays assistant reasoning (thinking/chain-of-thought tokens) in a collapsible block, and visualizes tool calls with their inputs, execution status, and results.

**Why this priority**: Agentic LLM use cases are the fastest-growing segment. Users need to see what the model is thinking and what tools it's calling to build trust and debug issues.

**Independent Test**: Can be tested by rendering a ThinkingBlock with static thinking content and ToolCallDisplay components with various states (pending, running, success, error), verifying collapse/expand behavior and status transitions.

**Acceptance Scenarios**:

1. **Given** a ThinkingBlock with content, **When** rendered, **Then** it appears collapsed by default with a "Thinking" header and expand chevron
2. **Given** a ThinkingBlock, **When** the header is clicked, **Then** it expands to show the reasoning content with animated transition
3. **Given** a ToolCallDisplay with status "running", **When** rendered, **Then** it shows the tool name, a spinner indicator, and the input parameters (collapsed by default)
4. **Given** a ToolCallDisplay with status "success", **When** rendered, **Then** it shows the tool name, a success checkmark, duration, and expandable result
5. **Given** a ToolCallDisplay with status "error", **When** rendered, **Then** it shows the tool name, error icon, error message, and an optional retry button
6. **Given** a ToolCallChain with multiple tool calls, **When** rendered, **Then** they appear as a vertical timeline/stepper with status indicators

---

### User Story 4 - Conversation Management (Priority: P2)

A developer builds a sidebar with conversation history, allowing users to create new conversations, switch between them, search, and perform basic management (rename, delete).

**Why this priority**: Multi-conversation support is essential for any non-trivial chat application. Users need to organize and revisit past conversations.

**Independent Test**: Can be tested by rendering a ConversationList with mock conversation data, verifying search filtering, active conversation highlighting, and context menu actions (rename, delete).

**Acceptance Scenarios**:

1. **Given** a ConversationList with conversations, **When** rendered, **Then** each shows title, last message preview, and relative timestamp
2. **Given** a ConversationList, **When** the user types in the search box, **Then** conversations are filtered by title match
3. **Given** a ConversationList, **When** the "New conversation" button is clicked, **Then** the onCreate callback fires
4. **Given** a conversation item, **When** right-clicked or menu button clicked, **Then** a context menu appears with Rename, Delete, and Export options
5. **Given** the active conversation, **When** rendered, **Then** it is visually highlighted in the list

---

### User Story 5 - Message Actions and Regeneration (Priority: P2)

A developer enables hover action bars on messages (copy, edit, regenerate, like/dislike) and implements message editing with branch-on-edit and response regeneration with navigation between multiple generations.

**Why this priority**: These are table-stakes interactions that users expect from modern chat UIs (ChatGPT, Claude, Gemini all have them).

**Independent Test**: Can be tested by rendering MessageBubble components with action handlers, verifying that hover reveals the action bar, copy works, edit enters inline edit mode, and regenerate triggers callback.

**Acceptance Scenarios**:

1. **Given** a MessageBubble, **When** the user hovers over it, **Then** an action bar appears with contextual buttons (copy for all, edit for user messages, regenerate for assistant messages)
2. **Given** a user message in edit mode, **When** the user modifies text and clicks Save, **Then** the onEdit callback fires with the new content
3. **Given** an assistant message with multiple generations, **When** rendered, **Then** navigation arrows and a counter (e.g., "2/3") appear
4. **Given** a message with a thumbs-down reaction, **When** the thumbs-down is clicked, **Then** an optional feedback form appears

---

### User Story 6 - Artifact/Canvas Panel (Priority: P3)

A developer renders code, documents, and visualizations in a resizable side panel (artifact panel) adjacent to the chat, with inline preview cards in messages that link to the full artifact.

**Why this priority**: The artifact/canvas pattern (Claude Artifacts, ChatGPT Canvas) is becoming standard for productive LLM interactions, but is more complex and only needed for advanced use cases.

**Independent Test**: Can be tested by rendering an ArtifactPanel with mock artifacts (code file, markdown document), verifying panel open/close/resize, tab switching between artifacts, and version navigation.

**Acceptance Scenarios**:

1. **Given** an ArtifactPreview card in a message, **When** clicked, **Then** the ArtifactPanel slides in from the right showing the full artifact
2. **Given** an ArtifactPanel with multiple artifacts, **When** rendered, **Then** a tab bar allows switching between them
3. **Given** a CodeArtifact, **When** rendered, **Then** it shows syntax-highlighted code with Monaco editor integration for editing
4. **Given** an ArtifactPanel, **When** the resize handle is dragged, **Then** the panel resizes and the chat area adjusts accordingly
5. **Given** an ArtifactPanel on mobile, **When** opened, **Then** it renders as a full-screen overlay instead of a side panel

---

### User Story 7 - Welcome Screen and Prompt Templates (Priority: P3)

A developer configures a welcome screen for new conversations with greeting text, model capabilities, and suggested prompts. Users can also access prompt templates with variable placeholders.

**Why this priority**: Nice-to-have polish that improves first-use experience but is not required for core functionality.

**Independent Test**: Can be tested by rendering a WelcomeScreen with configuration and verifying greeting display, suggested prompt rendering, and prompt selection triggering the onSelect callback.

**Acceptance Scenarios**:

1. **Given** a WelcomeScreen with suggestions, **When** a suggestion chip is clicked, **Then** the text populates the ChatInput
2. **Given** a WelcomeScreen, **When** the user starts typing in ChatInput, **Then** the WelcomeScreen fades out
3. **Given** a PromptTemplate with variables, **When** selected, **Then** a form appears to fill in the variable values

---

### Edge Cases

- What happens when a streaming response errors mid-stream? (Partial content shown with error indicator)
- How does the system handle extremely long messages (>10k tokens)? (Collapse with "Show more")
- What happens when markdown has deeply nested structures? (Depth limit, graceful fallback)
- How does code block highlighting handle unknown languages? (Fallback to plain text)
- What happens when the clipboard API is unavailable? (Graceful degradation, show error tooltip)
- How does MessageList handle 1000+ messages? (Virtual scrolling or pagination)
- What happens when streaming and the user scrolls up simultaneously? (Pause auto-scroll, show button)
- How does the system handle RTL languages in messages? (Inherit from i18n system)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render messages with distinct visual styling per role (user, assistant, system, error)
- **FR-002**: System MUST support streaming text display with progressive token rendering
- **FR-003**: System MUST render markdown content with GFM support (tables, task lists, strikethrough)
- **FR-004**: System MUST render code blocks with syntax highlighting and a copy-to-clipboard button
- **FR-005**: System MUST provide an auto-resizing text input with Send (Enter) and newline (Shift+Enter) keyboard shortcuts
- **FR-006**: System MUST auto-scroll to the latest message unless the user has scrolled up
- **FR-007**: System MUST display a "scroll to bottom" button when not at the bottom of the message list
- **FR-008**: System MUST support collapsible thinking/reasoning blocks
- **FR-009**: System MUST visualize tool calls with name, parameters, status, and results
- **FR-010**: System MUST support message actions on hover: copy, edit (user), regenerate (assistant), reactions
- **FR-011**: System MUST support a conversation list sidebar with search, create, rename, and delete
- **FR-012**: System MUST support inline message editing with save/cancel
- **FR-013**: System MUST support response regeneration with navigation between multiple generations
- **FR-014**: System MUST render a typing/loading indicator while awaiting the assistant response
- **FR-015**: System MUST support a stop/cancel button during active generation
- **FR-016**: System MUST support file/image attachments in the chat input
- **FR-017**: System MUST support an artifact side panel with code, document, and visualization rendering
- **FR-018**: System MUST support light and dark themes via the existing BeatUI theme system
- **FR-019**: System MUST be accessible (ARIA roles, keyboard navigation, screen reader support)
- **FR-020**: System MUST support RTL layout via the existing BeatUI i18n system

### Key Entities

- **ChatMessage**: Represents a single message in a conversation (id, parentId, role, parts, model, timestamp, status, metadata)
- **MessagePart**: A segment of content within a message (text, image, tool-call, thinking, citation, artifact, file, error)
- **Conversation**: A collection of messages forming a tree (id, title, createdAt, updatedAt, messages)
- **ToolCall**: A tool invocation by the model (name, args, status, result, duration)
- **Artifact**: A standalone content object (id, type, title, versions, content)
- **MessageReaction**: User feedback on a message (type: thumbsUp/thumbsDown, comment)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: First message renders in < 16ms
- **SC-002**: Streaming token renders in < 8ms per token (no visible jank)
- **SC-003**: Scroll performance maintains 60fps during active streaming
- **SC-004**: Message list supports 1000+ messages without degradation (virtual scrolling)
- **SC-005**: All interactive elements are keyboard-navigable and have appropriate ARIA attributes
- **SC-006**: Code block syntax highlighting lazy-loads per language (no impact on initial bundle)
- **SC-007**: Chat entry point (`@tempots/beatui/chat`) adds < 50KB gzipped to bundle when fully used
- **SC-008**: All components support both light and dark themes without additional configuration
- **SC-009**: 100% of Tier 1 and Tier 2 components have unit tests with > 80% coverage
- **SC-010**: All components work correctly in Chrome, Firefox, and Safari latest versions
