/**
 * Re-exports the shared {@link EditorToolbarGroup} component under its
 * legacy alias `EToolbarGroup` for backwards compatibility with older
 * ProseMirror toolbar integrations.
 *
 * New code should import `EditorToolbarGroup` directly from
 * `../editor-toolbar` instead.
 *
 * @module
 */
// Re-export from shared editor-toolbar components for backwards compatibility
export { EditorToolbarGroup as EToolbarGroup } from '../editor-toolbar'
