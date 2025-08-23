import { Value } from '@tempots/dom'

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
