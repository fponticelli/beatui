/**
 * ChatInput - Composable chat input area with auto-resizing textarea.
 *
 * Provides send/stop buttons, keyboard shortcuts, file attachment support,
 * and slots for additional controls (model selector, parameters).
 *
 * @module @tempots/beatui/chat
 */

import type { TNode, Value, Renderable } from '@tempots/dom'

export interface ChatInputAttachment {
  id: string
  file: File
  /** Preview URL (for images) */
  previewUrl?: string
}

export interface ChatInputOptions {
  /**
   * Placeholder text for the textarea.
   * @default 'Type a message...'
   */
  placeholder?: Value<string>

  /**
   * Whether the input is disabled.
   * @default false
   */
  disabled?: Value<boolean>

  /**
   * Whether the assistant is currently generating (shows stop button instead of send).
   * @default false
   */
  isGenerating?: Value<boolean>

  /**
   * Maximum height of the textarea in pixels before scrolling.
   * @default 200
   */
  maxHeight?: Value<number>

  /**
   * Maximum number of rows before the textarea stops growing.
   * @default 10
   */
  maxRows?: Value<number>

  /**
   * Whether file attachments are enabled.
   * @default false
   */
  allowAttachments?: Value<boolean>

  /**
   * Accepted file types for attachments (MIME types or extensions).
   * @default '*'
   */
  acceptFileTypes?: Value<string>

  /**
   * Current file attachments.
   */
  attachments?: Value<ChatInputAttachment[]>

  /**
   * Content to render before the textarea (e.g., attachment button).
   */
  before?: TNode

  /**
   * Content to render after the textarea (e.g., model selector).
   */
  after?: TNode

  /**
   * Content to render above the textarea (e.g., attachment previews, parameter bar).
   */
  header?: TNode

  /**
   * Content to render below the textarea (e.g., token count, disclaimer).
   */
  footer?: TNode

  // --- Callbacks ---

  /**
   * Called when the user sends a message (Enter key or send button click).
   * Receives the message text and any attachments.
   */
  onSend: (text: string, attachments?: ChatInputAttachment[]) => void

  /**
   * Called when the stop button is clicked during generation.
   */
  onStop?: () => void

  /**
   * Called when files are attached (via button or paste).
   */
  onAttach?: (files: File[]) => void

  /**
   * Called when an attachment is removed.
   */
  onRemoveAttachment?: (id: string) => void

  /**
   * Additional CSS class for the root element.
   */
  class?: Value<string>
}

/**
 * Auto-resizing chat input with send/stop buttons and attachment support.
 *
 * Keyboard shortcuts:
 * - Enter: Send message
 * - Shift+Enter: New line
 * - Escape: Cancel (calls onStop if generating)
 * - Ctrl/Cmd+V: Paste images as attachments (when allowAttachments is true)
 *
 * @example
 * ```typescript
 * const isGenerating = prop(false)
 *
 * ChatInput({
 *   placeholder: 'Ask me anything...',
 *   isGenerating,
 *   allowAttachments: true,
 *   onSend: (text, attachments) => sendMessage(text, attachments),
 *   onStop: () => cancelGeneration(),
 * })
 * ```
 *
 * @param options - Configuration options
 * @returns Renderable
 */
export declare function ChatInput(options: ChatInputOptions): Renderable

// CSS: .bc-chat-input, .bc-chat-input__textarea, .bc-chat-input__send-btn,
//      .bc-chat-input__stop-btn, .bc-chat-input__attachment-btn,
//      .bc-chat-input__attachments, .bc-chat-input__header, .bc-chat-input__footer
