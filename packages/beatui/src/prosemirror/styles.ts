/**
 * Bundles the ProseMirror editor CSS as a raw string for lazy, programmatic
 * injection (e.g. via a `<style>` element).
 *
 * Vite inlines the CSS at build time so the string is available
 * synchronously after a dynamic `import()` of this module.
 *
 * @module
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite inlines the CSS as a string
import css from '../components/prosemirror/prosemirror-editor.css?inline'

/** The ProseMirror editor CSS stylesheet as an inlined string. */
export default css as string
