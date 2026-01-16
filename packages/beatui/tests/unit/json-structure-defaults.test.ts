/**
 * JSON Structure Default Extraction Tests
 *
 * Tests for the extractStructureDefaults function that extracts default values
 * from JSON Structure schema definitions.
 */

import { describe, it, expect } from 'vitest'
import { extractStructureDefaults } from '../../src/components/json-structure/structure-defaults'
import type { JSONStructureSchema } from '../../src/components/json-structure/structure-types'

describe('extractStructureDefaults', () => {
  const baseSchema: Omit<JSONStructureSchema, 'type' | 'properties'> = {
    $schema: 'https://json-structure.org/draft/2024-01/schema',
    $id: 'test',
    name: 'Test Schema',
  }

  describe('primitive defaults', () => {
    it('should extract string default', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'string',
        default: 'hello',
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe('hello')
    })

    it('should extract number default', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'int32',
        default: 42,
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe(42)
    })

    it('should extract boolean default', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'boolean',
        default: true,
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe(true)
    })
  })

  describe('examples fallback', () => {
    it('should use first example when no default is defined', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'string',
        examples: ['first', 'second', 'third'],
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe('first')
    })

    it('should prefer default over examples', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'string',
        default: 'default-value',
        examples: ['example-value'],
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe('default-value')
    })

    it('should handle empty examples array', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'string',
        examples: [],
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBeUndefined()
    })
  })

  describe('object defaults', () => {
    it('should extract nested object defaults', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          name: { type: 'string', default: 'John' },
          age: { type: 'int32', default: 30 },
        },
      }
      expect(extractStructureDefaults(schema)).toEqual({
        name: 'John',
        age: 30,
      })
    })

    it('should only include properties with defaults', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          name: { type: 'string', default: 'John' },
          email: { type: 'string' }, // no default
          active: { type: 'boolean', default: true },
        },
      }
      expect(extractStructureDefaults(schema)).toEqual({
        name: 'John',
        active: true,
      })
    })

    it('should return undefined for objects with no property defaults', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
      }
      expect(extractStructureDefaults(schema)).toBeUndefined()
    })

    it('should handle deeply nested objects', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
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
      expect(extractStructureDefaults(schema)).toEqual({
        user: {
          profile: {
            theme: 'dark',
            language: 'en',
          },
        },
      })
    })

    it('should use object-level default over property defaults', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        default: { name: 'Default Object' },
        properties: {
          name: { type: 'string', default: 'Property Default' },
        },
      }
      expect(extractStructureDefaults(schema)).toEqual({ name: 'Default Object' })
    })
  })

  describe('array and set handling', () => {
    it('should not auto-populate arrays', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string', default: 'item' },
          },
        },
      }
      expect(extractStructureDefaults(schema)).toBeUndefined()
    })

    it('should not auto-populate sets', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          tags: {
            type: 'set',
            items: { type: 'string', default: 'tag' },
          },
        },
      }
      expect(extractStructureDefaults(schema)).toBeUndefined()
    })

    it('should use array-level default if provided', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          items: {
            type: 'array',
            default: ['a', 'b', 'c'],
            items: { type: 'string' },
          },
        },
      }
      expect(extractStructureDefaults(schema)).toEqual({
        items: ['a', 'b', 'c'],
      })
    })
  })

  describe('$ref resolution', () => {
    it('should resolve $ref and extract defaults', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          address: { type: { $ref: '#/definitions/Address' } },
        },
        definitions: {
          Address: {
            type: 'object',
            properties: {
              street: { type: 'string', default: '123 Main St' },
              city: { type: 'string', default: 'Anytown' },
            },
          },
        },
      }
      expect(extractStructureDefaults(schema)).toEqual({
        address: {
          street: '123 Main St',
          city: 'Anytown',
        },
      })
    })

    it('should handle shorthand $ref', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          settings: { type: { $ref: 'Settings' } },
        },
        definitions: {
          Settings: {
            type: 'object',
            properties: {
              theme: { type: 'string', default: 'light' },
            },
          },
        },
      }
      expect(extractStructureDefaults(schema)).toEqual({
        settings: {
          theme: 'light',
        },
      })
    })

    it('should handle circular references gracefully', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          node: { type: { $ref: '#/definitions/Node' } },
        },
        definitions: {
          Node: {
            type: 'object',
            properties: {
              value: { type: 'string', default: 'root' },
              child: { type: { $ref: '#/definitions/Node' } },
            },
          },
        },
      }
      // Should extract defaults without infinite loop
      const result = extractStructureDefaults(schema)
      expect(result).toEqual({
        node: {
          value: 'root',
        },
      })
    })
  })

  describe('$root resolution', () => {
    it('should use $root as the root definition', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        $root: '#/definitions/Person',
        definitions: {
          Person: {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'Anonymous' },
              age: { type: 'int32', default: 0 },
            },
          },
        },
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toEqual({
        name: 'Anonymous',
        age: 0,
      })
    })
  })

  describe('tuple handling', () => {
    it('should extract defaults from tuple properties', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          point: {
            type: 'tuple',
            tuple: ['x', 'y'],
            properties: {
              x: { type: 'double', default: 0 },
              y: { type: 'double', default: 0 },
            },
          },
        },
      }
      expect(extractStructureDefaults(schema)).toEqual({
        point: { x: 0, y: 0 },
      })
    })
  })

  describe('choice handling', () => {
    it('should extract default from first choice with defaults', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          value: {
            type: 'choice',
            choices: {
              stringVal: { type: 'string' }, // no default
              numberVal: { type: 'int32', default: 42 },
            },
          },
        },
      }
      expect(extractStructureDefaults(schema)).toEqual({
        value: 42,
      })
    })
  })

  describe('map handling', () => {
    it('should not auto-populate maps', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          metadata: {
            type: 'map',
            values: { type: 'string', default: 'value' },
          },
        },
      }
      expect(extractStructureDefaults(schema)).toBeUndefined()
    })

    it('should use map-level default if provided', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          metadata: {
            type: 'map',
            default: { key1: 'value1' },
            values: { type: 'string' },
          },
        },
      }
      expect(extractStructureDefaults(schema)).toEqual({
        metadata: { key1: 'value1' },
      })
    })
  })
})
