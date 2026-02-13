/**
 * Type definitions for Monaco Editor integration within BeatUI.
 *
 * @module
 */

import { Value } from '@tempots/dom'

/**
 * Supported language identifiers for the Monaco editor.
 *
 * Includes the most common built-in languages as literal types, but any
 * valid Monaco language string is accepted.
 *
 * @example
 * ```ts
 * const lang: MonacoLanguage = 'typescript'
 * ```
 */
export type MonacoLanguage =
  | 'plaintext'
  | 'json'
  | 'yaml'
  | 'typescript'
  | 'javascript'
  | 'css'
  | 'html'
  | string

/**
 * Describes a JSON Schema to be registered with the Monaco JSON language
 * service for validation and autocompletion.
 */
export type MonacoJSONSchema = {
  /** URI identifying this schema (e.g. `'http://myserver/schema.json'`). */
  uri: string
  /** Glob patterns of files this schema applies to (e.g. `['*.json']`). */
  fileMatch: string[]
  /** The JSON Schema object itself (any valid JSON Schema draft). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any
}

/**
 * Monaco-specific options used by {@link MonacoEditorInput} in addition to
 * the standard BeatUI `InputOptions`.
 */
export type MonacoEditorSpecificOptions = {
  /**
   * The programming language for syntax highlighting and validation.
   * @default 'plaintext'
   */
  language?: Value<MonacoLanguage>
  /**
   * Additional Monaco editor constructor options passed directly to
   * `monaco.editor.create()`.
   */
  editorOptions?: Record<string, unknown>
  /**
   * JSON Schemas to register with the Monaco JSON language service.
   * Only relevant when `language` is `'json'`.
   */
  jsonSchemas?: Value<MonacoJSONSchema[]> | undefined
  /**
   * Whether the editor should be read-only.
   * @default false
   */
  readOnly?: Value<boolean>
  /**
   * Optional fetcher for external JSON/YAML schemas. Used by JSON via
   * prefetch and by YAML via `schemaRequestService`.
   */
  schemaRequest?:
    | Value<((url: string) => Promise<string>) | undefined>
    | ((url: string) => Promise<string>)
    | undefined
}
