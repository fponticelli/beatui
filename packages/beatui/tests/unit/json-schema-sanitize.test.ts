import { describe, it, expect } from 'vitest'
import type { SchemaObject } from 'ajv'
import { JSONSchemaForm } from '../../src/components/json-schema'
import { prop, render } from '@tempots/dom'
import { WithProviders } from '../helpers/test-providers'

function nextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

function waitFor(cond: () => boolean, timeoutMs = 500): Promise<void> {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (cond()) return resolve()
      if (Date.now() - start >= timeoutMs) {
        reject(new Error('Timeout waiting for condition'))
        return
      }
      setTimeout(tick, 0)
    }
    tick()
  })
}

describe('JSON Schema sanitization (removeAdditional)', () => {
  it('removes additional properties on objects eagerly when sanitizeAdditional="all"', async () => {
    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { a: { type: 'number' } },
      additionalProperties: false,
    }

    const initial = prop<{ a?: number; extra?: string }>({ a: 1 })
    let ctrl: {
      change: (v: { a?: number; extra?: string }) => void
      get: () => { a?: number; extra?: string }
    } | null = null

    const app = JSONSchemaForm<{ a?: number; extra?: string }>(
      { schema, initialValue: initial, sanitizeAdditional: 'all' },
      ({ controller, Form }) => {
        ctrl = { change: controller.change, get: () => controller.signal.value }
        return Form
      }
    )

    const host = document.createElement('div')
    document.body.appendChild(host)
    render(
      WithProviders(() => app),
      host
    )
    await nextTick()
    await waitFor(() => ctrl != null)

    // Inject an extra property
    ctrl!.change({ a: 2, extra: 'nope' })
    await nextTick()

    expect(ctrl!.get()).toEqual({ a: 2 })
  })

  it('does not truncate arrays; only prunes extra object props', async () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: { name: { type: 'string' } },
            additionalProperties: false,
          },
        },
      },
    }

    const initial = prop<{ items: Array<{ name?: string; extra?: string }> }>({
      items: [],
    })

    let ctrl: {
      change: (v: { items: Array<{ name?: string; extra?: string }> }) => void
      get: () => { items: Array<{ name?: string; extra?: string }> }
    } | null = null

    const app = JSONSchemaForm<{
      items: Array<{ name?: string; extra?: string }>
    }>(
      { schema, initialValue: initial, sanitizeAdditional: 'all' },
      ({ controller, Form }) => {
        ctrl = { change: controller.change, get: () => controller.signal.value }
        return Form
      }
    )

    const host = document.createElement('div')
    document.body.appendChild(host)
    render(
      WithProviders(() => app),
      host
    )
    await nextTick()

    ctrl!.change({ items: [{ name: 'a', extra: 'x' }, { name: 'b' }] })
    await nextTick()

    expect(ctrl!.get().items).toEqual([{ name: 'a' }, { name: 'b' }])
  })

  it('works with unevaluatedProperties=false to prune extras', async () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        obj: {
          type: 'object',
          properties: { known: { type: 'string' } },
          patternProperties: { '^x-': { type: 'string' } },
          unevaluatedProperties: false,
        },
      },
    }

    const initial = prop<{ obj: Record<string, string> }>({ obj: {} })
    let ctrl: {
      change: (v: { obj: Record<string, string> }) => void
      get: () => { obj: Record<string, string> }
    } | null = null

    const app = JSONSchemaForm<{ obj: Record<string, string> }>(
      { schema, initialValue: initial, sanitizeAdditional: 'all' },
      ({ controller, Form }) => {
        ctrl = { change: controller.change, get: () => controller.signal.value }
        return Form
      }
    )

    const host = document.createElement('div')
    document.body.appendChild(host)
    render(
      WithProviders(() => app),
      host
    )
    await nextTick()

    ctrl!.change({ obj: { known: 'k', 'x-keep': 'v', extra: 'drop' } })
    await nextTick()

    expect(ctrl!.get().obj).toEqual({ known: 'k', 'x-keep': 'v' })
  })

  it('does not sanitize when sanitizeAdditional=false', async () => {
    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { a: { type: 'number' } },
      additionalProperties: false,
    }

    const initial = prop<{ a?: number; extra?: string }>({ a: 1 })
    let ctrl: {
      change: (v: { a?: number; extra?: string }) => void
      get: () => { a?: number; extra?: string }
    } | null = null

    const app = JSONSchemaForm<{ a?: number; extra?: string }>(
      { schema, initialValue: initial, sanitizeAdditional: false },
      ({ controller, Form }) => {
        ctrl = { change: controller.change, get: () => controller.signal.value }
        return Form
      }
    )

    const host = document.createElement('div')
    document.body.appendChild(host)
    render(
      WithProviders(() => app),
      host
    )
    await nextTick()

    // Extra should remain since sanitization disabled
    ctrl!.change({ a: 2, extra: 'keep' })
    await nextTick()

    expect(ctrl!.get()).toEqual({ a: 2, extra: 'keep' })
  })

  it("sanitizes only failing additions when sanitizeAdditional='failing'", async () => {
    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { a: { type: 'number' } },
      additionalProperties: false,
    }

    const initial = prop<{ a?: number; extra?: string }>({ a: 1 })
    let ctrl: {
      change: (v: { a?: number; extra?: string }) => void
      get: () => { a?: number; extra?: string }
    } | null = null

    const app = JSONSchemaForm<{ a?: number; extra?: string }>(
      { schema, initialValue: initial, sanitizeAdditional: 'failing' },
      ({ controller, Form }) => {
        ctrl = { change: controller.change, get: () => controller.signal.value }
        return Form
      }
    )

    const host = document.createElement('div')
    document.body.appendChild(host)
    render(
      WithProviders(() => app),
      host
    )
    await nextTick()

    ctrl!.change({ a: 3, extra: 'nope' })
    await nextTick()

    // extra should be pruned because it makes validation fail
    expect(ctrl!.get()).toEqual({ a: 3 })
  })

  it('sanitizes additional properties with $ref schemas', async () => {
    const personSchema: SchemaObject = {
      $id: 'https://example.com/person',
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      additionalProperties: false,
    }

    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        person: { $ref: 'https://example.com/person' },
      },
    }

    const initial = prop<{
      person: { name?: string; age?: number; extra?: string }
    }>({
      person: { name: 'John', age: 30 },
    })

    let ctrl: {
      change: (v: {
        person: { name?: string; age?: number; extra?: string }
      }) => void
      get: () => { person: { name?: string; age?: number; extra?: string } }
    } | null = null

    const app = JSONSchemaForm<{
      person: { name?: string; age?: number; extra?: string }
    }>(
      {
        schema,
        initialValue: initial,
        sanitizeAdditional: 'all',
        externalSchemas: [personSchema],
      },
      ({ controller, Form }) => {
        ctrl = { change: controller.change, get: () => controller.signal.value }
        return Form
      }
    )

    const host = document.createElement('div')
    document.body.appendChild(host)
    render(
      WithProviders(() => app),
      host
    )
    await nextTick()

    // Add extra property that should be sanitized
    ctrl!.change({
      person: { name: 'John', age: 30, extra: 'should be removed' },
    })
    await nextTick()

    // extra should be pruned from the referenced schema
    expect(ctrl!.get()).toEqual({ person: { name: 'John', age: 30 } })
  })

  it('sanitizes with nested $ref schemas', async () => {
    const addressSchema: SchemaObject = {
      $id: 'https://example.com/address',
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
      },
      additionalProperties: false,
    }

    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: { $ref: 'https://example.com/address' },
          },
        },
      },
    }

    const initial = prop<{
      user: {
        name?: string
        address?: { street?: string; city?: string; extra?: string }
      }
    }>({
      user: {
        name: 'John',
        address: { street: '123 Main St', city: 'Anytown' },
      },
    })

    let ctrl: {
      change: (v: {
        user: {
          name?: string
          address?: { street?: string; city?: string; extra?: string }
        }
      }) => void
      get: () => {
        user: {
          name?: string
          address?: { street?: string; city?: string; extra?: string }
        }
      }
    } | null = null

    const app = JSONSchemaForm<{
      user: {
        name?: string
        address?: { street?: string; city?: string; extra?: string }
      }
    }>(
      {
        schema,
        initialValue: initial,
        sanitizeAdditional: 'all',
        externalSchemas: [addressSchema],
      },
      ({ controller, Form }) => {
        ctrl = { change: controller.change, get: () => controller.signal.value }
        return Form
      }
    )

    const host = document.createElement('div')
    document.body.appendChild(host)
    render(
      WithProviders(() => app),
      host
    )
    await nextTick()

    // Add extra property to nested $ref schema that should be sanitized
    ctrl!.change({
      user: {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          extra: 'should be removed',
        },
      },
    })
    await nextTick()

    // extra should be pruned from the nested $ref schema
    expect(ctrl!.get()).toEqual({
      user: {
        name: 'John',
        address: { street: '123 Main St', city: 'Anytown' },
      },
    })
  })
})
