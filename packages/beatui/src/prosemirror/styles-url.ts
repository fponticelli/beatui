/**
 * Resolves the ProseMirror editor CSS stylesheet as an absolute URL.
 *
 * In library builds, Vite inlines this as a `data:` URL so consumers do not
 * need any additional asset configuration. The resulting URL is used by the
 * `cssInjection: 'link'` option of {@link ProseMirrorMarkdownInput} to
 * lazily inject the stylesheet via a `<link>` element.
 *
 * @module
 */

// Build an absolute URL to the CSS asset relative to this module.
// In library builds, Vite inlines this as a data: URL so consumers need no asset config.
const cssHref = new URL(
  '../components/prosemirror/prosemirror-editor.css',
  import.meta.url
).toString()

/** Absolute URL pointing to the ProseMirror editor CSS stylesheet. */
export default cssHref
