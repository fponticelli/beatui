/**
 * JSON Structure Context Tests
 *
 * Tests for the StructureContext class and createStructureContext factory.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  StructureContext,
  createStructureContext,
} from '../../src/components/json-structure/structure-context'
import type { JSONStructureSchema, TypeDefinition } from '../../src/components/json-structure/structure-types'

describe('JSON Structure Context', () => {
  describe('StructureContext', () => {
    const baseSchema: JSONStructureSchema = {
      $schema: 'https://json-structure.org/draft/2024-01/schema',
      $id: 'test',
      name: 'Test Schema',
      type: 'object',
      properties: {
        name: { type: 'string', name: 'Full Name' },
        age: { type: 'int32' },
      },
      definitions: {
        Email: { type: 'string', format: 'email' },
        Address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
          },
        },
      },
    }

    describe('constructor', () => {
      it('should create context with required options', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['test'],
        })

        expect(ctx.schema).toBe(baseSchema)
        expect(ctx.definition.type).toBe('string')
        expect(ctx.path).toEqual(['test'])
        expect(ctx.readOnly).toBe(false)
        expect(ctx.locale).toBeUndefined()
        expect(ctx.widgetRegistry).toBeUndefined()
        expect(ctx.isPropertyRequired).toBe(false)
        expect(ctx.suppressLabel).toBe(false)
      })

      it('should create context with all options', () => {
        const mockRegistry = {} as any
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['test'],
          readOnly: true,
          locale: 'es',
          widgetRegistry: mockRegistry,
          isPropertyRequired: true,
          suppressLabel: true,
        })

        expect(ctx.readOnly).toBe(true)
        expect(ctx.locale).toBe('es')
        expect(ctx.widgetRegistry).toBe(mockRegistry)
        expect(ctx.isPropertyRequired).toBe(true)
        expect(ctx.suppressLabel).toBe(true)
      })
    })

    describe('with()', () => {
      it('should create new context with updated definition', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['test'],
        })

        const newDef: TypeDefinition = { type: 'int32' }
        const newCtx = ctx.with({ definition: newDef })

        expect(newCtx).not.toBe(ctx)
        expect(newCtx.definition).toBe(newDef)
        expect(newCtx.path).toEqual(['test']) // unchanged
      })

      it('should create new context with updated path', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['root'],
        })

        const newCtx = ctx.with({ path: ['root', 'child'] })

        expect(newCtx.path).toEqual(['root', 'child'])
        expect(ctx.path).toEqual(['root']) // original unchanged
      })

      it('should preserve all fields when updating one', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['test'],
          readOnly: true,
          locale: 'fr',
          isPropertyRequired: true,
        })

        const newCtx = ctx.with({ suppressLabel: true })

        expect(newCtx.readOnly).toBe(true)
        expect(newCtx.locale).toBe('fr')
        expect(newCtx.isPropertyRequired).toBe(true)
        expect(newCtx.suppressLabel).toBe(true)
      })
    })

    describe('append()', () => {
      it('should append segment to path', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['root'],
        })

        const childCtx = ctx.append('child')

        expect(childCtx.path).toEqual(['root', 'child'])
        expect(ctx.path).toEqual(['root']) // original unchanged
      })

      it('should handle numeric segments', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'array', items: { type: 'string' } },
          path: ['items'],
        })

        const indexCtx = ctx.append(0)

        expect(indexCtx.path).toEqual(['items', 0])
      })
    })

    describe('isRoot', () => {
      it('should return true for empty path', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.isRoot).toBe(true)
      })

      it('should return false for non-empty path', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['field'],
        })

        expect(ctx.isRoot).toBe(false)
      })
    })

    describe('name', () => {
      it('should return last path segment if string', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['parent', 'child'],
        })

        expect(ctx.name).toBe('child')
      })

      it('should return undefined for numeric last segment', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['items', 0],
        })

        expect(ctx.name).toBeUndefined()
      })

      it('should return undefined for empty path', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.name).toBeUndefined()
      })
    })

    describe('widgetName', () => {
      it('should return dot-separated path', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['parent', 'child', 'field'],
        })

        expect(ctx.widgetName).toBe('parent.child.field')
      })

      it('should handle numeric segments', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['items', 0, 'name'],
        })

        expect(ctx.widgetName).toBe('items.0.name')
      })

      it('should return empty string for empty path', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.widgetName).toBe('')
      })
    })

    describe('resolvedType', () => {
      it('should return single type', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.resolvedType).toBe('string')
      })

      it('should return array of types', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: ['string', 'null'] },
          path: [],
        })

        expect(ctx.resolvedType).toEqual(['string', 'null'])
      })

      it('should return null when no type', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: {} as TypeDefinition,
          path: [],
        })

        expect(ctx.resolvedType).toBeNull()
      })

      it('should resolve $ref in type', () => {
        const schema: JSONStructureSchema = {
          ...baseSchema,
          definitions: {
            StringType: { type: 'string' },
          },
        }
        const ctx = new StructureContext({
          schema,
          definition: { type: { $ref: '#/definitions/StringType' } },
          path: [],
        })

        expect(ctx.resolvedType).toBe('string')
      })
    })

    describe('primaryType', () => {
      it('should return single non-null type', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.primaryType).toBe('string')
      })

      it('should return first non-null from array', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: ['null', 'string'] },
          path: [],
        })

        expect(ctx.primaryType).toBe('string')
      })

      it('should return null for null-only type', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'null' },
          path: [],
        })

        expect(ctx.primaryType).toBeNull()
      })
    })

    describe('isNullable', () => {
      it('should return false for non-nullable type', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.isNullable).toBe(false)
      })

      it('should return true for nullable type array', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: ['string', 'null'] },
          path: [],
        })

        expect(ctx.isNullable).toBe(true)
      })
    })

    describe('isRequired / isOptional', () => {
      it('should reflect isPropertyRequired', () => {
        const requiredCtx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['field'],
          isPropertyRequired: true,
        })

        expect(requiredCtx.isRequired).toBe(true)
        expect(requiredCtx.isOptional).toBe(false)

        const optionalCtx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['field'],
          isPropertyRequired: false,
        })

        expect(optionalCtx.isRequired).toBe(false)
        expect(optionalCtx.isOptional).toBe(true)
      })
    })

    describe('isDeprecated', () => {
      it('should return true when deprecated is true', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string', deprecated: true },
          path: [],
        })

        expect(ctx.isDeprecated).toBe(true)
      })

      it('should return false when deprecated is not set', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.isDeprecated).toBe(false)
      })
    })

    describe('isAbstract', () => {
      it('should return true when abstract is true', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string', abstract: true },
          path: [],
        })

        expect(ctx.isAbstract).toBe(true)
      })

      it('should return false when abstract is not set', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.isAbstract).toBe(false)
      })
    })

    describe('isPrimitive', () => {
      it('should return true for primitive types', () => {
        const stringCtx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })
        expect(stringCtx.isPrimitive).toBe(true)

        const intCtx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'int32' },
          path: [],
        })
        expect(intCtx.isPrimitive).toBe(true)

        const boolCtx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'boolean' },
          path: [],
        })
        expect(boolCtx.isPrimitive).toBe(true)
      })

      it('should return false for non-primitive types', () => {
        const objectCtx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'object', properties: {} },
          path: [],
        })
        expect(objectCtx.isPrimitive).toBe(false)

        const arrayCtx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'array', items: { type: 'string' } },
          path: [],
        })
        expect(arrayCtx.isPrimitive).toBe(false)
      })
    })

    describe('description', () => {
      it('should return description from definition', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string', description: 'A test field' },
          path: [],
        })

        expect(ctx.description).toBe('A test field')
      })

      it('should return undefined when no description', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.description).toBeUndefined()
      })
    })

    describe('examples', () => {
      it('should return examples from definition', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string', examples: ['foo', 'bar'] },
          path: [],
        })

        expect(ctx.examples).toEqual(['foo', 'bar'])
      })

      it('should return undefined when no examples', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.examples).toBeUndefined()
      })
    })

    describe('defaultValue', () => {
      it('should return default from definition', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string', default: 'default value' },
          path: [],
        })

        expect(ctx.defaultValue).toBe('default value')
      })

      it('should return undefined when no default', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.defaultValue).toBeUndefined()
      })
    })

    describe('unit', () => {
      it('should return unit from definition', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'float64', unit: 'kg' },
          path: [],
        })

        expect(ctx.unit).toBe('kg')
      })
    })

    describe('currency', () => {
      it('should return currency from definition', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'decimal128', currency: 'USD' },
          path: [],
        })

        expect(ctx.currency).toBe('USD')
      })
    })

    describe('label', () => {
      it('should return locale-specific altname when available', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: {
            type: 'string',
            name: 'English Name',
            altnames: {
              'lang:es': 'Nombre en Español',
            },
          },
          path: ['field'],
          locale: 'es',
        })

        expect(ctx.label).toBe('Nombre en Español')
      })

      it('should return definition name when no locale match', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: {
            type: 'string',
            name: 'Custom Name',
          },
          path: ['field'],
        })

        expect(ctx.label).toBe('Custom Name')
      })

      it('should return humanized path name as fallback', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['some_field_name'],
        })

        expect(ctx.label).toBe('Some field name')
      })

      it('should return empty string for root with no name', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.label).toBe('')
      })
    })

    describe('altnames', () => {
      it('should return altnames from definition', () => {
        const altnames = { 'lang:es': 'Nombre', 'lang:fr': 'Nom' }
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string', altnames },
          path: [],
        })

        expect(ctx.altnames).toBe(altnames)
      })
    })

    describe('jsonPath', () => {
      it('should return slash-separated path', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['user', 'address', 'street'],
        })

        expect(ctx.jsonPath).toBe('/user/address/street')
      })

      it('should handle numeric segments', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: ['items', 0, 'name'],
        })

        expect(ctx.jsonPath).toBe('/items/0/name')
      })

      it('should return empty string for root', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.jsonPath).toBe('')
      })
    })

    describe('resolveRef', () => {
      it('should resolve definition references', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        const resolved = ctx.resolveRef('#/definitions/Email')
        expect(resolved).toBeDefined()
        expect(resolved?.type).toBe('string')
        expect(resolved?.format).toBe('email')
      })

      it('should resolve shorthand references', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        const resolved = ctx.resolveRef('Address')
        expect(resolved).toBeDefined()
        expect(resolved?.type).toBe('object')
      })
    })

    describe('hasEnum / enumValues', () => {
      it('should return true and values when enum present', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string', enum: ['a', 'b', 'c'] },
          path: [],
        })

        expect(ctx.hasEnum).toBe(true)
        expect(ctx.enumValues).toEqual(['a', 'b', 'c'])
      })

      it('should return false and undefined when no enum', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.hasEnum).toBe(false)
        expect(ctx.enumValues).toBeUndefined()
      })
    })

    describe('hasConst / constValue', () => {
      it('should return true and value when const present', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string', const: 'fixed' } as TypeDefinition,
          path: [],
        })

        expect(ctx.hasConst).toBe(true)
        expect(ctx.constValue).toBe('fixed')
      })

      it('should return false and undefined when no const', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.hasConst).toBe(false)
        expect(ctx.constValue).toBeUndefined()
      })
    })

    describe('format', () => {
      it('should return format when present', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string', format: 'email' },
          path: [],
        })

        expect(ctx.format).toBe('email')
      })

      it('should return undefined when no format', () => {
        const ctx = new StructureContext({
          schema: baseSchema,
          definition: { type: 'string' },
          path: [],
        })

        expect(ctx.format).toBeUndefined()
      })
    })
  })

  describe('createStructureContext', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleWarnSpy.mockRestore()
    })

    it('should create root context from schema with type', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      }

      const ctx = createStructureContext(schema)

      expect(ctx.isRoot).toBe(true)
      expect(ctx.path).toEqual([])
      expect(ctx.definition.type).toBe('object')
    })

    it('should create root context from schema with properties only', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        properties: {
          name: { type: 'string' },
        },
      } as JSONStructureSchema

      const ctx = createStructureContext(schema)

      expect(ctx.definition.properties).toBeDefined()
    })

    it('should resolve $root reference', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        $root: '#/definitions/MainForm',
        definitions: {
          MainForm: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
            },
          },
        },
      } as JSONStructureSchema

      const ctx = createStructureContext(schema)

      expect(ctx.definition.type).toBe('object')
      expect((ctx.definition as any).properties.email).toBeDefined()
    })

    it('should warn and fallback for invalid $root', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        $root: '#/definitions/NonExistent',
        definitions: {},
      } as JSONStructureSchema

      const ctx = createStructureContext(schema)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to resolve $root')
      )
    })

    it('should fallback to any type when no type or properties', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
      } as JSONStructureSchema

      const ctx = createStructureContext(schema)

      expect(ctx.definition.type).toBe('any')
    })

    it('should pass through options', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
      }

      const ctx = createStructureContext(schema, {
        readOnly: true,
        locale: 'de',
      })

      expect(ctx.readOnly).toBe(true)
      expect(ctx.locale).toBe('de')
    })
  })
})
