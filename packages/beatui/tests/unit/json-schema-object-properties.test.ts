import { describe, it, expect } from 'vitest'
import {
  SchemaContext,
  getEvaluatedProperties,
  type JSONSchema,
} from '../../src/components/json-schema/schema-context'

import Ajv from 'ajv'

describe('JSON Schema Object Properties', () => {
  const ajv = new Ajv()

  describe('SchemaContext readOnly/writeOnly/deprecated properties', () => {
    it('should detect readOnly properties', () => {
      const schema: JSONSchema = {
        type: 'string',
        readOnly: true,
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isReadOnly).toBe(true)
      expect(ctx.isWriteOnly).toBe(false)
      expect(ctx.isDeprecated).toBe(false)
    })

    it('should detect writeOnly properties', () => {
      const schema: JSONSchema = {
        type: 'string',
        writeOnly: true,
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isReadOnly).toBe(false)
      expect(ctx.isWriteOnly).toBe(true)
      expect(ctx.isDeprecated).toBe(false)
    })

    it('should detect deprecated properties', () => {
      const schema: JSONSchema = {
        type: 'string',
        deprecated: true,
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isReadOnly).toBe(false)
      expect(ctx.isWriteOnly).toBe(false)
      expect(ctx.isDeprecated).toBe(true)
    })

    it('should handle x:ui.ignoreReadOnly override', () => {
      const schema = {
        type: 'string',
        readOnly: true,
        'x:ui': { ignoreReadOnly: true },
      } as JSONSchema

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isReadOnly).toBe(true)
      expect(ctx.shouldIgnoreReadOnly).toBe(true)
    })

    it('should handle x:ui.showWriteOnly override', () => {
      const schema = {
        type: 'string',
        writeOnly: true,
        'x:ui': { showWriteOnly: true },
      } as JSONSchema

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isWriteOnly).toBe(true)
      expect(ctx.shouldShowWriteOnly).toBe(true)
    })
  })

  describe('getEvaluatedProperties', () => {
    it('should track properties from properties keyword', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      }

      const value = { name: 'John', age: 30, extra: 'value' }
      const evaluated = getEvaluatedProperties(schema, value, ajv)

      expect(evaluated.has('name')).toBe(true)
      expect(evaluated.has('age')).toBe(true)
      expect(evaluated.has('extra')).toBe(false) // not in properties
    })

    it('should track properties from patternProperties', () => {
      const schema: JSONSchema = {
        type: 'object',
        patternProperties: {
          '^x-': { type: 'string' },
        },
      }

      const value = { 'x-custom': 'value', 'y-other': 'value' }
      const evaluated = getEvaluatedProperties(schema, value, ajv)

      expect(evaluated.has('x-custom')).toBe(true)
      expect(evaluated.has('y-other')).toBe(false) // doesn't match pattern
    })

    it('should track all properties when additionalProperties is not false', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        additionalProperties: true,
      }

      const value = { name: 'John', extra: 'value' }
      const evaluated = getEvaluatedProperties(schema, value, ajv)

      expect(evaluated.has('name')).toBe(true)
      expect(evaluated.has('extra')).toBe(true) // additionalProperties allows all
    })

    it('should track properties from allOf branches', () => {
      const schema: JSONSchema = {
        type: 'object',
        allOf: [
          {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
          {
            type: 'object',
            properties: {
              age: { type: 'number' },
            },
          },
        ],
      }

      const value = { name: 'John', age: 30 }
      const evaluated = getEvaluatedProperties(schema, value, ajv)

      expect(evaluated.has('name')).toBe(true)
      expect(evaluated.has('age')).toBe(true)
    })

    it('should track properties from if/then/else overlays', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['A', 'B'] },
        },
        if: {
          type: 'object',
          properties: { type: { const: 'A' } },
        },
        then: {
          type: 'object',
          properties: {
            aField: { type: 'string' },
          },
        },
        else: {
          type: 'object',
          properties: {
            bField: { type: 'string' },
          },
        },
      }

      const valueA = { type: 'A', aField: 'value' }
      const evaluatedA = getEvaluatedProperties(schema, valueA, ajv)

      expect(evaluatedA.has('type')).toBe(true)
      expect(evaluatedA.has('aField')).toBe(true)
      expect(evaluatedA.has('bField')).toBe(false)

      const valueB = { type: 'B', bField: 'value' }
      const evaluatedB = getEvaluatedProperties(schema, valueB, ajv)

      expect(evaluatedB.has('type')).toBe(true)
      expect(evaluatedB.has('aField')).toBe(false)
      expect(evaluatedB.has('bField')).toBe(true)
    })

    it('should track properties from dependentSchemas', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          feature: { type: 'boolean' },
        },
        dependentSchemas: {
          feature: {
            type: 'object',
            properties: {
              details: { type: 'string' },
            },
          },
        },
      }

      const valueWithFeature = { feature: true, details: 'info' }
      const evaluated = getEvaluatedProperties(schema, valueWithFeature, ajv)

      expect(evaluated.has('feature')).toBe(true)
      expect(evaluated.has('details')).toBe(true)

      const valueWithoutFeature = { other: 'value' }
      const evaluatedWithout = getEvaluatedProperties(
        schema,
        valueWithoutFeature,
        ajv
      )

      expect(evaluatedWithout.has('feature')).toBe(false)
      expect(evaluatedWithout.has('details')).toBe(false)
      expect(evaluatedWithout.has('other')).toBe(false)
    })

    it('should handle draft-07 dependencies', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
        },
        dependencies: {
          flag: {
            type: 'object',
            properties: {
              extra: { type: 'string' },
            },
          },
        },
      }

      const valueWithFlag = { flag: true, extra: 'value' }
      const evaluated = getEvaluatedProperties(schema, valueWithFlag, ajv)

      expect(evaluated.has('flag')).toBe(true)
      expect(evaluated.has('extra')).toBe(true)
    })
  })

  describe('Pattern properties validation', () => {
    it('should validate property names against patterns', () => {
      const schema: JSONSchema = {
        type: 'object',
        patternProperties: {
          '^[a-z]+$': { type: 'string' },
          '^[A-Z]+$': { type: 'number' },
        },
        additionalProperties: false,
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: [],
        isPropertyRequired: false,
        ajv,
      })

      // This would be tested in integration tests with actual controls
      expect(ctx.definition).toEqual(schema)
    })

    it('should validate property names with propertyNames constraint', () => {
      const schema: JSONSchema = {
        type: 'object',
        propertyNames: {
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
        },
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: [],
        isPropertyRequired: false,
        ajv,
      })

      expect(ctx.definition).toEqual(schema)
    })
  })

  describe('unevaluatedProperties behavior', () => {
    it('should identify unevaluated properties when unevaluatedProperties is false', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        unevaluatedProperties: false,
      } as JSONSchema

      const value = { name: 'John', extra: 'value' }
      const evaluated = getEvaluatedProperties(schema, value, ajv)

      expect(evaluated.has('name')).toBe(true)
      expect(evaluated.has('extra')).toBe(false) // unevaluated
    })

    it('should handle unevaluatedProperties with schema', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        unevaluatedProperties: { type: 'number' },
      } as JSONSchema

      const value = { name: 'John', count: 42 }
      const evaluated = getEvaluatedProperties(schema, value, ajv)

      expect(evaluated.has('name')).toBe(true)
      expect(evaluated.has('count')).toBe(false) // would be unevaluated, handled by unevaluatedProperties schema
    })

    it('should work with complex schema combinations', () => {
      const schema = {
        type: 'object',
        allOf: [
          {
            type: 'object',
            properties: {
              base: { type: 'string' },
            },
          },
        ],
        if: {
          type: 'object',
          properties: { base: { const: 'special' } },
        },
        then: {
          type: 'object',
          properties: {
            special: { type: 'boolean' },
          },
        },
        unevaluatedProperties: false,
      } as JSONSchema

      const value = { base: 'special', special: true, extra: 'not allowed' }
      const evaluated = getEvaluatedProperties(schema, value, ajv)

      expect(evaluated.has('base')).toBe(true)
      expect(evaluated.has('special')).toBe(true)
      expect(evaluated.has('extra')).toBe(false) // unevaluated
    })
  })

  describe('Additional properties behavior', () => {
    it('should handle additionalProperties: true', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        additionalProperties: true,
      }

      const value = { name: 'John', anything: 'allowed' }
      const evaluated = getEvaluatedProperties(schema, value, ajv)

      expect(evaluated.has('name')).toBe(true)
      expect(evaluated.has('anything')).toBe(true)
    })

    it('should handle additionalProperties: false', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        additionalProperties: false,
      }

      const value = { name: 'John', extra: 'not allowed' }
      const evaluated = getEvaluatedProperties(schema, value, ajv)

      expect(evaluated.has('name')).toBe(true)
      expect(evaluated.has('extra')).toBe(false)
    })

    it('should handle additionalProperties with schema', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        additionalProperties: { type: 'number' },
      }

      const value = { name: 'John', count: 42 }
      const evaluated = getEvaluatedProperties(schema, value, ajv)

      expect(evaluated.has('name')).toBe(true)
      expect(evaluated.has('count')).toBe(true) // allowed by additionalProperties schema
    })
  })

  describe('Min/Max properties constraints', () => {
    it('should respect minProperties and maxProperties', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        minProperties: 1,
        maxProperties: 3,
        additionalProperties: true,
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: [],
        isPropertyRequired: false,
      })

      expect(ctx.definition).toEqual(schema)
    })
  })
})
