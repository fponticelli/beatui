import { attr, html, prop, style, Value } from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Group,
  NativeSelect,
  SelectOption,
} from '@tempots/beatui'
import { MonacoEditorInput } from '@tempots/beatui/monaco'

const personSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Person',
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer', minimum: 0 },
    isActive: { type: 'boolean' },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
      },
      required: ['street'],
      additionalProperties: false,
    },
  },
  required: ['name', 'age', 'isActive', 'address'],
  additionalProperties: false,
}

const samples = [
  {
    label: 'JSON',
    language: 'json',
    value: `{
  "name": "Ada Lovelace",
  "age": 28,
  "isActive": true,
  "address": {
    "street": "12 Analytical St",
    "city": "London"
  },
  "tags": ["math", "computing"]
}`,
    schema: personSchema,
  },
  {
    label: 'YAML',
    language: 'yaml',
    value: `name: Ada Lovelace
age: 28
isActive: true
address:
  street: 12 Analytical St
  city: London
tags:
  - math
  - computing`,
    schema: personSchema,
  },
  {
    label: 'HTML',
    language: 'html',
    value: `<!DOCTYPE html>
<html>
  <head>
    <title>Monaco Editor</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
  </body>
</html>`,
  },
  {
    label: 'CSS',
    language: 'css',
    value: `body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
}

h1 {
  color: blue;
}`,
  },
  {
    label: 'JavaScript',
    language: 'javascript',
    value: `const hello = 'world'
console.log(hello)`,
  },
  {
    label: 'TypeScript',
    language: 'typescript',
    value: `const hello: string = 'world'
console.log(hello)`,
  },
]

export function MonacoEditorPage() {
  const selectedIndex = prop(0)
  const code = selectedIndex.map(i => samples[i].value).deriveProp()
  const language = selectedIndex.map(i => samples[i].language)

  return ScrollablePanel({
    body: Group(
      attr.class('bu-items-start bu-gap-4 bu-p-4'),
      Stack(
        attr.class('bu-gap-3'),
        style.width('42rem'),
        html.h2(attr.class('bu-text-xl bu-font-semibold'), 'Monaco Editor'),
        MonacoEditorInput({
          value: code,
          onChange: v => code.set(v),
          language,
          jsonSchemas: Value.map(personSchema, s => [
            {
              uri: 'https://example.com/schemas/person.json',
              fileMatch: ['*'],
              schema: s,
            },
          ]),
          yamlSchemas: Value.map(personSchema, s => [
            {
              uri: 'https://example.com/schemas/person.yaml',
              fileMatch: ['*'],
              schema: s,
            },
          ]),
        }),
        NativeSelect({
          options: samples.map((s, i) =>
            SelectOption.value(i, s.label)
          ) as SelectOption<number>[],
          value: selectedIndex,
          onChange: selectedIndex.set,
        })
      ),
      Stack(
        attr.class('bu-gap-2 bu-flex-1'),
        html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Current Value'),
        html.pre(
          attr.class('bu-whitespace-pre-wrap'),
          code.map(v => String(v))
        )
      )
    ),
  })
}
