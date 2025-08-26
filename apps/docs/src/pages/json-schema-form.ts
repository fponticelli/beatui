import {
  attr,
  html,
  prop,
  style,
  Ensure,
  Computed,
  MapSignal,
} from '@tempots/dom'
import { ScrollablePanel, Stack, Group } from '@tempots/beatui'
import { JSONSchemaForm } from '@tempots/beatui/json-schema'
import { MonacoEditorInput } from '@tempots/beatui/monaco'

// Edit the JSON Schema (via Monaco) and see the form update live
export function JSONSchemaFormPage() {
  // Initial schema sample with $defs and $ref usage
  const schemaObject = {
    type: 'object',
    $defs: {
      address_def: {
        type: 'object',
        title: 'Address',
        properties: {
          street: { type: 'string', title: 'Street' },
          city: { type: 'string', title: 'City' },
        },
        required: ['street', 'city'],
        additionalProperties: false,
      },
    },
    properties: {
      name: { type: 'string', title: 'Name', description: 'Your full name' },
      email: {
        type: 'string',
        title: 'Email',
        format: 'email',
        description: 'Your email address',
      },
      birthdate: {
        type: 'string',
        format: 'date',
        description: 'Your birthdate',
      },
      image: {
        type: 'string',
        title: 'Image',
        format: 'binary',
        description: 'Your profile image',
        contentMediaType: 'image/*',
      },
      description: {
        type: 'string',
        title: 'Description',
        'ui:widget': 'markdown',
        description: 'A brief description of yourself',
      },
      age: { type: 'integer', title: 'Age', minimum: 18 },
      isActive: { type: 'boolean', title: 'Active' },
      // Use $ref and override a sibling (title) to demonstrate sibling-override merge
      address: { $ref: '#/$defs/address_def', title: 'Home Address' },
      tags: { type: 'array', title: 'Tags', items: { type: 'string' } },
    },
    required: ['name'],
    additionalProperties: false,
  }

  // Initial form value matching the sample schema
  const initial: unknown = {
    name: 'Ada Lovelace',
    age: 28,
    isActive: true,
    address: { street: '12 Analytical St', city: 'London' },
    tags: ['math', 'computing'],
  }

  // Form value (kept when schema changes)
  const current = prop<unknown>(initial)

  // Monaco editor content (JSON string)
  const schemaJson = prop<string>(JSON.stringify(schemaObject, null, 2))

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
          header: html.h3(
            attr.class('bu-text-lg bu-font-semibold'),
            'Edit JSON Schema (JSON)'
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
              MapSignal(schema, schema =>
                JSONSchemaForm<unknown>({
                  schema,
                  initialValue: current,
                  onChange: v => current.set(v),
                })
              ),
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
              current.map(v => JSON.stringify(v, null, 2))
            ),
          },
          style.height('50%')
        )
      )
    ),
  })
}

/*
TODO:
- [ ] tags input
- [ ] const
- [ ] enum input
- [ ] union
- [ ] nullable inputs
- [ ] date input
- [ ] datetime input
- [ ] markdown input
- [ ] grid view
- [ ] basic layout
- [ ] add visual hints for component that cannot be rendered

- [ ] format:
  - [ ] date: full-date according to RFC3339 (opens new window).
  - [ ] time: time (time-zone is mandatory).
  - [ ] date-time: date-time (time-zone is mandatory).
  - [ ] iso-time: time with optional time-zone.
  - [ ] iso-date-time: date-time with optional time-zone.
  - [ ] duration: duration from RFC3339(opens new window)
  - [ ] uri: full URI.
  - [ ] uri-reference: URI reference, including full and relative URIs.
  - [ ] uri-template: URI template according to RFC6570(opens new window)
  - [ ] url (deprecated): URL record (opens new window).
  - [x] email: email address.
  - [ ] hostname: host name according to RFC1034 (opens new window).
  - [ ] ipv4: IP address v4.
  - [ ] ipv6: IP address v6.
  - [ ] regex: tests whether a string is a valid regular expression by passing it to RegExp constructor.
  - [ ] uuid: Universally Unique IDentifier according to RFC4122 (opens new window).
  - [ ] json-pointer: JSON-pointer according to RFC6901 (opens new window).
  - [ ] relative-json-pointer: relative JSON-pointer according to this draft (opens new window).
  - [ ] byte: base64 encoded data according to the openApi 3.0.0 specification(opens new window)
  - [ ] int32: signed 32 bits integer according to the openApi 3.0.0 specification(opens new window)
  - [ ] int64: signed 64 bits according to the openApi 3.0.0 specification(opens new window)
  - [ ] float: float according to the openApi 3.0.0 specification(opens new window)
  - [ ] double: double according to the openApi 3.0.0 specification(opens new window)
  - [x] password: password string according to the openApi 3.0.0 specification(opens new window)
  - [ ] binary: binary string according to the openApi 3.0.0 specification
*/
