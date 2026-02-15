import {
  attr,
  html,
  prop,
  style,
  Ensure,
  Computed,
  MapSignal,
  computedOf,
} from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Group,
  NativeSelect,
  Option,
  Switch,
} from '@tempots/beatui'
import {
  JSONSchemaDisplay,
  type JSONSchema,
} from '@tempots/beatui/json-schema-display'
import { MonacoEditorInput } from '@tempots/beatui/monaco'

const sampleNames = [
  'sample',
  'schema-defaults-demo',
  'unions-conditions',
  'arrays-tuples',
  'additional-pattern-props',
  'formats-media',
  'enums-nullability',
  'composition-refs',
  'allof-merge-demo',
  'annotations',
  'prefix-items',
  'draft-07',
  'draft-2019',
  'draft-2020',
]

export default function JSONSchemaDisplayPage() {
  const selectedSample = prop(sampleNames[0])
  const showMismatches = prop(true)

  const sample = selectedSample.mapAsync<{
    schema: JSONSchema | null
    data: unknown
  }>(
    async name => {
      const files = await Promise.all([
        import(`./json-samples/${name}-schema.ts`).then(m => m.default),
        import(`./json-samples/${name}-data.ts`).then(m => m.default),
      ])
      return {
        schema: files[0] as JSONSchema,
        data: files[1] as unknown,
      }
    },
    { schema: null, data: {} }
  )

  const data = sample.$.data.deriveProp()
  const schema = sample.$.schema

  // Monaco editor content (JSON string for value)
  const dataJson = data.map(v => JSON.stringify(v, null, 2)).deriveProp()

  // Parse JSON text back to value
  const parsedData = dataJson.map(text => {
    try {
      const obj = JSON.parse(text) as unknown
      return { ok: true as const, value: obj }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      return { ok: false as const, error: message }
    }
  })

  const dataValue: Computed<unknown | null> = parsedData.map(rs =>
    rs.ok ? rs.value : null
  )
  const dataError = parsedData.map(rs => (rs.ok ? null : rs.error))

  return ScrollablePanel({
    body: Group(
      attr.class('items-start gap-4 p-4 h-full overflow-hidden'),

      // Left: JSON Value editor (Monaco)
      ScrollablePanel(
        {
          header: html.div(
            html.h3(attr.class('text-lg font-semibold'), 'Edit JSON Value'),
            Group(
              attr.class('gap-2 items-center'),
              NativeSelect({
                options: sampleNames.map(name => Option.value(name, name)),
                value: selectedSample,
                onChange: selectedSample.set,
              }),
              html.label(
                attr.class('text-sm flex items-center gap-1'),
                'Mismatches',
                Switch({
                  value: showMismatches,
                  onChange: showMismatches.set,
                })
              )
            )
          ),
          body: MonacoEditorInput({
            value: dataJson,
            onChange: (v: string) => dataJson.set(v),
            language: 'json',
          }),
        },
        style.width('50%'),
        style.minWidth('24rem')
      ),

      // Right: Display rendered from schema + value
      Stack(
        attr.class('gap-2 h-full overflow-hidden'),
        style.width('50%'),
        ScrollablePanel({
          header: html.h3(
            attr.class('text-lg font-semibold'),
            'JSON Schema Display'
          ),
          body: Ensure(
            schema,
            schema =>
              Ensure(
                dataValue,
                dataValue => {
                  const display = computedOf(
                    showMismatches,
                    schema,
                    dataValue
                  )((sm, s, dv) => ({
                    schema: s,
                    value: dv,
                    showMismatches: sm,
                  }))
                  return MapSignal(display, d =>
                    JSONSchemaDisplay({
                      schema: d.schema,
                      value: d.value,
                      showMismatches: d.showMismatches,
                    })
                  )
                },
                () =>
                  html.div(
                    attr.class('text-red-600 dark:text-red-400'),
                    'Invalid JSON: ',
                    dataError.map(String)
                  )
              ),
            () =>
              html.div(
                attr.class('text-neutral-500 dark:text-neutral-400'),
                'Loading schema...'
              )
          ),
        }),
        // Schema panel
        ScrollablePanel(
          {
            header: html.h3(attr.class('text-lg font-semibold'), 'Schema'),
            body: html.pre(
              attr.class('whitespace-pre-wrap text-sm font-mono'),
              schema.map(s => (s != null ? JSON.stringify(s, null, 2) : ''))
            ),
          },
          style.height('40%')
        )
      )
    ),
  })
}
