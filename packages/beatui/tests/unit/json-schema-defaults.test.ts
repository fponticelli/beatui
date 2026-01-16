/**
 * JSON Schema Default Extraction Tests
 *
 * Tests for the extractSchemaDefaults function that extracts default values
 * from JSON Schema definitions.
 *
 * Priority order:
 * 1. Explicit `default` property (highest)
 * 2. First item of `examples` array
 * 3. `const` value
 * 4. First `enum` value
 * 5. Smart type-based defaults (computed)
 *
 * Key behaviors:
 * - Nullable types (union with null) return null
 * - Objects only populate required properties
 * - Arrays with minItems > 0 generate items
 * - Smart defaults based on constraints (numbers use midpoint, etc.)
 */

import { describe, it, expect } from 'vitest'
import { extractSchemaDefaults } from '../../src/components/json-schema/schema-defaults'
import type { JSONSchema } from '../../src/components/json-schema/schema-types'

describe('extractSchemaDefaults', () => {
  describe('primitive defaults', () => {
    it('should extract string default', () => {
      const schema: JSONSchema = {
        type: 'string',
        default: 'hello',
      }
      expect(extractSchemaDefaults(schema)).toBe('hello')
    })

    it('should extract number default', () => {
      const schema: JSONSchema = {
        type: 'number',
        default: 42,
      }
      expect(extractSchemaDefaults(schema)).toBe(42)
    })

    it('should extract boolean default', () => {
      const schema: JSONSchema = {
        type: 'boolean',
        default: true,
      }
      expect(extractSchemaDefaults(schema)).toBe(true)
    })

    it('should extract null default', () => {
      const schema: JSONSchema = {
        type: 'null',
        default: null,
      }
      expect(extractSchemaDefaults(schema)).toBe(null)
    })
  })

  describe('examples fallback', () => {
    it('should use first example when no default is defined', () => {
      const schema: JSONSchema = {
        type: 'string',
        examples: ['first', 'second', 'third'],
      }
      expect(extractSchemaDefaults(schema)).toBe('first')
    })

    it('should prefer default over examples', () => {
      const schema: JSONSchema = {
        type: 'string',
        default: 'default-value',
        examples: ['example-value'],
      }
      expect(extractSchemaDefaults(schema)).toBe('default-value')
    })

    it('should use smart default for string when no default or examples', () => {
      const schema: JSONSchema = {
        type: 'string',
        examples: [],
      }
      // Smart default for string is empty string
      expect(extractSchemaDefaults(schema)).toBe('')
    })
  })

  describe('const and enum fallback', () => {
    it('should use const value when no default or examples', () => {
      const schema: JSONSchema = {
        type: 'string',
        const: 'constant-value',
      }
      expect(extractSchemaDefaults(schema)).toBe('constant-value')
    })

    it('should use first enum value when no default, examples, or const', () => {
      const schema: JSONSchema = {
        type: 'string',
        enum: ['option1', 'option2', 'option3'],
      }
      expect(extractSchemaDefaults(schema)).toBe('option1')
    })

    it('should prefer default over const and enum', () => {
      const schema: JSONSchema = {
        type: 'string',
        default: 'default-value',
        const: 'const-value',
        enum: ['enum-value'],
      }
      expect(extractSchemaDefaults(schema)).toBe('default-value')
    })
  })

  describe('smart defaults', () => {
    it('should return empty string for string type', () => {
      const schema: JSONSchema = {
        type: 'string',
      }
      expect(extractSchemaDefaults(schema)).toBe('')
    })

    it('should return 0 for number type without constraints', () => {
      const schema: JSONSchema = {
        type: 'number',
      }
      expect(extractSchemaDefaults(schema)).toBe(0)
    })

    it('should return 0 for integer type without constraints', () => {
      const schema: JSONSchema = {
        type: 'integer',
      }
      expect(extractSchemaDefaults(schema)).toBe(0)
    })

    it('should return false for boolean type', () => {
      const schema: JSONSchema = {
        type: 'boolean',
      }
      expect(extractSchemaDefaults(schema)).toBe(false)
    })

    it('should return null for null type', () => {
      const schema: JSONSchema = {
        type: 'null',
      }
      expect(extractSchemaDefaults(schema)).toBe(null)
    })

    it('should return midpoint for number with min and max', () => {
      const schema: JSONSchema = {
        type: 'number',
        minimum: 10,
        maximum: 100,
      }
      expect(extractSchemaDefaults(schema)).toBe(55)
    })

    it('should return midpoint for integer with min and max', () => {
      const schema: JSONSchema = {
        type: 'integer',
        minimum: 0,
        maximum: 120,
      }
      expect(extractSchemaDefaults(schema)).toBe(60)
    })

    it('should round to multipleOf', () => {
      const schema: JSONSchema = {
        type: 'integer',
        minimum: 0,
        maximum: 100,
        multipleOf: 10,
      }
      expect(extractSchemaDefaults(schema)).toBe(50)
    })

    it('should use minimum when only minimum is specified', () => {
      const schema: JSONSchema = {
        type: 'number',
        minimum: 5,
      }
      expect(extractSchemaDefaults(schema)).toBe(5)
    })

    it('should use 0 when only maximum is specified and 0 is valid', () => {
      const schema: JSONSchema = {
        type: 'number',
        maximum: 100,
      }
      expect(extractSchemaDefaults(schema)).toBe(0)
    })

    it('should use maximum when only maximum is specified and 0 is invalid', () => {
      const schema: JSONSchema = {
        type: 'number',
        maximum: -5,
      }
      expect(extractSchemaDefaults(schema)).toBe(-5)
    })

    it('should handle exclusiveMinimum', () => {
      const schema: JSONSchema = {
        type: 'integer',
        exclusiveMinimum: 0,
        maximum: 10,
      }
      // exclusiveMinimum of 0 means min is 1, midpoint of 1-10 is 5.5 -> 6
      expect(extractSchemaDefaults(schema)).toBe(6)
    })

    it('should handle exclusiveMaximum', () => {
      const schema: JSONSchema = {
        type: 'integer',
        minimum: 0,
        exclusiveMaximum: 10,
      }
      // exclusiveMaximum of 10 means max is 9, midpoint of 0-9 is 4.5 -> 5
      expect(extractSchemaDefaults(schema)).toBe(5)
    })
  })

  describe('nullable types', () => {
    it('should return null for nullable string', () => {
      const schema: JSONSchema = {
        type: ['string', 'null'],
      }
      expect(extractSchemaDefaults(schema)).toBe(null)
    })

    it('should return null for nullable number', () => {
      const schema: JSONSchema = {
        type: ['number', 'null'],
      }
      expect(extractSchemaDefaults(schema)).toBe(null)
    })

    it('should return null for nullable object', () => {
      const schema: JSONSchema = {
        type: ['object', 'null'],
        properties: {
          name: { type: 'string' },
        },
      }
      expect(extractSchemaDefaults(schema)).toBe(null)
    })
  })

  describe('string formats', () => {
    it('should return current date for date format', () => {
      const schema: JSONSchema = {
        type: 'string',
        format: 'date',
      }
      const result = extractSchemaDefaults(schema) as string
      // Should be in YYYY-MM-DD format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return current datetime for date-time format', () => {
      const schema: JSONSchema = {
        type: 'string',
        format: 'date-time',
      }
      const result = extractSchemaDefaults(schema) as string
      // Should be ISO datetime format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should return 00:00:00 for time format', () => {
      const schema: JSONSchema = {
        type: 'string',
        format: 'time',
      }
      expect(extractSchemaDefaults(schema)).toBe('00:00:00')
    })
  })

  describe('object defaults', () => {
    it('should extract defaults for required properties only', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'John' },
          age: { type: 'number', default: 30 },
          email: { type: 'string' }, // not required
        },
        required: ['name', 'age'],
      }
      expect(extractSchemaDefaults(schema)).toEqual({
        name: 'John',
        age: 30,
      })
    })

    it('should generate smart defaults for required properties', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer', minimum: 0, maximum: 100 },
          active: { type: 'boolean' },
        },
        required: ['name', 'age', 'active'],
      }
      expect(extractSchemaDefaults(schema)).toEqual({
        name: '',
        age: 50,
        active: false,
      })
    })

    it('should return empty object for objects with no required properties', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
      }
      expect(extractSchemaDefaults(schema)).toEqual({})
    })

    it('should use object-level default over property defaults', () => {
      const schema: JSONSchema = {
        type: 'object',
        default: { name: 'Default Object' },
        properties: {
          name: { type: 'string', default: 'Property Default' },
        },
      }
      expect(extractSchemaDefaults(schema)).toEqual({ name: 'Default Object' })
    })

    it('should handle deeply nested objects with required fields', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  theme: { type: 'string', default: 'dark' },
                  language: { type: 'string', default: 'en' },
                },
                required: ['theme', 'language'],
              },
            },
            required: ['profile'],
          },
        },
        required: ['user'],
      }
      expect(extractSchemaDefaults(schema)).toEqual({
        user: {
          profile: {
            theme: 'dark',
            language: 'en',
          },
        },
      })
    })
  })

  describe('array handling', () => {
    it('should return empty array when minItems is 0', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'string' },
      }
      expect(extractSchemaDefaults(schema)).toEqual([])
    })

    it('should generate items when minItems > 0', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
      }
      expect(extractSchemaDefaults(schema)).toEqual(['', ''])
    })

    it('should generate items with smart defaults', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'integer', minimum: 0, maximum: 100 },
        minItems: 3,
      }
      expect(extractSchemaDefaults(schema)).toEqual([50, 50, 50])
    })

    it('should use array-level default if provided', () => {
      const schema: JSONSchema = {
        type: 'array',
        default: ['a', 'b', 'c'],
        items: { type: 'string' },
      }
      expect(extractSchemaDefaults(schema)).toEqual(['a', 'b', 'c'])
    })

    it('should handle tuple schemas with minItems', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: [
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' },
        ],
        minItems: 2,
      }
      expect(extractSchemaDefaults(schema)).toEqual(['', 0])
    })
  })

  describe('allOf composition', () => {
    it('should merge defaults from allOf schemas', () => {
      const schema: JSONSchema = {
        allOf: [
          {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'John' },
            },
            required: ['name'],
          },
          {
            type: 'object',
            properties: {
              age: { type: 'number', default: 30 },
            },
            required: ['age'],
          },
        ],
      }
      expect(extractSchemaDefaults(schema)).toEqual({
        name: 'John',
        age: 30,
      })
    })
  })

  describe('oneOf/anyOf composition', () => {
    it('should use defaults from first oneOf schema with defaults', () => {
      const schema: JSONSchema = {
        oneOf: [
          { type: 'string' }, // uses smart default ''
          { type: 'string', default: 'second' },
          { type: 'string', default: 'third' },
        ],
      }
      // First schema now uses smart default
      expect(extractSchemaDefaults(schema)).toBe('')
    })

    it('should use defaults from first anyOf schema with defaults', () => {
      const schema: JSONSchema = {
        anyOf: [
          { type: 'object', properties: { a: { type: 'string' } } },
          { type: 'object', properties: { b: { type: 'string', default: 'b-default' } }, required: ['b'] },
        ],
      }
      // First schema returns {} since no required properties
      expect(extractSchemaDefaults(schema)).toEqual({})
    })
  })

  describe('boolean schemas', () => {
    it('should return undefined for boolean true schema', () => {
      expect(extractSchemaDefaults(true)).toBeUndefined()
    })

    it('should return undefined for boolean false schema', () => {
      expect(extractSchemaDefaults(false)).toBeUndefined()
    })
  })

  describe('inferred object type', () => {
    it('should treat schema with properties as object type', () => {
      const schema: JSONSchema = {
        properties: {
          name: { type: 'string', default: 'inferred' },
        },
        required: ['name'],
      }
      expect(extractSchemaDefaults(schema)).toEqual({ name: 'inferred' })
    })
  })
})
