// This module bundles Milkdown editor CSS as a JS string for lazy, bundler-agnostic injection.
// Vite resolves @import dependencies at build time so consumers need no special config.
// DO NOT import this module except from inside a lazy code path.

// Import CSS as text (Vite inlines and resolves @imports)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - virtual import returns string
import css from '../components/milkdown/milkdown.css?inline'

export default css as string

