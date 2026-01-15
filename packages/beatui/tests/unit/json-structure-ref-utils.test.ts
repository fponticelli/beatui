/**
 * JSON Structure Ref Utils Tests
 *
 * Tests for $ref resolution utilities.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  parseRefPath,
  resolveRefPath,
  resolveRef,
  resolveTypeReference,
  resolveDefinitionRef,
  RefResolver,
  createRefResolver,
} from '../../src/components/json-structure/ref-utils'
import type { JSONStructureSchema, TypeDefinition } from '../../src/components/json-structure/structure-types'

describe('JSON Structure Ref Utils', () => {
  describe('parseRefPath', () => {
    it('should parse JSON Pointer format', () => {
      expect(parseRefPath('#/definitions/Address')).toEqual(['definitions', 'Address'])
      expect(parseRefPath('#/definitions/Types/Email')).toEqual(['definitions', 'Types', 'Email'])
      expect(parseRefPath('#/definitions/a/b/c')).toEqual(['definitions', 'a', 'b', 'c'])
    })

    it('should parse shorthand format (definition name only)', () => {
      expect(parseRefPath('Address')).toEqual(['definitions', 'Address'])
      expect(parseRefPath('User')).toEqual(['definitions', 'User'])
    })

    it('should parse relative path format', () => {
      expect(parseRefPath('types/Address')).toEqual(['types', 'Address'])
      expect(parseRefPath('nested/deep/Type')).toEqual(['nested', 'deep', 'Type'])
    })
  })

  describe('resolveRefPath', () => {
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/draft/2024-01/schema',
      $id: 'test',
      name: 'Test Schema',
      type: 'object',
      properties: {},
      definitions: {
        Address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
          },
        },
        Types: {
          Email: { type: 'string', format: 'email' },
          Phone: { type: 'string', pattern: '^\\d{10}$' },
        },
      },
    }

    it('should resolve simple definition path', () => {
      const result = resolveRefPath(schema, ['definitions', 'Address'])
      expect(result).toBeDefined()
      expect((result as TypeDefinition).type).toBe('object')
    })

    it('should resolve nested namespace path', () => {
      const result = resolveRefPath(schema, ['definitions', 'Types', 'Email'])
      expect(result).toBeDefined()
      expect((result as TypeDefinition).type).toBe('string')
      expect((result as TypeDefinition).format).toBe('email')
    })

    it('should return undefined for non-existent path', () => {
      const result = resolveRefPath(schema, ['definitions', 'NonExistent'])
      expect(result).toBeUndefined()
    })

    it('should return undefined for invalid path', () => {
      const result = resolveRefPath(schema, ['invalid', 'path'])
      expect(result).toBeUndefined()
    })

    it('should return namespace for partial path', () => {
      const result = resolveRefPath(schema, ['definitions', 'Types'])
      expect(result).toBeDefined()
      expect((result as Record<string, unknown>).Email).toBeDefined()
    })
  })

  describe('resolveRef', () => {
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/draft/2024-01/schema',
      $id: 'test',
      name: 'Test Schema',
      type: 'object',
      properties: {},
      definitions: {
        User: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
        },
        Namespace: {
          Nested: { type: 'string' },
        },
      },
    }

    let consoleWarnSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleWarnSpy.mockRestore()
    })

    it('should resolve JSON Pointer ref', () => {
      const result = resolveRef('#/definitions/User', schema)
      expect(result).toBeDefined()
      expect(result?.type).toBe('object')
    })

    it('should resolve shorthand ref', () => {
      const result = resolveRef('User', schema)
      expect(result).toBeDefined()
      expect(result?.type).toBe('object')
    })

    it('should return undefined and warn for non-existent ref', () => {
      const result = resolveRef('#/definitions/NonExistent', schema)
      expect(result).toBeUndefined()
      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it('should return undefined and warn for ref pointing to namespace', () => {
      const result = resolveRef('#/definitions/Namespace', schema)
      expect(result).toBeUndefined()
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('points to a namespace')
      )
    })
  })

  describe('resolveTypeReference', () => {
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/draft/2024-01/schema',
      $id: 'test',
      name: 'Test Schema',
      type: 'object',
      properties: {},
      definitions: {
        StringType: { type: 'string', minLength: 1 },
      },
    }

    it('should resolve type reference object', () => {
      const result = resolveTypeReference({ $ref: '#/definitions/StringType' }, schema)
      expect(result).toBeDefined()
      expect(result?.type).toBe('string')
      expect(result?.minLength).toBe(1)
    })
  })

  describe('resolveDefinitionRef', () => {
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/draft/2024-01/schema',
      $id: 'test',
      name: 'Test Schema',
      type: 'object',
      properties: {},
      definitions: {
        BaseString: { type: 'string', minLength: 1 },
      },
    }

    it('should resolve definition with type reference', () => {
      const definition: TypeDefinition = {
        type: { $ref: '#/definitions/BaseString' },
        maxLength: 100,
        name: 'Limited String',
      }

      const result = resolveDefinitionRef(definition, schema)
      expect(result.type).toBe('string')
      expect(result.minLength).toBe(1)
      expect(result.maxLength).toBe(100)
      expect(result.name).toBe('Limited String')
    })

    it('should return definition as-is if no type reference', () => {
      const definition: TypeDefinition = { type: 'string', maxLength: 50 }
      const result = resolveDefinitionRef(definition, schema)
      expect(result).toEqual(definition)
    })
  })

  describe('RefResolver class', () => {
    const schema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/draft/2024-01/schema',
      $id: 'test',
      name: 'Test Schema',
      type: 'object',
      properties: {},
      definitions: {
        Simple: { type: 'string' },
        WithRef: {
          type: { $ref: '#/definitions/Simple' },
          maxLength: 100,
        },
        Circular: {
          type: { $ref: '#/definitions/Circular' },
        },
      },
    }

    let consoleWarnSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleWarnSpy.mockRestore()
    })

    it('should resolve simple refs', () => {
      const resolver = new RefResolver(schema)
      const result = resolver.resolve('#/definitions/Simple')
      expect(result).toBeDefined()
      expect(result?.type).toBe('string')
    })

    it('should resolve nested refs', () => {
      const resolver = new RefResolver(schema)
      const result = resolver.resolve('#/definitions/WithRef')
      expect(result).toBeDefined()
      expect(result?.type).toBe('string')
      expect(result?.maxLength).toBe(100)
    })

    it('should detect and warn about circular refs', () => {
      const resolver = new RefResolver(schema)
      resolver.resolve('#/definitions/Circular')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Circular reference detected')
      )
    })

    it('should reset visited tracking', () => {
      const resolver = new RefResolver(schema)
      resolver.resolve('#/definitions/Simple')
      resolver.reset()
      // Should be able to resolve again after reset
      const result = resolver.resolve('#/definitions/Simple')
      expect(result).toBeDefined()
    })

    it('should resolve definitions with refs', () => {
      const resolver = new RefResolver(schema)
      const definition: TypeDefinition = {
        type: { $ref: '#/definitions/Simple' },
        name: 'Derived',
      }
      const result = resolver.resolveDefinition(definition)
      expect(result.type).toBe('string')
      expect(result.name).toBe('Derived')
    })
  })

  describe('createRefResolver', () => {
    it('should create a RefResolver instance', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test Schema',
        type: 'object',
        properties: {},
      }

      const resolver = createRefResolver(schema)
      expect(resolver).toBeInstanceOf(RefResolver)
    })
  })
})
