/**
 * JSON Structure Extends Utils Tests
 *
 * Tests for $extends inheritance resolution.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  resolveExtends,
  createExtendsResolver,
} from '../../src/components/json-structure/extends-utils'
import type {
  JSONStructureSchema,
  TypeDefinition,
  ObjectTypeDefinition,
} from '../../src/components/json-structure/structure-types'

describe('JSON Structure Extends Utils', () => {
  describe('resolveExtends', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleWarnSpy.mockRestore()
    })

    it('should return definition as-is when no $extends', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
      }

      const definition: TypeDefinition = { type: 'string', maxLength: 100 }
      const result = resolveExtends(definition, schema)

      expect(result.merged).toEqual(definition)
      expect(result.inheritanceChain).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })

    it('should resolve single $extends', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        definitions: {
          BaseType: {
            type: 'object',
            properties: {
              id: { type: 'uuid' },
              createdAt: { type: 'datetime' },
            },
          },
        },
      }

      const definition: TypeDefinition = {
        type: 'object',
        $extends: 'BaseType',
        properties: {
          name: { type: 'string' },
        },
      }

      const result = resolveExtends(definition, schema)

      expect(result.merged.type).toBe('object')
      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('id')
      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('createdAt')
      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('name')
      expect(result.inheritanceChain).toContain('BaseType')
      expect(result.errors).toHaveLength(0)
    })

    it('should resolve multiple $extends (array)', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        definitions: {
          Timestamped: {
            type: 'object',
            properties: {
              createdAt: { type: 'datetime' },
              updatedAt: { type: 'datetime' },
            },
          },
          Identifiable: {
            type: 'object',
            properties: {
              id: { type: 'uuid' },
            },
          },
        },
      }

      const definition: TypeDefinition = {
        type: 'object',
        $extends: ['Timestamped', 'Identifiable'],
        properties: {
          name: { type: 'string' },
        },
      }

      const result = resolveExtends(definition, schema)

      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('createdAt')
      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('updatedAt')
      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('id')
      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('name')
    })

    it('should handle deep inheritance chains', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        definitions: {
          Base: {
            type: 'object',
            properties: {
              baseField: { type: 'string' },
            },
          },
          Middle: {
            type: 'object',
            $extends: 'Base',
            properties: {
              middleField: { type: 'int32' },
            },
          },
          Derived: {
            type: 'object',
            $extends: 'Middle',
            properties: {
              derivedField: { type: 'boolean' },
            },
          },
        },
      }

      const definition: TypeDefinition = {
        type: 'object',
        $extends: 'Derived',
        properties: {
          finalField: { type: 'uuid' },
        },
      }

      const result = resolveExtends(definition, schema)

      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('baseField')
      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('middleField')
      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('derivedField')
      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('finalField')
    })

    it('should give derived properties precedence over base', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        definitions: {
          Base: {
            type: 'object',
            properties: {
              value: { type: 'string', maxLength: 50 },
            },
          },
        },
      }

      const definition: TypeDefinition = {
        type: 'object',
        $extends: 'Base',
        properties: {
          value: { type: 'string', maxLength: 100 }, // Override
        },
      }

      const result = resolveExtends(definition, schema)
      const valueProperty = (result.merged as ObjectTypeDefinition).properties.value as TypeDefinition
      expect(valueProperty.maxLength).toBe(100) // Derived wins
    })

    it('should merge required arrays', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        definitions: {
          Base: {
            type: 'object',
            properties: {
              id: { type: 'uuid' },
              name: { type: 'string' },
            },
            required: ['id'],
          },
        },
      }

      const definition: ObjectTypeDefinition = {
        type: 'object',
        $extends: 'Base',
        properties: {
          email: { type: 'string' },
        },
        required: ['email'],
      }

      const result = resolveExtends(definition, schema)
      const merged = result.merged as ObjectTypeDefinition
      expect(merged.required).toContain('id')
      expect(merged.required).toContain('email')
    })

    it('should deduplicate required arrays', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        definitions: {
          Base: {
            type: 'object',
            properties: {
              id: { type: 'uuid' },
            },
            required: ['id'],
          },
        },
      }

      const definition: ObjectTypeDefinition = {
        type: 'object',
        $extends: 'Base',
        properties: {},
        required: ['id'], // Same as base
      }

      const result = resolveExtends(definition, schema)
      const merged = result.merged as ObjectTypeDefinition
      expect(merged.required?.filter(r => r === 'id')).toHaveLength(1)
    })

    it('should detect circular inheritance', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        definitions: {
          A: {
            type: 'object',
            $extends: 'B',
            properties: {},
          },
          B: {
            type: 'object',
            $extends: 'A',
            properties: {},
          },
        },
      }

      const definition: TypeDefinition = {
        type: 'object',
        $extends: 'A',
        properties: {},
      }

      const result = resolveExtends(definition, schema)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(e => e.message.includes('Circular'))).toBe(true)
    })

    it('should report error for non-existent base', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        definitions: {},
      }

      const definition: TypeDefinition = {
        type: 'object',
        $extends: 'NonExistent',
        properties: {},
      }

      const result = resolveExtends(definition, schema)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].message).toContain('Failed to resolve base type')
    })

    it('should remove $extends from merged result', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        definitions: {
          Base: {
            type: 'object',
            properties: {},
          },
        },
      }

      const definition: TypeDefinition = {
        type: 'object',
        $extends: 'Base',
        properties: {},
      }

      const result = resolveExtends(definition, schema)
      expect(result.merged.$extends).toBeUndefined()
    })

    it('should handle grouped required arrays (string[][])', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        definitions: {
          Base: {
            type: 'object',
            properties: {
              a: { type: 'string' },
              b: { type: 'string' },
            },
            required: [['a', 'b']], // Grouped format
          },
        },
      }

      const definition: ObjectTypeDefinition = {
        type: 'object',
        $extends: 'Base',
        properties: {
          c: { type: 'string' },
        },
        required: ['c'],
      }

      const result = resolveExtends(definition, schema)
      const merged = result.merged as ObjectTypeDefinition
      expect(merged.required).toContain('a')
      expect(merged.required).toContain('b')
      expect(merged.required).toContain('c')
    })
  })

  describe('createExtendsResolver', () => {
    it('should create a resolver that can resolve extends', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        definitions: {
          Base: {
            type: 'object',
            properties: {
              id: { type: 'uuid' },
            },
          },
        },
      }

      const resolver = createExtendsResolver(schema)
      const definition: TypeDefinition = {
        type: 'object',
        $extends: 'Base',
        properties: {
          name: { type: 'string' },
        },
      }

      const result = resolver.resolve(definition)
      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('id')
      expect((result.merged as ObjectTypeDefinition).properties).toHaveProperty('name')
    })

    it('should reset ref resolver between calls', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        definitions: {
          Base: {
            type: 'object',
            properties: {
              id: { type: 'uuid' },
            },
          },
        },
      }

      const resolver = createExtendsResolver(schema)

      // Call multiple times - should work each time
      const def1: TypeDefinition = { type: 'object', $extends: 'Base', properties: {} }
      const def2: TypeDefinition = { type: 'object', $extends: 'Base', properties: {} }

      const result1 = resolver.resolve(def1)
      const result2 = resolver.resolve(def2)

      expect(result1.errors).toHaveLength(0)
      expect(result2.errors).toHaveLength(0)
    })
  })
})
