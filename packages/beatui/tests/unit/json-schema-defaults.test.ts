/**
 * JSON Schema Default Extraction Tests
 *
 * Tests for the extractSchemaDefaults function that extracts default values
 * from JSON Schema definitions.
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

    it('should handle empty examples array', () => {
      const schema: JSONSchema = {
        type: 'string',
        examples: [],
      }
      expect(extractSchemaDefaults(schema)).toBeUndefined()
    })
  })

  describe('object defaults', () => {
    it('should extract nested object defaults', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'John' },
          age: { type: 'number', default: 30 },
        },
      }
      expect(extractSchemaDefaults(schema)).toEqual({
        name: 'John',
        age: 30,
      })
    })

    it('should only include properties with defaults', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'John' },
          email: { type: 'string' }, // no default
          active: { type: 'boolean', default: true },
        },
      }
      expect(extractSchemaDefaults(schema)).toEqual({
        name: 'John',
        active: true,
      })
    })

    it('should return undefined for objects with no property defaults', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
      }
      expect(extractSchemaDefaults(schema)).toBeUndefined()
    })

    it('should handle deeply nested objects', () => {
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
              },
            },
          },
        },
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
  })

  describe('array handling', () => {
    it('should not auto-populate arrays', () => {
      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'string', default: 'item' },
      }
      expect(extractSchemaDefaults(schema)).toBeUndefined()
    })

    it('should use array-level default if provided', () => {
      const schema: JSONSchema = {
        type: 'array',
        default: ['a', 'b', 'c'],
        items: { type: 'string' },
      }
      expect(extractSchemaDefaults(schema)).toEqual(['a', 'b', 'c'])
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
          },
          {
            type: 'object',
            properties: {
              age: { type: 'number', default: 30 },
            },
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
          { type: 'string' }, // no default
          { type: 'string', default: 'second' },
          { type: 'string', default: 'third' },
        ],
      }
      expect(extractSchemaDefaults(schema)).toBe('second')
    })

    it('should use defaults from first anyOf schema with defaults', () => {
      const schema: JSONSchema = {
        anyOf: [
          { type: 'object', properties: { a: { type: 'string' } } },
          { type: 'object', properties: { b: { type: 'string', default: 'b-default' } } },
        ],
      }
      expect(extractSchemaDefaults(schema)).toEqual({ b: 'b-default' })
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
      }
      expect(extractSchemaDefaults(schema)).toEqual({ name: 'inferred' })
    })
  })

  describe('type arrays', () => {
    it('should handle object in type array', () => {
      const schema: JSONSchema = {
        type: ['object', 'null'],
        properties: {
          name: { type: 'string', default: 'nullable object' },
        },
      }
      expect(extractSchemaDefaults(schema)).toEqual({ name: 'nullable object' })
    })
  })
})
