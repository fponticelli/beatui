import type { Renderable, TNode, Value } from '@tempots/dom'
import type { Merge } from '@tempots/std'
import type { LexicalEditor, LexicalNode, Klass } from 'lexical'
import type { InputOptions } from '../components/form/input/input-options'

/**
 * Content format types supported by the editor
 */
export type ContentFormatType = 'markdown' | 'json' | 'html'

/**
 * JSON-based content (Lexical's serialized state)
 */
export type JsonContent = Record<string, unknown>

/**
 * Plugin definition for Lexical editor
 */
export interface LexicalPluginDefinition {
  /**
   * Unique name for the plugin
   */
  name: string

  /**
   * Custom Lexical nodes this plugin provides
   */
  nodes?: Klass<LexicalNode>[]

  /**
   * Registration function called when plugin is initialized
   * @param editor - The Lexical editor instance
   * @returns Optional cleanup function
   */
  register: (editor: LexicalEditor) => (() => void) | void
}

/**
 * Configuration for built-in editor plugins
 */
export interface PluginConfig {
  /**
   * Enable rich text features (bold, italic, etc.)
   */
  richText?: boolean

  /**
   * Enable plain text mode (no formatting)
   */
  plainText?: boolean

  /**
   * Enable undo/redo history
   */
  history?: boolean | HistoryPluginOptions

  /**
   * Enable list support (ul, ol)
   */
  list?: boolean

  /**
   * Enable table support
   */
  table?: boolean | TablePluginOptions

  /**
   * Enable link support
   */
  link?: boolean

  /**
   * Enable automatic link detection
   */
  autoLink?: boolean | AutoLinkPluginOptions

  /**
   * Enable code block support
   */
  code?: boolean | CodePluginOptions

  /**
   * Enable Shiki syntax highlighting for code blocks
   */
  codeShiki?: boolean

  /**
   * Enable hashtag support
   */
  hashtag?: boolean | HashtagPluginOptions

  /**
   * Enable mark/annotation support
   */
  mark?: boolean

  /**
   * Enable overflow detection
   */
  overflow?: boolean | OverflowPluginOptions

  /**
   * Enable clipboard handling
   */
  clipboard?: boolean

  /**
   * Enable dragon drop support
   */
  dragon?: boolean

  /**
   * Enable slash commands
   */
  slashCommands?: boolean | SlashCommandPluginOptions

  /**
   * Enable markdown import/export
   */
  markdownIO?: boolean

  /**
   * Enable HTML import/export
   */
  htmlIO?: boolean

  /**
   * Enable file operations
   */
  fileIO?: boolean

  /**
   * Enable Yjs collaborative editing
   */
  yjs?: CollaborationConfig
}

/**
 * Options for the history plugin
 */
export interface HistoryPluginOptions {
  /**
   * Delay before creating a new history entry (ms)
   * @default 300
   */
  delay?: number

  /**
   * Maximum number of history entries to keep
   * @default 100
   */
  maxDepth?: number
}

/**
 * Options for the table plugin
 */
export interface TablePluginOptions {
  /**
   * Allow nested tables
   * @default false
   */
  allowNesting?: boolean

  /**
   * Default number of rows for new tables
   * @default 3
   */
  defaultRows?: number

  /**
   * Default number of columns for new tables
   * @default 3
   */
  defaultColumns?: number
}

/**
 * Options for the auto-link plugin
 */
export interface AutoLinkPluginOptions {
  /**
   * Custom matchers for auto-linking
   */
  matchers?: AutoLinkMatcher[]
}

/**
 * Auto-link matcher definition
 */
export interface AutoLinkMatcher {
  /**
   * Regular expression pattern to match
   */
  pattern: RegExp

  /**
   * Transform matched text into a URL
   * @param match - The matched text
   * @returns The URL to link to
   */
  urlTransformer: (match: string) => string
}

/**
 * Options for the code plugin
 */
export interface CodePluginOptions {
  /**
   * Supported programming languages
   */
  languages?: string[]

  /**
   * Use Shiki for syntax highlighting
   * @default false
   */
  useShiki?: boolean
}

/**
 * Options for the hashtag plugin
 */
export interface HashtagPluginOptions {
  /**
   * Callback when a hashtag is clicked
   * @param hashtag - The hashtag text (without #)
   */
  onHashtagClick?: (hashtag: string) => void
}

/**
 * Options for the overflow plugin
 */
export interface OverflowPluginOptions {
  /**
   * Maximum character length
   */
  maxLength: number

  /**
   * Callback when overflow state changes
   * @param isOverflowing - Whether content exceeds the limit
   * @param currentLength - Current character count
   */
  onOverflow?: (isOverflowing: boolean, currentLength: number) => void
}

/**
 * Options for the slash commands plugin
 */
export interface SlashCommandPluginOptions {
  /**
   * Custom slash commands
   */
  commands?: SlashCommandDefinition[]

  /**
   * Replace default commands instead of extending
   * @default false
   */
  replaceDefaults?: boolean

  /**
   * Trigger character for commands
   * @default '/'
   */
  trigger?: string
}

/**
 * Slash command definition
 */
export interface SlashCommandDefinition {
  /**
   * Unique identifier for the command
   */
  id: string

  /**
   * Display label
   */
  label: string

  /**
   * Optional description
   */
  description?: string

  /**
   * Optional icon (emoji or HTML)
   */
  icon?: string | TNode

  /**
   * Keywords for searching
   */
  keywords?: string[]

  /**
   * Category for grouping
   */
  category?: string

  /**
   * Handler function when command is executed
   * @param editor - The Lexical editor instance
   */
  handler: (editor: LexicalEditor) => void
}

/**
 * Font option for toolbar dropdowns
 */
export interface FontOption {
  /**
   * CSS value (e.g. 'Arial', '14px'). Empty string means default/inherit.
   */
  value: string

  /**
   * Display label shown in the dropdown
   */
  label: string
}

/**
 * Toolbar group identifiers
 */
export type ToolbarGroupId =
  | 'text-formatting'
  | 'headings'
  | 'lists'
  | 'indent'
  | 'blocks'
  | 'tables'
  | 'links'
  | 'history'
  | 'clipboard'
  | 'font'
  | 'color'
  | 'clear-formatting'

/**
 * Stable identifiers for individual toolbar buttons/controls.
 * Each ID corresponds to a single button or widget within a toolbar group.
 */
export type ToolbarButtonId =
  // text-formatting group
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  // clear-formatting group
  | 'clear-formatting'
  // headings group
  | 'paragraph'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'heading-4'
  | 'heading-5'
  | 'heading-6'
  // lists group
  | 'bullet-list'
  | 'ordered-list'
  | 'check-list'
  // indent group
  | 'indent'
  | 'outdent'
  // blocks group
  | 'blockquote'
  | 'code-block'
  | 'horizontal-rule'
  // tables group
  | 'insert-table'
  // links group
  | 'link'
  // history group
  | 'undo'
  | 'redo'
  // clipboard group
  | 'cut'
  | 'copy'
  | 'paste'
  // font group (select widgets)
  | 'font-family'
  | 'font-size'
  | 'line-height'
  // color group (color picker widgets)
  | 'font-color'
  | 'highlight-color'
  | 'background-color'

/**
 * A group entry in the toolbar layout.
 * Specifies which group to render, optionally restricting to specific buttons.
 */
export interface ToolbarLayoutGroup {
  /** The group to render */
  group: ToolbarGroupId
  /**
   * Optional subset of buttons/controls to include within this group.
   * When omitted, all buttons in the group are shown (respecting maxHeadingLevel).
   */
  items?: ToolbarButtonId[]
}

/**
 * A visual separator between toolbar groups.
 */
export interface ToolbarLayoutSeparator {
  separator: true
}

/**
 * A single entry in the toolbar layout.
 * Either a group (with optional button subset) or a visual separator.
 */
export type ToolbarLayoutEntry = ToolbarLayoutGroup | ToolbarLayoutSeparator

/**
 * Convenience constant for inserting a separator in a toolbar layout.
 */
export const TOOLBAR_SEPARATOR: ToolbarLayoutSeparator = { separator: true }

/**
 * Toolbar configuration
 */
export interface ToolbarConfig {
  /**
   * Groups to show in toolbar (whitelist).
   * Ignored when `layout` is set.
   */
  visibleGroups?: ToolbarGroupId[]

  /**
   * Groups to hide from toolbar (blacklist).
   * Ignored when `layout` is set.
   */
  hiddenGroups?: ToolbarGroupId[]

  /**
   * Maximum heading level (1-6)
   * @default 3
   */
  maxHeadingLevel?: 1 | 2 | 3 | 4 | 5 | 6

  /**
   * Toolbar position
   * @default 'top'
   */
  position?: 'top' | 'bottom'

  /**
   * Custom font families for the font dropdown.
   * Each entry has a CSS `value` and a display `label`.
   * A `{ value: '', label: 'Default' }` entry is always prepended automatically.
   */
  fontFamilies?: FontOption[]

  /**
   * Custom font sizes for the size dropdown.
   * Each entry has a CSS `value` (e.g. '14px') and a display `label` (e.g. '14').
   * A `{ value: '', label: 'Default' }` entry is always prepended automatically.
   */
  fontSizes?: FontOption[]

  /**
   * Custom line-height options for the line-height dropdown.
   * Each entry has a unitless CSS `value` (e.g. '1.5') and a display `label`.
   * A `{ value: '', label: 'Default' }` entry is always prepended automatically.
   */
  lineHeights?: FontOption[]

  /**
   * Declarative toolbar layout. When provided, takes full control over
   * which groups/buttons appear and in what order.
   * `visibleGroups` and `hiddenGroups` are ignored when `layout` is set.
   */
  layout?: ToolbarLayoutEntry[]
}

/**
 * Mark/annotation metadata
 */
export interface MarkMetadata {
  /**
   * Unique identifier for the mark
   */
  id: string

  /**
   * Type of mark (e.g., 'comment', 'suggestion')
   */
  type: string

  /**
   * Additional data associated with the mark
   */
  data?: Record<string, unknown>
}

/**
 * Callbacks for mark plugin
 */
export interface MarkPluginCallbacks {
  /**
   * Called when a mark is clicked
   * @param id - The mark identifier
   * @param metadata - The mark metadata
   */
  onMarkClick?: (id: string, metadata: MarkMetadata) => void

  /**
   * Called when a mark is hovered
   * @param id - The mark identifier
   * @param metadata - The mark metadata
   */
  onMarkHover?: (id: string, metadata: MarkMetadata) => void
}

/**
 * Yjs Doc interface (subset of yjs Doc type used by Lexical)
 * Using a minimal interface to avoid requiring yjs as a direct dependency
 */
export interface YjsDoc {
  getText(name: string): unknown
}

/**
 * User state for Yjs awareness (matches @lexical/yjs UserState)
 */
export interface YjsUserState {
  anchorPos: unknown | null
  color: string
  focusing: boolean
  focusPos: unknown | null
  name: string
  awarenessData: object
  [key: string]: unknown
}

/**
 * Yjs Provider awareness interface
 */
export interface YjsProviderAwareness {
  getLocalState: () => YjsUserState | null
  getStates: () => Map<number, YjsUserState>
  off: (type: 'update', cb: () => void) => void
  on: (type: 'update', cb: () => void) => void
  setLocalState: (arg0: YjsUserState | null) => void
  setLocalStateField: (field: string, value: unknown) => void
}

/**
 * Yjs Provider interface (matches @lexical/yjs Provider)
 * Using the full interface required by Lexical's createBinding
 */
export interface YjsProvider {
  awareness: YjsProviderAwareness
  connect(): void | Promise<void>
  disconnect(): void
  off(type: 'sync', cb: (isSynced: boolean) => void): void
  off(type: 'update', cb: (arg0: unknown) => void): void
  off(type: 'status', cb: (arg0: { status: string }) => void): void
  off(type: 'reload', cb: (doc: YjsDoc) => void): void
  on(type: 'sync', cb: (isSynced: boolean) => void): void
  on(type: 'status', cb: (arg0: { status: string }) => void): void
  on(type: 'update', cb: (arg0: unknown) => void): void
  on(type: 'reload', cb: (doc: YjsDoc) => void): void
}

/**
 * Collaboration configuration (Yjs)
 */
export interface CollaborationConfig {
  /**
   * Yjs document
   */
  doc: YjsDoc

  /**
   * Yjs provider (WebSocket, WebRTC, etc.)
   */
  provider: YjsProvider

  /**
   * Unique identifier for the document binding
   */
  id?: string

  /**
   * Map of document IDs to Doc instances
   */
  docMap?: Map<string, YjsDoc>

  /**
   * Current user information
   */
  user: CollaborationUser

  /**
   * Container element for rendering remote cursors
   */
  cursorsContainer?: HTMLElement | Value<HTMLElement | undefined>
}

/**
 * User information for collaboration
 */
export interface CollaborationUser {
  /**
   * User display name
   */
  name: string

  /**
   * User cursor color (hex or CSS color)
   */
  color: string
}

/**
 * Height behavior mode for the editor surface.
 * - 'fixed': Fills the container height; scrolls when content overflows. Default for DockedEditor.
 * - 'auto': Grows with content; no built-in scrollbar. Default for BareEditor and ContextualEditor.
 */
export type EditorHeightMode = 'fixed' | 'auto'

interface UntypedLexicalEditorOptions {
  /**
   * Editor namespace (for multiple editors on the same page)
   */
  namespace?: string

  /**
   * Plugin configuration
   */
  plugins?: PluginConfig

  /**
   * Read-only mode
   */
  readOnly?: Value<boolean>

  /**
   * Placeholder text when empty
   */
  placeholder?: Value<string | Renderable>

  /**
   * CSS class name(s)
   */
  class?: Value<string>

  /**
   * Error handler
   * @param error - The error that occurred
   * @param editor - The editor instance
   */
  onError?: (error: Error, editor: LexicalEditor) => void

  /**
   * Blur event handler
   * @param editor - The editor instance
   */
  onBlur?: (editor: LexicalEditor) => void

  /**
   * Ready event handler (editor fully initialized)
   * @param editor - The editor instance
   */
  onReady?: (editor: LexicalEditor) => void

  /**
   * Mark/annotation callbacks
   */
  marks?: MarkPluginCallbacks

  /**
   * Height behavior mode.
   * - 'fixed': fills container, scrolls on overflow (default for DockedEditor)
   * - 'auto': grows with content (default for BareEditor, ContextualEditor)
   */
  heightMode?: EditorHeightMode

  /**
   * Whether to automatically focus the editor on mount.
   * @default false
   */
  autoFocus?: boolean
}

interface StringLexicalEditorOptions extends UntypedLexicalEditorOptions {
  value?: Value<string>
  format?: 'markdown' | 'html'
  onChange?: (content: string, editor: LexicalEditor) => void
  onInput?: (content: string, editor: LexicalEditor) => void
}

interface JsonLexicalEditorOptions extends UntypedLexicalEditorOptions {
  value?: Value<JsonContent>
  format?: 'json'
  onChange?: (content: JsonContent, editor: LexicalEditor) => void
  onInput?: (content: JsonContent, editor: LexicalEditor) => void
}

export type LexicalEditorBaseOptions =
  | StringLexicalEditorOptions
  | JsonLexicalEditorOptions

/**
 * Options for bare editor (minimal features)
 */
export type BareEditorOptions = LexicalEditorBaseOptions

/**
 * Options for docked editor (with fixed toolbar)
 */
export type DockedEditorOptions = LexicalEditorBaseOptions & {
  /**
   * Toolbar configuration
   */
  toolbar?: ToolbarConfig
}

/**
 * Options for contextual editor (with floating toolbar and block handle)
 */
export type ContextualEditorOptions = LexicalEditorBaseOptions & {
  /**
   * @deprecated Slash commands are no longer used. Use the block handle instead.
   */
  slashCommands?: SlashCommandPluginOptions

  /**
   * Floating toolbar groups to show
   */
  floatingToolbarGroups?: ToolbarGroupId[]
}

/**
 * Options for Lexical string input (markdown or HTML)
 */
export type LexicalStringInputOptions = Merge<
  InputOptions<string>,
  LexicalEditorBaseOptions & {
    format?: 'markdown' | 'html'
  }
>

/**
 * Options for Lexical JSON input (Lexical state)
 */
export type LexicalJsonInputOptions = Merge<
  InputOptions<JsonContent>,
  LexicalEditorBaseOptions & {
    format?: 'json'
  }
>

/**
 * Union of all input options
 */
export type LexicalInputOptions =
  | LexicalStringInputOptions
  | LexicalJsonInputOptions

/**
 * Options for headless editor (no UI)
 */
export interface HeadlessEditorOptions {
  /**
   * Custom nodes to register
   */
  nodes?: Klass<LexicalNode>[]

  /**
   * Custom plugins to register
   */
  plugins?: LexicalPluginDefinition[]

  /**
   * Error handler
   * @param error - The error that occurred
   * @param editor - The editor instance
   */
  onError?: (error: Error, editor: LexicalEditor) => void
}

/**
 * Character count information
 */
export interface CharacterCountInfo {
  /**
   * Current character count
   */
  current: number

  /**
   * Maximum allowed characters (if set)
   */
  max?: number

  /**
   * Remaining characters (max - current)
   */
  remaining?: number

  /**
   * Whether the content exceeds the max
   */
  isOverflowing: boolean
}

/**
 * Selection information
 */
export interface SelectionInfo {
  /**
   * Whether there is an active selection
   */
  hasSelection: boolean

  /**
   * Selected text content
   */
  selectedText: string

  /**
   * Anchor offset in the text
   */
  anchorOffset: number

  /**
   * Focus offset in the text
   */
  focusOffset: number
}

/**
 * Editor preset type for createDefaultPluginConfig
 */
export type EditorPresetType = 'bare' | 'docked' | 'contextual'
