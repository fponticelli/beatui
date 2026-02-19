/**
 * ToolCallDisplay - Visualization of a single tool/function call.
 *
 * Shows tool name, input parameters, execution status, and results.
 *
 * @module @tempots/beatui/chat
 */

import type { TNode, Value, Renderable } from '@tempots/dom'
import type { ToolCallState, ContentPart } from '../types'

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error'

export interface ToolCallDisplayOptions {
  /**
   * Name of the tool being called.
   */
  toolName: Value<string>

  /**
   * Tool call lifecycle state.
   * @default 'pending'
   */
  state?: Value<ToolCallState>

  /**
   * Input arguments (displayed as formatted JSON or key-value).
   */
  input?: Value<Record<string, unknown>>

  /**
   * Whether the input parameters are initially expanded.
   * @default false
   */
  inputExpanded?: boolean

  /**
   * Tool execution result content.
   */
  output?: Value<string | ContentPart[] | undefined>

  /**
   * Whether the output is initially expanded.
   * @default true (expanded when available)
   */
  outputExpanded?: boolean

  /**
   * Whether the tool call resulted in an error.
   * @default false
   */
  isError?: Value<boolean>

  /**
   * Error message (when isError is true).
   */
  errorMessage?: Value<string | undefined>

  /**
   * Execution duration in milliseconds.
   */
  durationMs?: Value<number | undefined>

  /**
   * Optional icon for the tool.
   */
  icon?: TNode

  /**
   * Whether to show a retry button on error.
   * @default false
   */
  showRetry?: Value<boolean>

  /**
   * Called when the retry button is clicked.
   */
  onRetry?: () => void

  /**
   * Additional CSS class for the root element.
   */
  class?: Value<string>
}

/**
 * Renders a tool call with status, parameters, and result.
 *
 * @example
 * ```typescript
 * ToolCallDisplay({
 *   toolName: 'web_search',
 *   state: 'output-available',
 *   input: { query: 'BeatUI components' },
 *   output: 'Found 3 results...',
 *   durationMs: 1200,
 * })
 * ```
 *
 * @param options - Configuration options
 * @returns Renderable
 */
export declare function ToolCallDisplay(options: ToolCallDisplayOptions): Renderable

/**
 * ToolCallChain - Vertical timeline of multiple tool calls.
 *
 * @example
 * ```typescript
 * ToolCallChain({
 *   toolCalls: [
 *     { toolName: 'search', state: 'output-available', ... },
 *     { toolName: 'read_file', state: 'running', ... },
 *   ],
 * })
 * ```
 */
export interface ToolCallChainOptions {
  /**
   * Array of tool call configurations to display as a timeline.
   */
  toolCalls: Value<ToolCallDisplayOptions[]>

  /**
   * Whether the chain is initially collapsed (shows summary only).
   * @default false
   */
  collapsed?: Value<boolean>

  /**
   * Additional CSS class for the root element.
   */
  class?: Value<string>
}

export declare function ToolCallChain(options: ToolCallChainOptions): Renderable

// CSS: .bc-chat-tool-call, .bc-chat-tool-call--pending, .bc-chat-tool-call--running,
//      .bc-chat-tool-call--success, .bc-chat-tool-call--error,
//      .bc-chat-tool-call__header, .bc-chat-tool-call__icon,
//      .bc-chat-tool-call__name, .bc-chat-tool-call__status,
//      .bc-chat-tool-call__duration, .bc-chat-tool-call__input,
//      .bc-chat-tool-call__output, .bc-chat-tool-call__retry-btn,
//      .bc-chat-tool-chain, .bc-chat-tool-chain__step,
//      .bc-chat-tool-chain__connector
