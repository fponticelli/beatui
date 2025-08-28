// This module bundles Monaco editor CSS as a JS string for lazy, bundler-agnostic injection.
// Vite resolves any imports at build time so consumers need no special config.
// DO NOT import this module except from inside a lazy code path.

// Import CSS as text (Vite inlines it)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - virtual import returns string
import css from '../components/monaco/monaco-editor.css?inline'

export default css as string

