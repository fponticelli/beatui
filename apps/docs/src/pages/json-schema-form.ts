import { attr, html, prop, style } from '@tempots/dom'
import { ScrollablePanel, Stack, Group } from '@tempots/beatui'
import { JSONSchemaForm } from '@tempots/beatui/json-schema'

// Simple sample demonstrating strings, numbers, booleans, arrays, and nested objects
export function JSONSchemaFormPage() {
  type Example = {
    name: string
    age: number
    isActive: boolean
    address: { street: string; city: string }
    tags: string[]
  }

  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', title: 'Name', description: 'Your full name' },
      age: { type: 'integer', title: 'Age', minimum: 0 },
      isActive: { type: 'boolean', title: 'Active' },
      address: {
        type: 'object',
        title: 'Address',
        properties: {
          street: { type: 'string', title: 'Street' },
          city: { type: 'string', title: 'City' },
        },
        required: ['street', 'city'],
      },
      tags: { type: 'array', title: 'Tags', items: { type: 'string' } },
    },
    required: ['name'],
  }

  const initial: Example = {
    name: 'Ada Lovelace',
    age: 28,
    isActive: true,
    address: { street: '12 Analytical St', city: 'London' },
    tags: ['math', 'computing'],
  }

  const current = prop<Example>(initial)

  return ScrollablePanel({
    body: Group(
      attr.class('bu-items-start bu-gap-4 bu-p-4'),
      Stack(
        attr.class('bu-gap-3'),
        style.width('28rem'),
        html.h2(attr.class('bu-text-xl bu-font-semibold'), 'JSON Schema Form'),
        JSONSchemaForm<Example>({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          schema: schema as any,
          initialValue: initial,
          onChange: v => current.set(v),
        })
      ),
      Stack(
        attr.class('bu-gap-2 bu-flex-1'),
        html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Live Value'),
        html.pre(
          attr.class('bu-whitespace-pre-wrap'),
          current.map(v => JSON.stringify(v, null, 2))
        )
      )
    ),
  })
}
