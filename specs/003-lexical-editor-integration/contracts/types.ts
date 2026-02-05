/**
 * Lexical Editor Integration - TypeScript Contracts
 *
 * These interfaces define the public API surface for @tempots/beatui/lexical.
 * Implementation must conform to these contracts.
 */

import type { Value, Signal, TNode, Renderable } from '@tempots/dom'
import type { InputOptions, CommonInputOptions } from '@tempots/beatui'
import type { LexicalEditor, EditorState, LexicalCommand, LexicalNode } from 'lexical'

// ─── Content Formats ──────────────────────────────────────────────

/** Supported serialization formats for editor content */
export type ContentFormatType = 'markdown' | 'json' | 'html'

/** Editor content in string form (Markdown or HTML) */
export type StringContent = string

/** Editor content in Lexical JSON state form */
export type JsonContent = Record<string, unknown>

/** Union of all content types */
export type EditorContent = StringContent | JsonContent

// ─── Plugin System ────────────────────────────────────────────────

/** A composable unit of editor functionality */
export interface LexicalPluginDefinition {
  /** Unique plugin identifier */
  readonly name: string
  /** Node classes this plugin requires */
  readonly nodes: ReadonlyArray<typeof LexicalNode>
  /** Register plugin with editor, returns cleanup function */
  register(editor: LexicalEditor, options?: Record<string, unknown>): () => void
}

/** Plugin configuration for enabling/disabling features */
export interface PluginConfig {
  richText?: boolean
  plainText?: boolean
  history?: boolean | HistoryPluginOptions
  list?: boolean
  table?: boolean | TablePluginOptions
  link?: boolean
  autoLink?: boolean | AutoLinkPluginOptions
  code?: boolean | CodePluginOptions
  codeShiki?: boolean
  hashtag?: boolean | HashtagPluginOptions
  mark?: boolean
  overflow?: boolean | OverflowPluginOptions
  clipboard?: boolean
  dragon?: boolean
  slashCommands?: boolean | SlashCommandPluginOptions
  markdownIO?: boolean
  htmlIO?: boolean
  fileIO?: boolean
  yjs?: CollaborationConfig
}

// ─── Plugin Options ───────────────────────────────────────────────

export interface HistoryPluginOptions {
  /** Debounce interval in milliseconds (default: 300) */
  delay?: number
  /** Maximum history depth (default: unlimited) */
  maxDepth?: number
}

export interface TablePluginOptions {
  /** Allow nested tables (default: false) */
  allowNesting?: boolean
  /** Default table dimensions on insert */
  defaultRows?: number
  defaultColumns?: number
}

export interface AutoLinkPluginOptions {
  /** Custom URL matchers */
  matchers?: AutoLinkMatcher[]
}

export interface AutoLinkMatcher {
  /** Regex pattern to match */
  pattern: RegExp
  /** Transform matched text to URL */
  urlTransformer: (match: string) => string
}

export interface CodePluginOptions {
  /** Available languages for the selector */
  languages?: string[]
  /** Use Shiki for syntax highlighting (heavier, more accurate) */
  useShiki?: boolean
}

export interface HashtagPluginOptions {
  /** Callback when hashtag is clicked */
  onHashtagClick?: (hashtag: string) => void
}

export interface OverflowPluginOptions {
  /** Maximum character count */
  maxLength: number
  /** Callback when overflow state changes */
  onOverflow?: (isOverflowing: boolean, currentLength: number) => void
}

export interface SlashCommandPluginOptions {
  /** Custom commands to add to the palette */
  commands?: SlashCommandDefinition[]
  /** Replace default commands entirely (default: false, merges with defaults) */
  replaceDefaults?: boolean
  /** Trigger character (default: '/') */
  trigger?: string
}

// ─── Slash Commands ───────────────────────────────────────────────

export interface SlashCommandDefinition {
  /** Unique command identifier */
  id: string
  /** Display label (localization key or plain string) */
  label: string
  /** Optional description text */
  description?: string
  /** Icon renderable */
  icon?: TNode
  /** Keywords for filtering */
  keywords?: string[]
  /** Category for grouping */
  category?: string
  /** Handler executed when command is selected */
  handler: (editor: LexicalEditor) => void
}

// ─── Toolbar Configuration ────────────────────────────────────────

/** Toolbar group identifiers */
export type ToolbarGroupId =
  | 'text-formatting'
  | 'headings'
  | 'lists'
  | 'blocks'
  | 'tables'
  | 'links'
  | 'history'

export interface ToolbarConfig {
  /** Groups to show (default: all) */
  visibleGroups?: ToolbarGroupId[]
  /** Groups to hide */
  hiddenGroups?: ToolbarGroupId[]
  /** Maximum heading level (1-6, default: 3) */
  maxHeadingLevel?: number
  /** Position relative to editor */
  position?: 'top' | 'bottom'
}

// ─── Marks / Annotations ─────────────────────────────────────────

export interface MarkMetadata {
  /** Unique mark identifier */
  id: string
  /** Mark category */
  type: string
  /** Arbitrary data payload */
  data: Record<string, unknown>
}

export interface MarkPluginCallbacks {
  /** Called when a mark is clicked */
  onMarkClick?: (id: string, metadata: MarkMetadata) => void
  /** Called when a mark is hovered */
  onMarkHover?: (id: string, metadata: MarkMetadata) => void
}

// ─── Collaboration ───────────────────────────────────────────────

export interface CollaborationConfig {
  /** Yjs document (consumer provides) */
  doc: unknown // Y.Doc
  /** Yjs provider (consumer provides) */
  provider: unknown // AbstractProvider
  /** Current user identity */
  user: CollaborationUser
  /** Container element for remote cursor rendering */
  cursorsContainer?: HTMLElement
}

export interface CollaborationUser {
  name: string
  color: string
}

// ─── Editor Options (Shared) ─────────────────────────────────────

/** Base options shared across all presets */
export interface LexicalEditorBaseOptions {
  /** Unique editor namespace */
  namespace?: string
  /** Initial content */
  value?: Value<EditorContent>
  /** Default content format (default: 'markdown') */
  format?: Value<ContentFormatType>
  /** Enabled/disabled plugins */
  plugins?: Value<PluginConfig>
  /** Read-only mode */
  readOnly?: Value<boolean>
  /** Placeholder text */
  placeholder?: Value<string>
  /** CSS class for the editor container */
  class?: Value<string>
  /** Error handler */
  onError?: (error: Error) => void
  /** Called on every content change */
  onInput?: (content: EditorContent) => void
  /** Called on blur or explicit save */
  onChange?: (content: EditorContent) => void
  /** Called on blur */
  onBlur?: () => void
  /** Called when editor is ready */
  onReady?: (editor: LexicalEditor) => void
  /** Mark plugin callbacks */
  marks?: MarkPluginCallbacks
}

// ─── Preset-Specific Options ─────────────────────────────────────

/** Bare preset: minimal editor, no UI chrome */
export interface BareEditorOptions extends LexicalEditorBaseOptions {
  // No additional options - bare is the base
}

/** Docked preset: persistent toolbar */
export interface DockedEditorOptions extends LexicalEditorBaseOptions {
  /** Toolbar configuration */
  toolbar?: ToolbarConfig
}

/** Contextual preset: floating toolbar + slash commands */
export interface ContextualEditorOptions extends LexicalEditorBaseOptions {
  /** Slash command configuration */
  slashCommands?: SlashCommandPluginOptions
  /** Floating toolbar visible groups (subset of ToolbarGroupId) */
  floatingToolbarGroups?: ToolbarGroupId[]
}

// ─── Form Integration ────────────────────────────────────────────

/** Editor as a form input (Markdown/HTML string value) */
export type LexicalStringInputOptions = InputOptions<string> & LexicalEditorBaseOptions & {
  format?: Value<'markdown' | 'html'>
}

/** Editor as a form input (JSON value) */
export type LexicalJsonInputOptions = InputOptions<JsonContent> & LexicalEditorBaseOptions & {
  format?: Value<'json'>
}

/** Union input options */
export type LexicalInputOptions = LexicalStringInputOptions | LexicalJsonInputOptions

// ─── Component Signatures ────────────────────────────────────────

/** Bare editor component */
export type BareEditor = (options: BareEditorOptions, ...children: TNode[]) => Renderable

/** Docked editor component */
export type DockedEditor = (options: DockedEditorOptions, ...children: TNode[]) => Renderable

/** Contextual editor component */
export type ContextualEditor = (options: ContextualEditorOptions, ...children: TNode[]) => Renderable

/** Form-integrated editor input */
export type LexicalEditorInput = (options: LexicalInputOptions) => Renderable

// ─── Headless Editor ─────────────────────────────────────────────

export interface HeadlessEditorOptions {
  /** Node types to register */
  nodes?: ReadonlyArray<typeof LexicalNode>
  /** Plugin configuration */
  plugins?: PluginConfig
  /** Error handler */
  onError?: (error: Error) => void
}

/** Create a headless editor for server-side processing */
export type CreateHeadlessEditor = (options?: HeadlessEditorOptions) => LexicalEditor

/** Factory to get the default PluginConfig for a given preset */
export type CreateDefaultPluginConfig = (preset: 'bare' | 'docked' | 'contextual') => PluginConfig

// ─── Utility Types ───────────────────────────────────────────────

/** Character count information */
export interface CharacterCountInfo {
  current: number
  max: number | undefined
  remaining: number | undefined
  isOverflowing: boolean
}

/** Selection information for programmatic use */
export interface SelectionInfo {
  hasSelection: boolean
  selectedText: string
  anchorOffset: number
  focusOffset: number
}

// ─── Extension Framework ─────────────────────────────────────────

/** Re-export surface for custom node development */
export interface LexicalExtensionAPI {
  /** Create a custom command */
  createCommand: typeof import('lexical').createCommand
  /** Base node classes for extension */
  ElementNode: typeof import('lexical').ElementNode
  DecoratorNode: typeof import('lexical').DecoratorNode
  TextNode: typeof import('lexical').TextNode
  /** Command priorities */
  COMMAND_PRIORITY_LOW: number
  COMMAND_PRIORITY_NORMAL: number
  COMMAND_PRIORITY_HIGH: number
  COMMAND_PRIORITY_CRITICAL: number
}

// ─── Public API Surface ──────────────────────────────────────────

/**
 * Everything exported from @tempots/beatui/lexical
 */
export interface LexicalPublicAPI {
  // Components
  BareEditor: BareEditor
  DockedEditor: DockedEditor
  ContextualEditor: ContextualEditor
  LexicalEditorInput: LexicalEditorInput

  // Headless
  createHeadlessEditor: CreateHeadlessEditor

  // Configuration
  createDefaultPluginConfig: CreateDefaultPluginConfig

  // Extension
  lexicalExtension: LexicalExtensionAPI

  // Types (re-exported)
  // All interfaces above are exported as types
}
