import {
  attr,
  html,
  prop,
  style,
  Ensure,
  Computed,
  MapSignal,
  computedOf,
  ForEach,
} from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Group,
  NativeSelect,
  Option,
  Button,
} from '@tempots/beatui'
import { JSONSchemaForm } from '@tempots/beatui/json-schema'
import { MonacoEditorInput } from '@tempots/beatui/monaco'
import { Validation } from '@tempots/std'
import type { ControllerValidation } from '@tempots/beatui'

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
  'allof-conflicts-demo',
  'not-violations-demo',
  'optionality-nullability-demo',
  'prefix-items',
  'annotations',
  'draft-2019',
  'draft-2020',
  'draft-07',
]

// Edit the JSON Schema (via Monaco) and see the form update live
export default function JSONSchemaFormPage() {
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

  // Track form validation status (AJV-mapped)
  const validation = prop<ControllerValidation>(Validation.valid)

  // Sanitization mode for additional properties in the form
  const sanitizeMode = prop<'all' | 'failing' | 'off'>('all')
  const sanitizeAdditional = sanitizeMode.map(mode =>
    mode === 'off' ? (false as const) : mode
  )

  // Helpers to render error list
  const pathToString = (segments: Array<string | number>): string =>
    segments.reduce((acc: string, seg) => {
      return typeof seg === 'number'
        ? `${acc}[${seg}]`
        : (acc as string).length === 0
          ? String(seg)
          : `${acc}.${String(seg)}`
    }, '')

  const flattenErrors = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err: { message?: string; dependencies?: Record<string | number, any> },
    base: Array<string | number> = []
  ): Array<{ path: string; message: string }> => {
    const out: Array<{ path: string; message: string }> = []
    if (err.message)
      out.push({ path: pathToString(base), message: err.message })
    const deps = err.dependencies ?? {}
    for (const key of Object.keys(deps)) {
      const k: string | number = isNaN(Number(key)) ? key : Number(key)
      out.push(...flattenErrors(deps[key], [...base, k]))
    }
    return out
  }

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
      attr.class('items-start gap-4 p-4 h-full overflow-hidden'),

      // Left: JSON Schema editor (Monaco)
      ScrollablePanel(
        {
          header: html.div(
            html.h3(
              attr.class('text-lg font-semibold'),
              'Edit JSON Schema (JSON)'
            ),
            NativeSelect({
              options: sampleNames.map(name => Option.value(name, name)),
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
        attr.class('gap-2 h-full overflow-hidden'),
        style.width('50%'),
        ScrollablePanel({
          body: Ensure(
            schemaDef,
            schema => {
              const formConfig = computedOf(
                schema,
                sanitizeAdditional
              )((s, sa) => ({ schema: s, sanitizeAdditional: sa }))
              return MapSignal(formConfig, ({ schema, sanitizeAdditional }) =>
                JSONSchemaForm(
                  {
                    schema,
                    initialValue: data,
                    sanitizeAdditional,
                  },
                  ({ Form, controller }) => {
                    controller.signal.feedProp(data)
                    // Feed validation status to the page-level signal
                    controller.status.feedProp(validation)
                    return Form
                  }
                )
              )
            },
            () =>
              html.div(
                attr.class('text-red-600 dark:text-red-400'),
                'Invalid JSON: ',
                schemaError.map(String)
              )
          ),
          // AJV errors panel (only when there are errors)
          footer: Ensure(
            validation.map(v => (v.type === 'invalid' ? v.error : null)),
            error => {
              const errors = error.map(flattenErrors)
              return ScrollablePanel(
                {
                  header: html.h3(
                    attr.class('text-lg font-semibold bg-r-ed100'),
                    'AJV Validation Errors'
                  ),
                  body: html.ul(
                    attr.class('list-disc pl--5 text-sm space-y-1'),
                    ForEach(errors, error =>
                      html.li(
                        html.span(
                          attr.class('text-red-700 dark:text-red-300'),
                          error.$.message
                        ),
                        html.code(
                          attr.class('ml--2 opacity-70'),
                          error.$.path.map(v => `(${v})`)
                        )
                      )
                    )
                  ),
                },
                style.minHeight('10rem'),
                style.maxHeight('10rem')
              )
            }
          ),
        }),
        ScrollablePanel(
          {
            header: Group(
              attr.class('gap-2 items-center justify-between'),
              Group(
                attr.class('gap-2 items-center'),
                html.label(
                  attr.class('text-sm opacity-80'),
                  'Sanitize Additional: '
                ),
                NativeSelect<'all' | 'failing' | 'off'>({
                  options: [
                    Option.value<'all' | 'failing' | 'off'>('all', 'all'),
                    Option.value<'all' | 'failing' | 'off'>(
                      'failing',
                      'failing'
                    ),
                    Option.value<'all' | 'failing' | 'off'>('off', 'off'),
                  ],
                  value: sanitizeMode,
                  onChange: sanitizeMode.set,
                })
              ),
              Button(
                {
                  variant: 'filled',
                  color: 'primary',
                  roundedness: 'md',
                  onClick: () => data.set({}),
                },
                'Reset'
              )
            ),
            body: Group(
              attr.class('gap-2'),
              html.div(
                attr.class('text-xs opacity-80'),
                'Mode: ',
                sanitizeMode.map(String),
                ' — ',
                html.span(
                  attr.class('opacity-80'),
                  'all: prune any extras; failing: prune only when invalid; off: keep extras'
                )
              ),
              html.pre(
                attr.class('whitespace-pre-wrap text-sm'),
                data.map(v => JSON.stringify(v, null, 2))
              )
            ),
          },
          style.height('50%')
        )
      )
    ),
  })
}
