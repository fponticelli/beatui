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

describe('AJV allOf behavior with $ref', () => {
  it('should handle allOf with inline schemas (baseline)', async () => {
    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        person: {
          allOf: [
            {
              type: 'object',
              properties: { name: { type: 'string' } },
              required: ['name'],
            },
            {
              type: 'object',
              properties: { email: { type: 'string', format: 'email' } },
              required: ['email'],
            },
          ],
        },
      },
    }

    const result = await getAjvForSchema(schema)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { validate } = result.value

    // Should require both name and email
    expect(
      validate({ person: { name: 'John', email: 'john@example.com' } })
    ).toBe(true)
    expect(validate({ person: { name: 'John' } })).toBe(false)
    expect(validate({ person: { email: 'john@example.com' } })).toBe(false)
    expect(validate({ person: {} })).toBe(false)
  })

  it('should handle allOf with $ref to external schemas', async () => {
    const personBase: SchemaObject = {
      $id: 'https://example.com/person-base',
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    }

    const personContact: SchemaObject = {
      $id: 'https://example.com/person-contact',
      type: 'object',
      properties: { email: { type: 'string', format: 'email' } },
      required: ['email'],
    }

    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        person: {
          allOf: [
            { $ref: 'https://example.com/person-base' },
            { $ref: 'https://example.com/person-contact' },
          ],
        },
      },
    }

    const result = await getAjvForSchema(schema, {
      externalSchemas: [personBase, personContact],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { validate } = result.value

    // Should behave identically to inline version
    expect(
      validate({ person: { name: 'John', email: 'john@example.com' } })
    ).toBe(true)
    expect(validate({ person: { name: 'John' } })).toBe(false)
    expect(validate({ person: { email: 'john@example.com' } })).toBe(false)
    expect(validate({ person: {} })).toBe(false)
  })

  it('should handle allOf with mixed inline and $ref schemas', async () => {
    const personBase: SchemaObject = {
      $id: 'https://example.com/person-base',
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    }

    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        person: {
          allOf: [
            { $ref: 'https://example.com/person-base' },
            {
              type: 'object',
              properties: { email: { type: 'string', format: 'email' } },
              required: ['email'],
            },
            {
              type: 'object',
              properties: { age: { type: 'number', minimum: 0 } },
            },
          ],
        },
      },
    }

    const result = await getAjvForSchema(schema, {
      externalSchemas: [personBase],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { validate } = result.value

    // Should require name and email, age is optional
    expect(
      validate({
        person: { name: 'John', email: 'john@example.com', age: 30 },
      })
    ).toBe(true)
    expect(
      validate({
        person: { name: 'John', email: 'john@example.com' },
      })
    ).toBe(true)
    expect(validate({ person: { name: 'John' } })).toBe(false)
    expect(validate({ person: { email: 'john@example.com' } })).toBe(false)
  })

  it('should handle nested allOf with $ref', async () => {
    const address: SchemaObject = {
      $id: 'https://example.com/address',
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
      },
      required: ['street', 'city'],
    }

    const contact: SchemaObject = {
      $id: 'https://example.com/contact',
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
      },
      required: ['email'],
    }

    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        company: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            details: {
              allOf: [
                { $ref: 'https://example.com/address' },
                { $ref: 'https://example.com/contact' },
              ],
            },
          },
          required: ['name', 'details'],
        },
      },
    }

    const result = await getAjvForSchema(schema, {
      externalSchemas: [address, contact],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { validate } = result.value

    const validData = {
      company: {
        name: 'Acme Corp',
        details: {
          street: '123 Main St',
          city: 'Anytown',
          email: 'info@acme.com',
          phone: '555-1234',
        },
      },
    }

    expect(validate(validData)).toBe(true)

    // Missing required fields from address
    expect(
      validate({
        company: {
          name: 'Acme Corp',
          details: {
            street: '123 Main St',
            email: 'info@acme.com',
          },
        },
      })
    ).toBe(false)

    // Missing required fields from contact
    expect(
      validate({
        company: {
          name: 'Acme Corp',
          details: {
            street: '123 Main St',
            city: 'Anytown',
            phone: '555-1234',
          },
        },
      })
    ).toBe(false)
  })

  it('should handle allOf with conflicting constraints across $ref', async () => {
    const stringConstraints: SchemaObject = {
      $id: 'https://example.com/string-min',
      type: 'object',
      properties: {
        value: { type: 'string', minLength: 5 },
      },
    }

    const stringConstraints2: SchemaObject = {
      $id: 'https://example.com/string-max',
      type: 'object',
      properties: {
        value: { type: 'string', maxLength: 10 },
      },
    }

    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        data: {
          allOf: [
            { $ref: 'https://example.com/string-min' },
            { $ref: 'https://example.com/string-max' },
          ],
        },
      },
    }

    const result = await getAjvForSchema(schema, {
      externalSchemas: [stringConstraints, stringConstraints2],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { validate } = result.value

    // Should satisfy both constraints: minLength 5 AND maxLength 10
    expect(validate({ data: { value: 'hello' } })).toBe(true) // length 5
    expect(validate({ data: { value: 'hello world' } })).toBe(false) // length 11 > 10
    expect(validate({ data: { value: 'hi' } })).toBe(false) // length 2 < 5
    expect(validate({ data: { value: 'perfect' } })).toBe(true) // length 7
  })
})
