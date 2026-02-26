// Plugin wrappers barrel export
export { registerRichTextPlugin } from './rich-text'
export { registerPlainTextPlugin } from './plain-text'
export { registerHistoryPlugin } from './history'
export { registerClipboardPlugin } from './clipboard'
export { registerListPlugin } from './list'
export { registerLinkPlugin } from './link'
export {
  registerSlashCommandsPlugin,
  executeSlashCommand,
} from './slash-commands'
export type { SlashCommandState, SlashCommandCallbacks } from './slash-commands'
export {
  exportToMarkdown,
  importFromMarkdown,
  getMarkdownTransformers,
} from './markdown-io'
export { exportToHtml, importFromHtml } from './html-io'
export { exportEditorToFile, importFileToEditor } from './file-io'
export { registerTablePlugin, insertTable } from './table'
export { registerCodePlugin } from './code'
export { registerCodeShikiPlugin } from './code-shiki'
export { registerHashtagPlugin } from './hashtag'
export { registerAutoLinkPlugin } from './auto-link'
export { registerMarkPlugin, applyMark, removeMark } from './mark'
export { registerOverflowPlugin } from './overflow'
export { registerDragonPlugin } from './dragon'
export { registerYjsPlugin } from './yjs'
export { getSelectionInfo } from './selection'
export {
  getTextContent,
  getCharacterCount,
  getWordCount,
  insertTextAtCursor,
} from './text'
export { loadOffsetUtils } from './offset'
export { registerHorizontalRulePlugin, HR_TRANSFORMER } from './horizontal-rule'
export {
  registerElementStylePlugin,
  buildElementStyleExportMap,
  buildElementStyleImportMap,
  buildInlineStyleImportMap,
  buildStyleImportMap,
  DEFAULT_INLINE_STYLE_PROPERTIES,
  mergeElementStyle,
  getElementStyleProperty,
} from './element-style'
