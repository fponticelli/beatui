/**
 * ThinkingBlock - Collapsible display for model reasoning/thinking tokens.
 *
 * Renders chain-of-thought or extended thinking content in a visually
 * distinct, collapsible section.
 *
 * @module @tempots/beatui/chat
 */

import type { Value, Renderable } from '@tempots/dom'

export interface ThinkingBlockOptions {
  /**
   * The thinking/reasoning text content.
   */
  content: Value<string>

  /**
   * Whether the thinking content is still being streamed.
   * @default false
   */
  isStreaming?: Value<boolean>

  /**
   * Whether the block is initially expanded.
   * @default false (collapsed by default)
   */
  defaultExpanded?: boolean

  /**
   * Label for the header.
   * @default 'Thinking'
   */
  label?: Value<string>

  /**
   * Duration the model spent thinking (milliseconds).
   * Displayed in the header when provided.
   */
  durationMs?: Value<number | undefined>

  /**
   * Whether to render the content as markdown.
   * @default false (plain text)
   */
  markdown?: Value<boolean>

  /**
   * Additional CSS class for the root element.
   */
  class?: Value<string>
}

/**
 * Renders a collapsible thinking/reasoning block.
 *
 * @example
 * ```typescript
 * ThinkingBlock({
 *   content: 'Let me analyze the user\'s request step by step...',
 *   isStreaming: false,
 *   durationMs: 3200,
 *   label: 'Thinking',
 * })
 * ```
 *
 * @param options - Configuration options
 * @returns Renderable
 */
export declare function ThinkingBlock(options: ThinkingBlockOptions): Renderable

// CSS: .bc-chat-thinking, .bc-chat-thinking--expanded, .bc-chat-thinking--streaming,
//      .bc-chat-thinking__header, .bc-chat-thinking__chevron,
//      .bc-chat-thinking__label, .bc-chat-thinking__duration,
//      .bc-chat-thinking__content
