/**
 * ChatContainer - Top-level chat layout orchestrator.
 *
 * Manages the split between message list and input area,
 * handles auto-scroll behavior, and accepts optional sidebar slot.
 *
 * @module @tempots/beatui/chat
 */

import type { TNode, Value, Renderable } from '@tempots/dom'

export interface ChatContainerOptions {
  /**
   * Optional sidebar content (e.g., ConversationList).
   * Rendered to the left of the chat area.
   */
  sidebar?: TNode

  /**
   * Whether the sidebar is visible.
   * @default true
   */
  sidebarVisible?: Value<boolean>

  /**
   * Maximum width of the message area (CSS value).
   * Messages are centered within the container.
   * @default '768px'
   */
  maxWidth?: Value<string>

  /**
   * Additional CSS class for the root element.
   */
  class?: Value<string>
}

/**
 * Top-level container that orchestrates the chat layout.
 *
 * @example
 * ```typescript
 * ChatContainer(
 *   {
 *     sidebar: ConversationList({ conversations, onSelect }),
 *     maxWidth: '800px',
 *   },
 *   MessageList({ messages }),
 *   ChatInput({ onSend }),
 * )
 * ```
 *
 * @param options - Configuration options
 * @param children - Content to render inside the chat area (typically MessageList + ChatInput)
 * @returns Renderable
 */
export declare function ChatContainer(
  options: ChatContainerOptions,
  ...children: TNode[]
): Renderable

// CSS: .bc-chat-container, .bc-chat-container__sidebar, .bc-chat-container__main
