/**
 * Public entry point for the `@tempots/beatui/monaco` optional module.
 *
 * Re-exports the Monaco editor input component, type definitions, and the
 * environment configuration helper. Monaco workers are configured
 * automatically when the editor is first loaded via CDN.
 *
 * ```ts
 * import {
 *   MonacoEditorInput,
 *   configureMonacoEnvironment,
 *   type MonacoLanguage,
 * } from '@tempots/beatui/monaco'
 * ```
 *
 * @module
 */

// Monaco workers will be configured automatically when Monaco is loaded
export * from '../components/monaco/monaco-editor-input'
export * from './types'
export { configureMonacoEnvironment } from './lazy-loader'
