/**
 * JSON Structure Default Extraction Tests
 *
 * Tests for the extractStructureDefaults function that extracts default values
 * from JSON Structure schema definitions.
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
 * - Arrays/sets with minItems > 0 generate items
 * - Smart defaults based on constraints (numbers use midpoint, etc.)
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

    it('should use smart default when no default or examples', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'string',
        examples: [],
      } as JSONStructureSchema
      // Smart default for string is empty string
      expect(extractStructureDefaults(schema)).toBe('')
    })
  })

  describe('smart defaults', () => {
    it('should return empty string for string type', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'string',
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe('')
    })

    it('should return 0 for int32 type', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'int32',
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe(0)
    })

    it('should return false for boolean type', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'boolean',
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe(false)
    })

    it('should return midpoint for int32 with min and max', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'int32',
        minimum: 0,
        maximum: 100,
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe(50)
    })

    it('should return current date for date type', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'date',
      } as JSONStructureSchema
      const result = extractStructureDefaults(schema) as string
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return current datetime for datetime type', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'datetime',
      } as JSONStructureSchema
      const result = extractStructureDefaults(schema) as string
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should return 00:00:00 for time type', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'time',
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe('00:00:00')
    })

    it('should return PT0S for duration type', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'duration',
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe('PT0S')
    })

    it('should return empty string for uuid type', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'uuid',
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe('')
    })
  })

  describe('nullable types', () => {
    it('should return null for nullable string', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: ['string', 'null'],
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe(null)
    })

    it('should return null for nullable int32', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: ['int32', 'null'],
      } as JSONStructureSchema
      expect(extractStructureDefaults(schema)).toBe(null)
    })
  })

  describe('object defaults', () => {
    it('should extract defaults for required properties only', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          name: { type: 'string', default: 'John' },
          age: { type: 'int32', default: 30 },
          email: { type: 'string' }, // not required
        },
        required: ['name', 'age'],
      }
      expect(extractStructureDefaults(schema)).toEqual({
        name: 'John',
        age: 30,
      })
    })

    it('should generate smart defaults for required properties', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'int32', minimum: 0, maximum: 100 },
          active: { type: 'boolean' },
        },
        required: ['name', 'age', 'active'],
      }
      expect(extractStructureDefaults(schema)).toEqual({
        name: '',
        age: 50,
        active: false,
      })
    })

    it('should return empty object for objects with no required properties', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
      }
      expect(extractStructureDefaults(schema)).toEqual({})
    })

    it('should handle deeply nested objects with required fields', () => {
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
                required: ['theme', 'language'],
              },
            },
            required: ['profile'],
          },
        },
        required: ['user'],
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
    it('should return empty array when no minItems', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['items'],
      }
      expect(extractStructureDefaults(schema)).toEqual({
        items: [],
      })
    })

    it('should return empty set when no minItems', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          tags: {
            type: 'set',
            items: { type: 'string' },
          },
        },
        required: ['tags'],
      }
      expect(extractStructureDefaults(schema)).toEqual({
        tags: [],
      })
    })

    it('should generate items when minItems > 0', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
          },
        },
        required: ['items'],
      }
      expect(extractStructureDefaults(schema)).toEqual({
        items: ['', ''],
      })
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
        required: ['items'],
      }
      expect(extractStructureDefaults(schema)).toEqual({
        items: ['a', 'b', 'c'],
      })
    })
  })

  describe('$ref resolution', () => {
    it('should resolve $ref and extract defaults for required properties', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          address: { type: { $ref: '#/definitions/Address' } },
        },
        required: ['address'],
        definitions: {
          Address: {
            type: 'object',
            properties: {
              street: { type: 'string', default: '123 Main St' },
              city: { type: 'string', default: 'Anytown' },
            },
            required: ['street', 'city'],
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
        required: ['settings'],
        definitions: {
          Settings: {
            type: 'object',
            properties: {
              theme: { type: 'string', default: 'light' },
            },
            required: ['theme'],
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
        required: ['node'],
        definitions: {
          Node: {
            type: 'object',
            properties: {
              value: { type: 'string', default: 'root' },
              child: { type: { $ref: '#/definitions/Node' } },
            },
            required: ['value'],
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
            required: ['name', 'age'],
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
        required: ['point'],
      }
      expect(extractStructureDefaults(schema)).toEqual({
        point: { x: 0, y: 0 },
      })
    })

    it('should generate smart defaults for tuple elements', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          coord: {
            type: 'tuple',
            tuple: ['x', 'y', 'z'],
            properties: {
              x: { type: 'double' },
              y: { type: 'double' },
              z: { type: 'double' },
            },
          },
        },
        required: ['coord'],
      }
      expect(extractStructureDefaults(schema)).toEqual({
        coord: { x: 0, y: 0, z: 0 },
      })
    })
  })

  describe('choice handling', () => {
    it('should use first choice with selector', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          payment: {
            type: 'choice',
            selector: 'method',
            choices: {
              creditCard: {
                type: 'object',
                properties: {
                  cardNumber: { type: 'string' },
                },
                required: ['cardNumber'],
              },
              paypal: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                },
                required: ['email'],
              },
            },
          },
        },
        required: ['payment'],
      }
      expect(extractStructureDefaults(schema)).toEqual({
        payment: {
          method: 'creditCard',
          cardNumber: '',
        },
      })
    })

    it('should use tagged union format without selector', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          value: {
            type: 'choice',
            choices: {
              stringVal: { type: 'string' },
              numberVal: { type: 'int32' },
            },
          },
        },
        required: ['value'],
      }
      expect(extractStructureDefaults(schema)).toEqual({
        value: { stringVal: '' },
      })
    })
  })

  describe('map handling', () => {
    it('should return empty map for required map property', () => {
      const schema: JSONStructureSchema = {
        ...baseSchema,
        type: 'object',
        properties: {
          metadata: {
            type: 'map',
            values: { type: 'string' },
          },
        },
        required: ['metadata'],
      }
      expect(extractStructureDefaults(schema)).toEqual({
        metadata: {},
      })
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
        required: ['metadata'],
      }
      expect(extractStructureDefaults(schema)).toEqual({
        metadata: { key1: 'value1' },
      })
    })
  })
})
