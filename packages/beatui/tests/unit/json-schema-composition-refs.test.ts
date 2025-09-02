import { describe, it, expect, beforeEach } from 'vitest'
import type { SchemaObject } from 'ajv'
import {
  getAjvForSchema,
  clearCaches,
} from '../../src/components/json-schema/ajv-utils'
import { clearRefCaches } from '../../src/components/json-schema/ref-utils'

beforeEach(() => {
  clearCaches()
  clearRefCaches()
})

describe('Validate allOf/oneOf across referenced schemas', () => {
  it('allOf with externalSchemas: requires fields from both referenced schemas', async () => {
    const PersonBase: SchemaObject = {
      $id: 'https://example.com/schemas/person-base.json',
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
      },
      required: ['name'],
    }
    const PersonContact: SchemaObject = {
      $id: 'https://example.com/schemas/person-contact.json',
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
      required: ['email'],
    }

    const Root: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        person: {
          type: 'object',
          allOf: [
            { $ref: `${PersonBase.$id}#` },
            { $ref: `${PersonContact.$id}#` },
          ],
          // Allow union of evaluated properties across allOf
          unevaluatedProperties: false,
        },
      },
      required: ['person'],
      additionalProperties: false,
    }

    const res = await getAjvForSchema(Root, {
      externalSchemas: [PersonBase, PersonContact],
    })
    if (!res.ok) throw new Error(res.error)

    expect(
      res.value.validate({ person: { name: 'Ada', email: 'ada@ex.com' } })
    ).toBe(true)
    expect(res.value.validate({ person: { name: 'Ada' } })).toBe(false)
    expect(res.value.validate({ person: { email: 'ada@ex.com' } })).toBe(false)
  })

  it('oneOf with externalSchemas: validates mutually exclusive variants', async () => {
    const Circle: SchemaObject = {
      $id: 'https://example.com/schemas/circle.json',
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        kind: { const: 'circle' },
        radius: { type: 'number', exclusiveMinimum: 0 },
      },
      required: ['kind', 'radius'],
      additionalProperties: false,
    }
    const Square: SchemaObject = {
      $id: 'https://example.com/schemas/square.json',
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        kind: { const: 'square' },
        size: { type: 'number', exclusiveMinimum: 0 },
      },
      required: ['kind', 'size'],
      additionalProperties: false,
    }

    const Root: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        shape: {
          oneOf: [{ $ref: `${Circle.$id}#` }, { $ref: `${Square.$id}#` }],
        },
      },
      required: ['shape'],
      additionalProperties: false,
    }

    const res = await getAjvForSchema(Root, {
      externalSchemas: [Circle, Square],
    })
    if (!res.ok) throw new Error(res.error)

    expect(res.value.validate({ shape: { kind: 'circle', radius: 2 } })).toBe(
      true
    )
    expect(res.value.validate({ shape: { kind: 'square', size: 3 } })).toBe(
      true
    )
    expect(res.value.validate({ shape: { size: 3 } })).toBe(false)
    expect(res.value.validate({ shape: { kind: 'circle', size: 3 } })).toBe(
      false
    )
  })

  it('allOf with refResolver: resolves external schemas transitively', async () => {
    const Address: SchemaObject = {
      $id: 'https://example.com/schemas/address.json',
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        street: { type: 'string' },
      },
      required: ['street'],
    }
    const Company: SchemaObject = {
      $id: 'https://example.com/schemas/company.json',
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
      },
      required: ['name'],
    }

    const Root: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        office: {
          type: 'object',
          allOf: [{ $ref: `${Address.$id}#` }, { $ref: `${Company.$id}#` }],
          unevaluatedProperties: false,
        },
      },
      required: ['office'],
    }

    const resolver = async (
      ids: ReadonlyArray<string>
    ): Promise<ReadonlyArray<SchemaObject>> => {
      const byId: Record<string, SchemaObject> = {
        [Address.$id!]: Address,
        [Company.$id!]: Company,
      }
      return ids.map(id => byId[id]).filter(Boolean)
    }

    const res = await getAjvForSchema(Root, { refResolver: resolver })
    if (!res.ok) throw new Error(res.error)

    expect(res.value.validate({ office: { street: 'a', name: 'Acme' } })).toBe(
      true
    )
    expect(res.value.validate({ office: { name: 'Acme' } })).toBe(false)
  })
})
