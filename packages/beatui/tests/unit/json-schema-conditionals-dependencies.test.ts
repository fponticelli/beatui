import { describe, it, expect } from 'vitest'
import Ajv from 'ajv'
import {
  composeEffectiveObjectSchema,
  hasConditionalFeatures,
  JSONSchema,
} from '../../src/components/json-schema/schema-context'

describe('composeEffectiveObjectSchema', () => {
  const ajv = new Ajv()

  it('applies then/else overlays based on `if` condition', () => {
    const base: JSONSchema = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['A', 'B'] },
      },
      required: ['type'],
      if: {
        properties: { type: { const: 'A' } },
        required: ['type'],
      },
      then: {
        properties: { aOnly: { type: 'number' } },
        required: ['aOnly'],
      },
      else: {
        properties: { bOnly: { type: 'string' } },
        required: ['bOnly'],
      },
    }

    const a = composeEffectiveObjectSchema(base, { type: 'A' }, ajv)
    expect(a.effective.properties).toHaveProperty('aOnly')
    expect(a.effective.required).toContain('aOnly')
    expect(a.effective.properties).not.toHaveProperty('bOnly')

    const b = composeEffectiveObjectSchema(base, { type: 'B' }, ajv)
    expect(b.effective.properties).toHaveProperty('bOnly')
    expect(b.effective.required).toContain('bOnly')
    expect(b.effective.properties).not.toHaveProperty('aOnly')
  })

  it('activates dependentRequired when key present', () => {
    const base = {
      type: 'object',
      properties: {
        featureA: { type: 'boolean' },
        detailsA: { type: 'string' },
      },
      dependentRequired: {
        featureA: ['detailsA'],
      },
    } as JSONSchema

    const on = composeEffectiveObjectSchema(base, { featureA: true }, ajv)
    expect(on.effective.required).toContain('detailsA')

    const off = composeEffectiveObjectSchema(base, {}, ajv)
    expect(off.effective.required ?? []).not.toContain('detailsA')
  })

  it('merges dependentSchemas when key present', () => {
    const base = {
      type: 'object',
      properties: {
        featureB: { type: 'boolean' },
      },
      dependentSchemas: {
        featureB: {
          properties: {
            detailsB: { type: 'string', minLength: 1 },
          },
          required: ['detailsB'],
        },
      },
    } as JSONSchema

    const withB = composeEffectiveObjectSchema(base, { featureB: true }, ajv)
    expect(withB.effective.properties).toHaveProperty('detailsB')
    expect(withB.effective.required).toContain('detailsB')

    const withoutB = composeEffectiveObjectSchema(base, {}, ajv)
    expect(withoutB.effective.properties).not.toHaveProperty('detailsB')
    expect(withoutB.effective.required ?? []).not.toContain('detailsB')
  })

  it('supports draft-07 dependencies array and schema forms', () => {
    const base = {
      type: 'object',
      properties: {
        flag: { type: 'number' },
        x: { type: 'string' },
        y: { type: 'string' },
        mode: { type: 'string' },
      },
      // Emulate draft-07 dependencies

      dependencies: {
        flag: ['x', 'y'],
        mode: {
          properties: {
            mode: { enum: ['on', 'off'] },
            extra: { type: 'number' },
          },
          required: ['mode'],
        },
      },
    } as JSONSchema

    const withFlag = composeEffectiveObjectSchema(base, { flag: 1 }, ajv)
    expect(withFlag.effective.required).toEqual(
      expect.arrayContaining(['x', 'y'])
    )

    const withMode = composeEffectiveObjectSchema(base, { mode: 'on' }, ajv)
    expect(withMode.effective.properties).toHaveProperty('extra')
    expect(withMode.effective.required).toContain('mode')
  })
})

describe('hasConditionalFeatures', () => {
  it('returns false for null/undefined schemas', () => {
    expect(hasConditionalFeatures(null)).toBe(false)
    expect(hasConditionalFeatures(undefined)).toBe(false)
  })

  it('returns false for simple object schemas without conditionals', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name'],
    }
    expect(hasConditionalFeatures(schema)).toBe(false)
  })

  it('returns true for schemas with if/then/else', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
      },
      if: { properties: { type: { const: 'A' } } },
      then: { properties: { aField: { type: 'string' } } },
    }
    expect(hasConditionalFeatures(schema)).toBe(true)
  })

  it('returns true for schemas with dependentRequired', () => {
    const schema = {
      type: 'object',
      properties: {
        feature: { type: 'boolean' },
        details: { type: 'string' },
      },
      dependentRequired: {
        feature: ['details'],
      },
    } as JSONSchema
    expect(hasConditionalFeatures(schema)).toBe(true)
  })

  it('returns true for schemas with dependentSchemas', () => {
    const schema = {
      type: 'object',
      properties: {
        feature: { type: 'boolean' },
      },
      dependentSchemas: {
        feature: {
          properties: { extra: { type: 'string' } },
        },
      },
    } as JSONSchema
    expect(hasConditionalFeatures(schema)).toBe(true)
  })

  it('returns true for schemas with draft-07 dependencies', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        x: { type: 'string' },
      },
      dependencies: {
        flag: ['x'],
      },
    }
    expect(hasConditionalFeatures(schema)).toBe(true)
  })

  it('returns false for schemas with only allOf/oneOf/anyOf (no conditionals)', () => {
    const schema: JSONSchema = {
      type: 'object',
      allOf: [
        { properties: { a: { type: 'string' } } },
        { properties: { b: { type: 'number' } } },
      ],
    }
    expect(hasConditionalFeatures(schema)).toBe(false)
  })
})

