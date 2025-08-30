import {
  attr,
  html,
  prop,
  style,
  Ensure,
  Computed,
  MapSignal,
} from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Group,
  NativeSelect,
  SelectOption,
} from '@tempots/beatui'
import { JSONSchemaForm } from '@tempots/beatui/json-schema'
import { MonacoEditorInput } from '@tempots/beatui/monaco'

const sampleNames = ['sample', 'draft-2019', 'draft-2020', 'draft-07']

// Edit the JSON Schema (via Monaco) and see the form update live
export function JSONSchemaFormPage() {
  const selectedSample = prop(sampleNames[0])
  const sample = selectedSample.mapAsync<{
    schema: object | null
    data: unknown
  }>(
    async name => {
      const files = await Promise.all([
        import(`./json-samples/${name}-schema.ts`).then(m => m.default),
        import(`./json-samples/${name}-data.ts`).then(m => m.default),
      ])
      return {
        schema: files[0] as object,
        data: files[1] as object,
      }
    },
    { schema: null, data: {} }
  )
  const data = sample.$.data.deriveProp()
  const schema = sample.$.schema

  // Monaco editor content (JSON string)
  const schemaJson = schema.map(v => JSON.stringify(v, null, 2)).deriveProp()

  // Parse schema text -> either { ok, value } or { ok, error }
  const parsedSchema = schemaJson.map(text => {
    try {
      const obj = JSON.parse(text) as unknown
      return { ok: true as const, value: obj }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      return { ok: false as const, error: message }
    }
  })

  // Extract a Value of schema (or null) and error (or null)
  const schemaDef: Computed<unknown | null> = parsedSchema.map(rs =>
    rs.ok ? (rs.value as unknown) : null
  )
  const schemaError = parsedSchema.map(rs => (rs.ok ? null : rs.error))

  return ScrollablePanel({
    body: Group(
      attr.class('bu-items-start bu-gap-4 bu-p-4 bu-h-full bu-overflow-hidden'),

      // Left: JSON Schema editor (Monaco)
      ScrollablePanel(
        {
          header: html.div(
            html.h3(
              attr.class('bu-text-lg bu-font-semibold'),
              'Edit JSON Schema (JSON)'
            ),
            NativeSelect({
              options: sampleNames.map(name => SelectOption.value(name, name)),
              value: selectedSample,
              onChange: selectedSample.set,
            })
          ),
          body: MonacoEditorInput({
            value: schemaJson,
            onChange: (v: string) => schemaJson.set(v),
            language: 'json',
            // Enable fetching the $schema meta-schema for validation
            schemaRequest: async (url: string) => {
              const res = await fetch(url)
              if (!res.ok)
                throw new Error(
                  `Failed to fetch schema: ${res.status} ${res.statusText}`
                )
              return await res.text()
            },
          }),
        },
        style.width('50%'),
        style.minWidth('24rem')
      ),

      // Right: Form rendered from schema + live value
      Stack(
        attr.class('bu-gap-2 bu-h-full bu-overflow-hidden'),
        style.width('50%'),
        ScrollablePanel({
          body: Ensure(
            schemaDef,
            schema =>
              MapSignal(schema, schema => {
                return JSONSchemaForm(
                  { schema, initialValue: data },
                  ({ Form, controller }) => {
                    controller.value.feedProp(data)
                    return Form
                  }
                )
              }),
            () =>
              html.div(
                attr.class('bu-text-red-600'),
                'Invalid JSON: ',
                schemaError.map(String)
              )
          ),
        }),
        ScrollablePanel(
          {
            body: html.pre(
              attr.class('bu-whitespace-pre-wrap bu-text-sm'),
              data.map(v => JSON.stringify(v, null, 2))
            ),
          },
          style.height('50%')
        )
      )
    ),
  })
}
