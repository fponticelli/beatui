// Bundles BeatUI base CSS as an emitted asset URL for link-based injection.
// Keep usage internal (loaded via Task in the BeatUI root component).

// Build an absolute URL to the CSS asset relative to this module.
// In library builds, Vite inlines this as a data: URL so consumers need no asset config.
const cssHref = new URL('./index.css', import.meta.url).toString()

export default cssHref
