/**
 * Lexical Editor Integration - Entry Point
 * @module @tempots/beatui/lexical
 *
 * Provides rich text editing via Facebook's Lexical framework with three
 * pre-configured presets (Bare, Docked, Contextual), full plugin coverage,
 * multi-format I/O, form integration, and theme/i18n support.
 */

// Types
export type {
  ContentFormatType,
  JsonContent,
  LexicalPluginDefinition,
  PluginConfig,
  HistoryPluginOptions,
  TablePluginOptions,
  AutoLinkPluginOptions,
  AutoLinkMatcher,
  CodePluginOptions,
  HashtagPluginOptions,
  OverflowPluginOptions,
  SlashCommandPluginOptions,
  SlashCommandDefinition,
  ToolbarGroupId,
  ToolbarButtonId,
  ToolbarConfig,
  ToolbarLayoutGroup,
  ToolbarLayoutSeparator,
  ToolbarLayoutEntry,
  MarkMetadata,
  MarkPluginCallbacks,
  CollaborationConfig,
  CollaborationUser,
  LexicalEditorBaseOptions,
  BareEditorOptions,
  DockedEditorOptions,
  ContextualEditorOptions,
  LexicalStringInputOptions,
  LexicalJsonInputOptions,
  LexicalInputOptions,
  HeadlessEditorOptions,
  CharacterCountInfo,
  SelectionInfo,
  EditorPresetType,
  EditorHeightMode,
} from './types'

export { TOOLBAR_SEPARATOR } from './types'

// Node helpers and default configs
export { getNodesForPlugins, createDefaultPluginConfig } from './nodes'

// Custom nodes
export {
  HorizontalRuleNode,
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
} from './horizontal-rule-node'
export type { SerializedHorizontalRuleNode } from './horizontal-rule-node'

// Lazy loader
export { loadLexicalCore } from './lazy-loader'

// Plugin wrappers
export {
  registerRichTextPlugin,
  registerPlainTextPlugin,
  registerHistoryPlugin,
  registerClipboardPlugin,
  registerListPlugin,
  registerLinkPlugin,
  registerSlashCommandsPlugin,
  executeSlashCommand,
  exportToMarkdown,
  importFromMarkdown,
  getMarkdownTransformers,
  exportToHtml,
  importFromHtml,
  exportEditorToFile,
  importFileToEditor,
  registerTablePlugin,
  insertTable,
  registerCodePlugin,
  registerCodeShikiPlugin,
  registerHashtagPlugin,
  registerAutoLinkPlugin,
  registerMarkPlugin,
  applyMark,
  removeMark,
  registerOverflowPlugin,
  registerDragonPlugin,
  registerYjsPlugin,
  getSelectionInfo,
  getTextContent,
  getCharacterCount,
  getWordCount,
  loadOffsetUtils,
  registerHorizontalRulePlugin,
  HR_TRANSFORMER,
  buildInlineStyleImportMap,
  buildStyleImportMap,
  DEFAULT_INLINE_STYLE_PROPERTIES,
} from './plugins'

export type { SlashCommandState, SlashCommandCallbacks } from './plugins'

// Headless editor
export {
  createHeadlessEditor,
  markdownToLexicalJson,
  lexicalJsonToMarkdown,
  htmlToLexicalJson,
  lexicalJsonToHtml,
} from './headless'

// Extension framework re-exports for custom node/plugin development
export {
  createCommand,
  ElementNode,
  DecoratorNode,
  TextNode,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_NORMAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_CRITICAL,
} from 'lexical'

export type {
  LexicalEditor,
  LexicalNode,
  EditorState,
  SerializedEditorState,
  SerializedLexicalNode,
  NodeKey,
  EditorThemeClasses,
} from 'lexical'

// Commands
export * from './commands'

// Components
export * from '../components/lexical'
