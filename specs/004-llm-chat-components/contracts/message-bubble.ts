/**
 * MessageBubble - Individual message display container.
 *
 * Renders a single chat message with role-based styling, avatar,
 * timestamp, and a hover action bar.
 *
 * @module @tempots/beatui/chat
 */

import type { TNode, Value, Renderable } from '@tempots/dom'
import type { ChatMessage, ContentPart, MessageReaction, ReactionType } from '../types'

export interface MessageBubbleOptions {
  /**
   * The message to display.
   */
  message: Value<ChatMessage>

  /**
   * Avatar content for the message sender.
   * Can be an Avatar component, icon, or any TNode.
   * If not provided, no avatar is shown.
   */
  avatar?: TNode | ((role: string) => TNode)

  /**
   * Display name for the message sender.
   */
  senderName?: Value<string>

  /**
   * Whether to show the timestamp.
   * @default 'hover' (show on hover)
   */
  showTimestamp?: Value<'always' | 'hover' | 'never'>

  /**
   * Format for timestamp display.
   * @default 'relative' (e.g., "2 minutes ago")
   */
  timestampFormat?: Value<'relative' | 'absolute'>

  /**
   * Whether to show the hover action bar.
   * @default true
   */
  showActions?: Value<boolean>

  /**
   * Available actions in the hover action bar.
   * @default ['copy', 'edit', 'regenerate', 'react']
   */
  actions?: Value<MessageAction[]>

  /**
   * Current reaction state.
   */
  reaction?: Value<MessageReaction | null>

  /**
   * Maximum number of lines before collapsing with "Show more".
   * Set to 0 for no limit.
   * @default 0
   */
  maxCollapsedLines?: Value<number>

  /**
   * Custom renderer for specific content part types.
   * Falls back to built-in renderers for unhandled types.
   */
  renderPart?: (part: ContentPart) => TNode | null

  // --- Callbacks ---

  /** Called when the copy action is triggered */
  onCopy?: (message: ChatMessage) => void
  /** Called when the edit action is triggered (user messages only) */
  onEdit?: (message: ChatMessage, newContent: string) => void
  /** Called when the regenerate action is triggered (assistant messages only) */
  onRegenerate?: (message: ChatMessage) => void
  /** Called when a reaction is set or cleared */
  onReact?: (message: ChatMessage, reaction: ReactionType | null) => void

  /**
   * For messages with multiple generations (branching).
   * Current generation index and total count.
   */
  generationIndex?: Value<number>
  generationCount?: Value<number>
  /** Navigate between generations */
  onNavigateGeneration?: (direction: 'prev' | 'next') => void

  /**
   * Additional CSS class for the root element.
   */
  class?: Value<string>
}

export type MessageAction = 'copy' | 'edit' | 'regenerate' | 'react'

/**
 * Renders a single chat message with role-based styling and interactive actions.
 *
 * @example
 * ```typescript
 * MessageBubble({
 *   message: prop({
 *     id: 'msg_1',
 *     role: 'assistant',
 *     parts: [{ type: 'text', text: 'Hello! How can I help?', state: 'done' }],
 *     status: 'complete',
 *     createdAt: Date.now(),
 *   }),
 *   avatar: Avatar({ name: 'Assistant', size: 'sm' }),
 *   senderName: 'Claude',
 *   onCopy: (msg) => navigator.clipboard.writeText(getTextContent(msg)),
 *   onRegenerate: (msg) => regenerateMessage(msg.id),
 * })
 * ```
 *
 * @param options - Configuration options
 * @param children - Additional content to render after the message parts
 * @returns Renderable
 */
export declare function MessageBubble(
  options: MessageBubbleOptions,
  ...children: TNode[]
): Renderable

// CSS: .bc-chat-bubble, .bc-chat-bubble--user, .bc-chat-bubble--assistant,
//      .bc-chat-bubble--system, .bc-chat-bubble--error,
//      .bc-chat-bubble__avatar, .bc-chat-bubble__content,
//      .bc-chat-bubble__actions, .bc-chat-bubble__timestamp,
//      .bc-chat-bubble__generation-nav
