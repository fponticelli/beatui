// Build an absolute URL to the CSS asset relative to this module.
// In library builds, Vite inlines this as a data: URL so consumers need no asset config.
const cssHref = new URL(
  '../components/prosemirror/prosemirror-editor.css',
  import.meta.url
).toString()

export default cssHref
