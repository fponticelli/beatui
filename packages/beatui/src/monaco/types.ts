import { Value } from '@tempots/dom'

export type MinimalEditor = {
  focus(): unknown
  getValue: () => string
  setValue: (v: string) => void
  updateOptions: (opts: Record<string, unknown>) => void
  getModel: () => unknown
  onDidChangeModelContent: (cb: () => void) => { dispose: () => void }
  onDidBlurEditorText: (cb: () => void) => { dispose: () => void }
  dispose: () => void
}

export type MinimalMonaco = {
  editor: {
    create: (el: HTMLElement, opts: Record<string, unknown>) => MinimalEditor
    setModelLanguage: (model: unknown, lang: string) => void
  }
  languages?: {
    json?: { jsonDefaults: { setDiagnosticsOptions: (opts: unknown) => void } }
    register?: (lang: { id: string }) => void
  }
}

export type MonacoLanguage =
  | 'plaintext'
  | 'json'
  | 'yaml'
  | 'typescript'
  | 'javascript'
  | 'css'
  | 'html'
  | string

export type MonacoJSONSchema = {
  uri: string
  fileMatch: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any
}

export type MonacoEditorSpecificOptions = {
  language?: Value<MonacoLanguage>
  editorOptions?: Record<string, unknown>
  jsonSchemas?: Value<MonacoJSONSchema[]> | undefined
  readOnly?: Value<boolean>
  // Optional fetcher for external schemas (used for YAML via schemaRequestService and JSON via prefetch)
  schemaRequest?:
    | Value<((url: string) => Promise<string>) | undefined>
    | ((url: string) => Promise<string>)
    | undefined
}
