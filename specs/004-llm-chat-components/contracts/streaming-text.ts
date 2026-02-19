/**
 * StreamingText - Progressive markdown rendering optimized for token-by-token streaming.
 *
 * Uses remend for markdown healing and block-level memoization
 * for performance. Handles incomplete markdown gracefully.
 *
 * @module @tempots/beatui/chat
 */

import type { Value, Renderable } from '@tempots/dom'

export interface StreamingTextFeatures {
  /** Enable GitHub Flavored Markdown (tables, task lists, strikethrough) */
  gfm?: boolean
  /** Enable KaTeX math rendering ($...$ and $$...$$). Lazy-loads KaTeX. */
  math?: boolean
  /** Enable Mermaid diagram rendering. Lazy-loads Mermaid. */
  mermaid?: boolean
  /** Enable Shiki syntax highlighting for code blocks. Lazy-loads per language. */
  codeHighlighting?: boolean
}

export interface StreamingTextOptions {
  /**
   * The text content to render. Updated reactively as tokens arrive.
   */
  content: Value<string>

  /**
   * Whether content is still being streamed.
   * When true, applies remend healing for incomplete markdown.
   * When false, does a final clean render pass.
   * @default false
   */
  isStreaming?: Value<boolean>

  /**
   * Which optional rendering features to enable.
   * @default { gfm: true, codeHighlighting: true }
   */
  features?: Value<StreamingTextFeatures>

  /**
   * Shiki theme for code highlighting.
   * @default 'github-dark' (dark mode) / 'github-light' (light mode)
   */
  codeTheme?: Value<string>

  /**
   * Languages to pre-load for syntax highlighting.
   * Other languages are loaded on-demand.
   * @default ['javascript', 'typescript', 'python', 'bash', 'json']
   */
  preloadLanguages?: string[]

  /**
   * Whether to show a blinking cursor at the end during streaming.
   * @default true
   */
  showCursor?: Value<boolean>

  /**
   * Custom code block renderer (overrides built-in CodeBlock).
   */
  renderCodeBlock?: (code: string, language: string | undefined) => Renderable

  /**
   * Additional CSS class for the root element.
   */
  class?: Value<string>
}

/**
 * Renders streaming markdown content with progressive updates.
 *
 * Architecture:
 * 1. Content signal updates as tokens arrive
 * 2. Remend preprocessor heals incomplete markdown (when isStreaming=true)
 * 3. Block splitter identifies stable vs. active blocks
 * 4. Per-block cache avoids re-parsing completed blocks
 * 5. micromark + extensions parse the active block
 * 6. Post-processors handle code (Shiki), math (KaTeX), diagrams (Mermaid)
 *
 * @example
 * ```typescript
 * const content = prop('')
 * const isStreaming = prop(true)
 *
 * // Simulate streaming
 * for (const token of tokens) {
 *   content.set(prev => prev + token)
 * }
 * isStreaming.set(false)
 *
 * StreamingText({
 *   content,
 *   isStreaming,
 *   features: { gfm: true, math: true, codeHighlighting: true },
 * })
 * ```
 *
 * @param options - Configuration options
 * @returns Renderable
 */
export declare function StreamingText(options: StreamingTextOptions): Renderable

// CSS: .bc-chat-streaming-text, .bc-chat-streaming-text__cursor
