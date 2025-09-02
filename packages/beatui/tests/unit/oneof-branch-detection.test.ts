import { describe, it, expect, beforeEach } from 'vitest'
import type { SchemaObject } from 'ajv'
import { SchemaContext } from '../../src/components/json-schema/schema-context'
import {
  detectOneOfBranch,
  autoSelectOneOfBranch,
  getOneOfBranchLabel,
} from '../../src/components/json-schema/oneof-branch-detection'
import {
  getAjvForSchema,
  clearCaches,
} from '../../src/components/json-schema/ajv-utils'
import { clearRefCaches } from '../../src/components/json-schema/ref-utils'

beforeEach(() => {
  clearCaches()
  clearRefCaches()
})

describe('oneOf branch detection with $ref', () => {
  it('should detect correct branch with inline schemas', async () => {
    const schema: SchemaObject = {
      oneOf: [
        {
          type: 'object',
          properties: { type: { const: 'circle' }, radius: { type: 'number' } },
          required: ['type', 'radius'],
        },
        {
          type: 'object',
          properties: { type: { const: 'square' }, size: { type: 'number' } },
          required: ['type', 'size'],
        },
      ],
    }

    const ctx = new SchemaContext({
      schema,
      definition: schema,
      horizontal: false,
      path: [],
    })

    const ajvResult = await getAjvForSchema(schema)
    expect(ajvResult.ok).toBe(true)
    if (!ajvResult.ok) return

    const { ajv } = ajvResult.value

    // Test circle value
    const circleValue = { type: 'circle', radius: 5 }
    const circleResult = detectOneOfBranch(ctx, circleValue, ajv)
    expect(circleResult.matchingBranch).toBe(0)
    expect(circleResult.validBranches).toEqual([0])
    expect(circleResult.isAmbiguous).toBe(false)
    expect(circleResult.hasNoMatch).toBe(false)

    // Test square value
    const squareValue = { type: 'square', size: 10 }
    const squareResult = detectOneOfBranch(ctx, squareValue, ajv)
    expect(squareResult.matchingBranch).toBe(1)
    expect(squareResult.validBranches).toEqual([1])
    expect(squareResult.isAmbiguous).toBe(false)
    expect(squareResult.hasNoMatch).toBe(false)

    // Test invalid value
    const invalidValue = { type: 'triangle' }
    const invalidResult = detectOneOfBranch(ctx, invalidValue, ajv)
    expect(invalidResult.matchingBranch).toBe(-1)
    expect(invalidResult.validBranches).toEqual([])
    expect(invalidResult.isAmbiguous).toBe(false)
    expect(invalidResult.hasNoMatch).toBe(true)
  })

  it('should detect correct branch with $ref schemas', async () => {
    const circleSchema: SchemaObject = {
      $id: 'https://example.com/circle',
      type: 'object',
      properties: { type: { const: 'circle' }, radius: { type: 'number' } },
      required: ['type', 'radius'],
    }

    const squareSchema: SchemaObject = {
      $id: 'https://example.com/square',
      type: 'object',
      properties: { type: { const: 'square' }, size: { type: 'number' } },
      required: ['type', 'size'],
    }

    const schema: SchemaObject = {
      oneOf: [
        { $ref: 'https://example.com/circle' },
        { $ref: 'https://example.com/square' },
      ],
    }

    const ctx = new SchemaContext({
      schema,
      definition: schema,
      horizontal: false,
      path: [],
    })

    const ajvResult = await getAjvForSchema(schema, {
      externalSchemas: [circleSchema, squareSchema],
    })
    expect(ajvResult.ok).toBe(true)
    if (!ajvResult.ok) return

    const { ajv } = ajvResult.value

    // Test circle value - should match first branch ($ref to circle)
    const circleValue = { type: 'circle', radius: 5 }
    const circleResult = detectOneOfBranch(ctx, circleValue, ajv)
    expect(circleResult.matchingBranch).toBe(0)
    expect(circleResult.validBranches).toEqual([0])
    expect(circleResult.isAmbiguous).toBe(false)

    // Test square value - should match second branch ($ref to square)
    const squareValue = { type: 'square', size: 10 }
    const squareResult = detectOneOfBranch(ctx, squareValue, ajv)
    expect(squareResult.matchingBranch).toBe(1)
    expect(squareResult.validBranches).toEqual([1])
    expect(squareResult.isAmbiguous).toBe(false)
  })

  it('should handle mixed inline and $ref schemas', async () => {
    const circleSchema: SchemaObject = {
      $id: 'https://example.com/circle',
      type: 'object',
      properties: { type: { const: 'circle' }, radius: { type: 'number' } },
      required: ['type', 'radius'],
    }

    const schema: SchemaObject = {
      oneOf: [
        { $ref: 'https://example.com/circle' },
        {
          type: 'object',
          properties: { type: { const: 'square' }, size: { type: 'number' } },
          required: ['type', 'size'],
        },
      ],
    }

    const ctx = new SchemaContext({
      schema,
      definition: schema,
      horizontal: false,
      path: [],
    })

    const ajvResult = await getAjvForSchema(schema, {
      externalSchemas: [circleSchema],
    })
    expect(ajvResult.ok).toBe(true)
    if (!ajvResult.ok) return

    const { ajv } = ajvResult.value

    // Test values against mixed branches
    const circleValue = { type: 'circle', radius: 5 }
    const circleResult = detectOneOfBranch(ctx, circleValue, ajv)
    expect(circleResult.matchingBranch).toBe(0) // $ref branch

    const squareValue = { type: 'square', size: 10 }
    const squareResult = detectOneOfBranch(ctx, squareValue, ajv)
    expect(squareResult.matchingBranch).toBe(1) // inline branch
  })

  it('should handle ambiguous matches (multiple valid branches)', async () => {
    const schema: SchemaObject = {
      oneOf: [
        { type: 'object', properties: { name: { type: 'string' } } },
        { type: 'object', properties: { age: { type: 'number' } } },
      ],
    }

    const ctx = new SchemaContext({
      schema,
      definition: schema,
      horizontal: false,
      path: [],
    })

    const ajvResult = await getAjvForSchema(schema)
    expect(ajvResult.ok).toBe(true)
    if (!ajvResult.ok) return

    const { ajv } = ajvResult.value

    // Value that matches both branches (empty object)
    const ambiguousValue = {}
    const result = detectOneOfBranch(ctx, ambiguousValue, ajv)
    expect(result.matchingBranch).toBe(-1)
    expect(result.validBranches).toEqual([0, 1])
    expect(result.isAmbiguous).toBe(true)
    expect(result.hasNoMatch).toBe(false)
  })

  it('should work without AJV (heuristic mode)', () => {
    const schema: SchemaObject = {
      oneOf: [
        {
          type: 'object',
          properties: { type: { const: 'circle' } },
        },
        {
          type: 'object',
          properties: { type: { const: 'square' } },
        },
      ],
    }

    const ctx = new SchemaContext({
      schema,
      definition: schema,
      horizontal: false,
      path: [],
    })

    // Test without AJV
    const circleValue = { type: 'circle', radius: 5 }
    const result = detectOneOfBranch(ctx, circleValue) // No AJV passed
    expect(result.matchingBranch).toBe(0)
    expect(result.validBranches).toEqual([0])
  })

  it('should generate appropriate branch labels', () => {
    // Test with title
    expect(getOneOfBranchLabel({ title: 'Circle Shape' }, 0)).toBe(
      'Circle Shape'
    )

    // Test with discriminator const
    expect(
      getOneOfBranchLabel(
        {
          properties: { type: { const: 'circle' } },
        },
        0
      )
    ).toBe('type: circle')

    // Test with const value
    expect(getOneOfBranchLabel({ const: 'active' }, 0)).toBe('active')

    // Test with type
    expect(getOneOfBranchLabel({ type: 'string' }, 0)).toBe('string')

    // Test with multiple types
    expect(getOneOfBranchLabel({ type: ['string', 'number'] }, 0)).toBe(
      'string | number'
    )

    // Test fallback
    expect(getOneOfBranchLabel({}, 2)).toBe('Option 3')

    // Test boolean schemas
    expect(getOneOfBranchLabel(true, 0)).toBe('Any Value')
    expect(getOneOfBranchLabel(false, 0)).toBe('No Value')
  })

  it('should auto-select appropriate branch', async () => {
    const schema: SchemaObject = {
      oneOf: [
        {
          type: 'object',
          properties: { type: { const: 'circle' }, radius: { type: 'number' } },
          required: ['type', 'radius'],
        },
        {
          type: 'object',
          properties: { type: { const: 'square' }, size: { type: 'number' } },
          required: ['type', 'size'],
        },
      ],
    }

    const ctx = new SchemaContext({
      schema,
      definition: schema,
      horizontal: false,
      path: [],
    })

    const ajvResult = await getAjvForSchema(schema)
    expect(ajvResult.ok).toBe(true)
    if (!ajvResult.ok) return

    const { ajv } = ajvResult.value

    // Should auto-select matching branch
    expect(autoSelectOneOfBranch(ctx, { type: 'circle', radius: 5 }, ajv)).toBe(
      0
    )
    expect(autoSelectOneOfBranch(ctx, { type: 'square', size: 10 }, ajv)).toBe(
      1
    )

    // Should return -1 for ambiguous or no match
    expect(autoSelectOneOfBranch(ctx, {}, ajv)).toBe(-1)
    expect(autoSelectOneOfBranch(ctx, { type: 'triangle' }, ajv)).toBe(-1)
  })
})
