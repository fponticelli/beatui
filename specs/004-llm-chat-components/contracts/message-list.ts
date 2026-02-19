/**
 * MessageList - Virtualized, scrollable list of chat messages.
 *
 * Uses @tanstack/virtual-core for efficient rendering of long conversations.
 * Supports auto-scroll, scroll anchoring, and a "scroll to bottom" button.
 *
 * @module @tempots/beatui/chat
 */

import type { TNode, Value, Signal, Renderable } from '@tempots/dom'
import type { ChatMessage, ContentPart } from '../types'

export interface MessageListOptions {
  /**
   * Reactive array of messages to display.
   */
  messages: Value<ChatMessage[]>

  /**
   * Whether the assistant is currently streaming a response.
   * Controls auto-scroll behavior.
   * @default false
   */
  isStreaming?: Value<boolean>

  /**
   * Custom renderer for individual messages.
   * If not provided, uses the default MessageBubble component.
   */
  renderMessage?: (message: Signal<ChatMessage>, index: Signal<number>) => TNode

  /**
   * Custom renderer for date separators between message groups.
   * Receives a Date object for the separator.
   */
  renderDateSeparator?: (date: Date) => TNode

  /**
   * Estimated height of a single message in pixels (for virtual scrolling).
   * @default 120
   */
  estimateMessageHeight?: number

  /**
   * Number of messages to render beyond the visible area (overscan).
   * @default 5
   */
  overscan?: number

  /**
   * Whether to show a "scroll to bottom" button when not at the bottom.
   * @default true
   */
  showScrollToBottom?: Value<boolean>

  /**
   * Callback when the user scrolls to the top (for loading older messages).
   */
  onLoadMore?: () => void

  /**
   * Additional CSS class for the root element.
   */
  class?: Value<string>
}

/**
 * Virtualized, scrollable message list with auto-scroll support.
 *
 * @example
 * ```typescript
 * const messages = prop<ChatMessage[]>([])
 * const isStreaming = prop(false)
 *
 * MessageList({
 *   messages,
 *   isStreaming,
 *   onLoadMore: () => loadOlderMessages(),
 * })
 * ```
 *
 * @param options - Configuration options
 * @returns Renderable
 */
export declare function MessageList(options: MessageListOptions): Renderable

// CSS: .bc-chat-message-list, .bc-chat-message-list__scroll-area,
//      .bc-chat-message-list__anchor, .bc-chat-scroll-to-bottom
