// Bundles ProseMirror editor CSS for lazy injection.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite inlines the CSS as a string
import css from '../components/prosemirror/prosemirror-editor.css?inline'

export default css as string

