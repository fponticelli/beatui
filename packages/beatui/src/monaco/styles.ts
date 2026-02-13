/**
 * Bundles Monaco editor CSS as a JavaScript string for lazy, bundler-agnostic
 * injection (e.g. via a `<style>` element).
 *
 * Vite resolves the CSS import at build time so consumers need no special
 * asset configuration. **Do not** import this module except from inside a
 * lazy code path to avoid pulling the CSS into the main bundle.
 *
 * @module
 */

// Import CSS as text (Vite inlines it)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - virtual import returns string
import css from '../components/monaco/monaco-editor.css?inline'

/** The Monaco editor CSS stylesheet as an inlined string. */
export default css as string
