/**
 * CodeBlock - Syntax-highlighted code display with copy button.
 *
 * Uses Shiki for VS Code-quality highlighting with lazy-loaded
 * language grammars and adaptive throttling for streaming.
 *
 * @module @tempots/beatui/chat
 */

import type { Value, Renderable } from '@tempots/dom'

export interface CodeBlockOptions {
  /**
   * The code content to display.
   */
  code: Value<string>

  /**
   * Programming language for syntax highlighting.
   * If not provided, displayed as plain text.
   */
  language?: Value<string | undefined>

  /**
   * Whether code is still being streamed.
   * Affects highlighting throttling.
   * @default false
   */
  isStreaming?: Value<boolean>

  /**
   * Whether to show line numbers.
   * @default false
   */
  showLineNumbers?: Value<boolean>

  /**
   * Whether to enable word wrap.
   * @default false
   */
  wordWrap?: Value<boolean>

  /**
   * Lines to highlight (1-indexed).
   * @example [1, 3, 5] or [[1, 3], [5, 8]] for ranges
   */
  highlightLines?: Value<(number | [number, number])[]>

  /**
   * Whether to show the copy button.
   * @default true
   */
  showCopyButton?: Value<boolean>

  /**
   * Whether to show the language label badge.
   * @default true
   */
  showLanguageLabel?: Value<boolean>

  /**
   * Maximum number of lines to show before collapsing.
   * Set to 0 for no limit.
   * @default 0
   */
  maxCollapsedLines?: Value<number>

  /**
   * Shiki theme name.
   * @default auto (follows BeatUI theme)
   */
  theme?: Value<string>

  /**
   * Additional CSS class for the root element.
   */
  class?: Value<string>
}

/**
 * Renders syntax-highlighted code with a copy button and language label.
 *
 * @example
 * ```typescript
 * CodeBlock({
 *   code: 'const greeting = "Hello, World!"',
 *   language: 'typescript',
 *   showLineNumbers: true,
 *   showCopyButton: true,
 * })
 * ```
 *
 * @param options - Configuration options
 * @returns Renderable
 */
export declare function CodeBlock(options: CodeBlockOptions): Renderable

// CSS: .bc-chat-code-block, .bc-chat-code-block__header,
//      .bc-chat-code-block__language, .bc-chat-code-block__copy-btn,
//      .bc-chat-code-block__content, .bc-chat-code-block__line-numbers,
//      .bc-chat-code-block__expand-btn, .bc-chat-code-block--collapsed
