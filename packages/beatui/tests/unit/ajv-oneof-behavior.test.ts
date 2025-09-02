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

describe('AJV oneOf behavior with $ref', () => {
  it('should handle oneOf with inline schemas (baseline)', async () => {
    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        shape: {
          oneOf: [
            {
              type: 'object',
              properties: {
                type: { const: 'circle' },
                radius: { type: 'number', minimum: 0 },
              },
              required: ['type', 'radius'],
              additionalProperties: false,
            },
            {
              type: 'object',
              properties: {
                type: { const: 'square' },
                size: { type: 'number', minimum: 0 },
              },
              required: ['type', 'size'],
              additionalProperties: false,
            },
          ],
        },
      },
    }

    const result = await getAjvForSchema(schema)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { validate } = result.value

    // Should match exactly one branch
    expect(validate({ shape: { type: 'circle', radius: 5 } })).toBe(true)
    expect(validate({ shape: { type: 'square', size: 10 } })).toBe(true)

    // Should not match multiple branches or no branches
    expect(validate({ shape: { type: 'circle', size: 10 } })).toBe(false)
    expect(validate({ shape: { type: 'square', radius: 5 } })).toBe(false)
    expect(validate({ shape: { type: 'triangle' } })).toBe(false)
    expect(validate({ shape: {} })).toBe(false)
  })

  it('should handle oneOf with $ref to external schemas', async () => {
    const circleSchema: SchemaObject = {
      $id: 'https://example.com/circle',
      type: 'object',
      properties: {
        type: { const: 'circle' },
        radius: { type: 'number', minimum: 0 },
      },
      required: ['type', 'radius'],
      additionalProperties: false,
    }

    const squareSchema: SchemaObject = {
      $id: 'https://example.com/square',
      type: 'object',
      properties: {
        type: { const: 'square' },
        size: { type: 'number', minimum: 0 },
      },
      required: ['type', 'size'],
      additionalProperties: false,
    }

    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        shape: {
          oneOf: [
            { $ref: 'https://example.com/circle' },
            { $ref: 'https://example.com/square' },
          ],
        },
      },
    }

    const result = await getAjvForSchema(schema, {
      externalSchemas: [circleSchema, squareSchema],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { validate } = result.value

    // Should behave identically to inline version
    expect(validate({ shape: { type: 'circle', radius: 5 } })).toBe(true)
    expect(validate({ shape: { type: 'square', size: 10 } })).toBe(true)
    expect(validate({ shape: { type: 'circle', size: 10 } })).toBe(false)
    expect(validate({ shape: { type: 'square', radius: 5 } })).toBe(false)
  })

  it('should handle oneOf with mixed inline and $ref schemas', async () => {
    const circleSchema: SchemaObject = {
      $id: 'https://example.com/circle',
      type: 'object',
      properties: {
        type: { const: 'circle' },
        radius: { type: 'number', minimum: 0 },
      },
      required: ['type', 'radius'],
      additionalProperties: false,
    }

    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        shape: {
          oneOf: [
            { $ref: 'https://example.com/circle' },
            {
              type: 'object',
              properties: {
                type: { const: 'square' },
                size: { type: 'number', minimum: 0 },
              },
              required: ['type', 'size'],
              additionalProperties: false,
            },
            {
              type: 'object',
              properties: {
                type: { const: 'triangle' },
                base: { type: 'number', minimum: 0 },
                height: { type: 'number', minimum: 0 },
              },
              required: ['type', 'base', 'height'],
              additionalProperties: false,
            },
          ],
        },
      },
    }

    const result = await getAjvForSchema(schema, {
      externalSchemas: [circleSchema],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { validate } = result.value

    expect(validate({ shape: { type: 'circle', radius: 5 } })).toBe(true)
    expect(validate({ shape: { type: 'square', size: 10 } })).toBe(true)
    expect(validate({ shape: { type: 'triangle', base: 3, height: 4 } })).toBe(
      true
    )

    // Should not match multiple or no branches
    expect(validate({ shape: { type: 'circle', size: 10 } })).toBe(false)
    expect(validate({ shape: { type: 'hexagon' } })).toBe(false)
  })

  it('should handle nested oneOf with $ref', async () => {
    const paymentMethod: SchemaObject = {
      $id: 'https://example.com/payment-method',
      oneOf: [
        {
          type: 'object',
          properties: {
            type: { const: 'credit_card' },
            number: { type: 'string', pattern: '^[0-9]{16}$' },
          },
          required: ['type', 'number'],
          additionalProperties: false,
        },
        {
          type: 'object',
          properties: {
            type: { const: 'paypal' },
            email: { type: 'string', format: 'email' },
          },
          required: ['type', 'email'],
          additionalProperties: false,
        },
      ],
    }

    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            payment: { $ref: 'https://example.com/payment-method' },
          },
          required: ['id', 'payment'],
        },
      },
    }

    const result = await getAjvForSchema(schema, {
      externalSchemas: [paymentMethod],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { validate } = result.value

    expect(
      validate({
        order: {
          id: 'order-123',
          payment: { type: 'credit_card', number: '1234567890123456' },
        },
      })
    ).toBe(true)

    expect(
      validate({
        order: {
          id: 'order-123',
          payment: { type: 'paypal', email: 'user@example.com' },
        },
      })
    ).toBe(true)

    // Should not match invalid payment methods
    expect(
      validate({
        order: {
          id: 'order-123',
          payment: { type: 'credit_card', email: 'user@example.com' },
        },
      })
    ).toBe(false)

    expect(
      validate({
        order: {
          id: 'order-123',
          payment: { type: 'bitcoin', address: 'abc123' },
        },
      })
    ).toBe(false)
  })

  it('should handle oneOf with discriminator-like patterns', async () => {
    const animalBase: SchemaObject = {
      $id: 'https://example.com/animal-base',
      type: 'object',
      properties: {
        species: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['species', 'name'],
    }

    const dogSchema: SchemaObject = {
      $id: 'https://example.com/dog',
      allOf: [
        { $ref: 'https://example.com/animal-base' },
        {
          type: 'object',
          properties: {
            species: { const: 'dog' },
            breed: { type: 'string' },
          },
          required: ['breed'],
        },
      ],
    }

    const catSchema: SchemaObject = {
      $id: 'https://example.com/cat',
      allOf: [
        { $ref: 'https://example.com/animal-base' },
        {
          type: 'object',
          properties: {
            species: { const: 'cat' },
            indoor: { type: 'boolean' },
          },
          required: ['indoor'],
        },
      ],
    }

    const schema: SchemaObject = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        pet: {
          oneOf: [
            { $ref: 'https://example.com/dog' },
            { $ref: 'https://example.com/cat' },
          ],
        },
      },
    }

    const result = await getAjvForSchema(schema, {
      externalSchemas: [animalBase, dogSchema, catSchema],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { validate } = result.value

    expect(
      validate({
        pet: { species: 'dog', name: 'Buddy', breed: 'Golden Retriever' },
      })
    ).toBe(true)

    expect(
      validate({
        pet: { species: 'cat', name: 'Whiskers', indoor: true },
      })
    ).toBe(true)

    // Should not match wrong discriminator
    expect(
      validate({
        pet: { species: 'dog', name: 'Buddy', indoor: true },
      })
    ).toBe(false)

    expect(
      validate({
        pet: { species: 'cat', name: 'Whiskers', breed: 'Persian' },
      })
    ).toBe(false)
  })
})
