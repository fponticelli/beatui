import {
  attr,
  html,
  prop,
  style,
  Ensure,
  Computed,
  MapSignal,
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
import { JSONStructureForm } from '@tempots/beatui/json-structure'
import { MonacoEditorInput } from '@tempots/beatui/monaco'
import { Validation } from '@tempots/std'
import type { ControllerValidation } from '@tempots/beatui'

const sampleNames = ['sample', 'contact-form', 'user-profile']

// Edit the JSON Structure schema (via Monaco) and see the form update live
export default function JSONStructureFormPage() {
  const selectedSample = prop(sampleNames[0])
  const sample = selectedSample.mapAsync<{
    schema: object | null
    data: unknown
  }>(
    async name => {
      const files = await Promise.all([
        import(`./json-structure-samples/${name}-schema.ts`).then(m => m.default),
        import(`./json-structure-samples/${name}-data.ts`).then(m => m.default),
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

  // Track form validation status
  const validation = prop<ControllerValidation>(Validation.valid)

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

      // Left: JSON Structure editor (Monaco)
      ScrollablePanel(
        {
          header: html.div(
            html.h3(
              attr.class('text-lg font-semibold'),
              'Edit JSON Structure Schema (JSON)'
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
            schema =>
              MapSignal(schema, schema => {
                return JSONStructureForm(
                  {
                    schema,
                    initialValue: data,
                  },
                  ({ Form, controller }) => {
                    controller.signal.feedProp(data)
                    // Feed validation status to the page-level signal
                    controller.status.feedProp(validation)
                    return Form
                  }
                )
              }),
            () =>
              html.div(
                attr.class('text-red-600'),
                'Invalid JSON: ',
                schemaError.map(String)
              )
          ),
          // Validation errors panel (only when there are errors)
          footer: Ensure(
            validation.map(v => (v.type === 'invalid' ? v.error : null)),
            error => {
              const errors = error.map(flattenErrors)
              return ScrollablePanel(
                {
                  header: html.h3(
                    attr.class('text-lg font-semibold bg-red-100'),
                    'Validation Errors'
                  ),
                  body: html.ul(
                    attr.class('list-disc pl-5 text-sm space-y-1'),
                    ForEach(errors, error =>
                      html.li(
                        html.span(attr.class('text-red-700'), error.$.message),
                        html.code(
                          attr.class('ml-2 opacity-70'),
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
              html.h3(attr.class('text-base font-semibold'), 'Form Data'),
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
            body: html.pre(
              attr.class('whitespace-pre-wrap text-sm'),
              data.map(v => JSON.stringify(v, null, 2))
            ),
          },
          style.height('50%')
        )
      )
    ),
  })
}
