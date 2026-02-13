/**
 * Re-exports the shared {@link EditorToolbarButton} component under its
 * legacy alias `EToolbarButton` for backwards compatibility with older
 * ProseMirror toolbar integrations.
 *
 * New code should import `EditorToolbarButton` directly from
 * `../editor-toolbar` instead.
 *
 * @module
 */
// Re-export from shared editor-toolbar components for backwards compatibility
export { EditorToolbarButton as EToolbarButton } from '../editor-toolbar'
