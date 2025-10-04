import { describe, it, expect } from 'vitest'
import {
  mergeAllOf,
  SchemaContext,
  evaluateNotViolation,
  JSONSchema,
} from '../../src/components/json-schema/schema-context'
import Ajv from 'ajv'

describe('allOf merge strategy', () => {
  describe('mergeAllOf', () => {
    it('should merge simple schemas without conflicts', () => {
      const schemas: JSONSchema[] = [
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
        },
        {
          type: 'object',
          properties: {
            age: { type: 'number' },
          },
          required: ['age'],
        },
      ]

      const result = mergeAllOf(schemas)

      expect(result.conflicts).toHaveLength(0)
      expect(result.mergedSchema).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name', 'age'],
      })
    })

    it('should detect type conflicts', () => {
      const schemas: JSONSchema[] = [{ type: 'string' }, { type: 'number' }]

      const result = mergeAllOf(schemas)

      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0]).toEqual({
        path: ['type'],
        message: 'Incompatible types in allOf (no common types)',
        conflictingValues: [['string'], ['number', 'integer']],
      })
      // When there are no common types, the merged schema doesn't have a type property
      expect(result.mergedSchema.type).toBeUndefined()
    })

    it('should detect property conflicts', () => {
      const schemas: JSONSchema[] = [
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        {
          type: 'object',
          properties: {
            name: { type: 'number' },
          },
        },
      ]

      const result = mergeAllOf(schemas)

      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0]).toEqual({
        path: ['properties', 'name'],
        message: 'Property "name" has conflicting types: string vs number',
        conflictingValues: [{ type: 'string' }, { type: 'number' }],
      })
      // Last definition wins
      expect(result.mergedSchema.properties?.name).toEqual({ type: 'number' })
    })

    it('should merge compatible types', () => {
      const schemas: JSONSchema[] = [{ type: 'object' }, { type: 'object' }]

      const result = mergeAllOf(schemas)

      expect(result.conflicts).toHaveLength(0)
      expect(result.mergedSchema.type).toBe('object')
    })

    it('should union required arrays', () => {
      const schemas: JSONSchema[] = [
        {
          type: 'object',
          required: ['name', 'email'],
        },
        {
          type: 'object',
          required: ['age', 'email'], // email is duplicated
        },
      ]

      const result = mergeAllOf(schemas)

      expect(result.conflicts).toHaveLength(0)
      expect(result.mergedSchema.required).toEqual(['name', 'email', 'age'])
    })

    it('should merge other schema properties', () => {
      const schemas: JSONSchema[] = [
        {
          type: 'object',
          title: 'First Schema',
          description: 'First description',
        },
        {
          type: 'object',
          title: 'Second Schema', // This should override
          additionalProperties: false,
        },
      ]

      const result = mergeAllOf(schemas)

      expect(result.conflicts).toHaveLength(0)
      expect(result.mergedSchema).toEqual({
        type: 'object',
        title: 'Second Schema', // Later wins
        description: 'First description',
        additionalProperties: false,
      })
    })

    it('should merge compatible nested object properties', () => {
      const schemas: JSONSchema[] = [
        {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
              required: ['name'],
            },
          },
          required: ['user'],
        },
        {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                age: { type: 'number' },
              },
              required: ['age'],
            },
            metadata: { type: 'object' },
          },
          required: ['metadata'],
        },
      ]

      const result = mergeAllOf(schemas)

      expect(result.conflicts).toHaveLength(0)

      // Should merge the nested user properties and required arrays
      expect(result.mergedSchema.required).toEqual(['user', 'metadata'])
      expect(result.mergedSchema.properties?.metadata).toEqual({
        type: 'object',
      })
      expect(result.mergedSchema.properties?.user).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name', 'age'],
      })
    })

    it('should handle empty schemas array', () => {
      const result = mergeAllOf([])

      expect(result.conflicts).toHaveLength(0)
      expect(result.mergedSchema).toEqual({})
    })

    it('should handle single schema', () => {
      const schemas: JSONSchema[] = [
        {
          type: 'string',
          minLength: 5,
        },
      ]

      const result = mergeAllOf(schemas)

      expect(result.conflicts).toHaveLength(0)
      expect(result.mergedSchema).toEqual({
        type: 'string',
        minLength: 5,
      })
    })

    it('should include base path in conflict paths', () => {
      const schemas: JSONSchema[] = [{ type: 'string' }, { type: 'number' }]

      const result = mergeAllOf(schemas, ['user', 'profile'])

      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].path).toEqual(['user', 'profile', 'type'])
    })
  })

  describe('SchemaContext integration', () => {
    it('should properly track conflicts through context chain', () => {
      const initialConflicts = [
        {
          path: ['existing'],
          message: 'Existing conflict',
          conflictingValues: ['a', 'b'],
        },
      ]

      const ctx = new SchemaContext({
        schema: { type: 'object' },
        definition: { type: 'object' },
        horizontal: false,
        path: ['root'],
        schemaConflicts: initialConflicts,
      })

      const newConflicts = [
        {
          path: ['new'],
          message: 'New conflict',
          conflictingValues: ['x', 'y'],
        },
      ]

      const updatedCtx = ctx.with({
        schemaConflicts: [...ctx.schemaConflicts, ...newConflicts],
      })

      expect(updatedCtx.schemaConflicts).toHaveLength(2)
      expect(updatedCtx.schemaConflicts[0]).toEqual(initialConflicts[0])
      expect(updatedCtx.schemaConflicts[1]).toEqual(newConflicts[0])
    })
  })

  describe('evaluateNotViolation', () => {
    const ajv = new Ajv()

    it('should return null when value does not match not schema', () => {
      const notSchema: JSONSchema = {
        type: 'string',
        enum: ['admin', 'root'],
      }

      const result = evaluateNotViolation(notSchema, 'user', ajv)

      expect(result).toBeNull()
    })

    it('should return violation when value matches not schema', () => {
      const notSchema: JSONSchema = {
        title: 'reserved word',
        type: 'string',
        enum: ['admin', 'root'],
      }

      const result = evaluateNotViolation(notSchema, 'admin', ajv, ['username'])

      expect(result).toEqual({
        path: ['username'],
        message: 'Value matches reserved word',
        notSchema,
      })
    })

    it('should use default title when not schema has no title', () => {
      const notSchema: JSONSchema = {
        type: 'number',
        minimum: 13,
        maximum: 17,
      }

      const result = evaluateNotViolation(notSchema, 15, ajv)

      expect(result).toEqual({
        path: [],
        message: 'Value matches disallowed schema',
        notSchema,
      })
    })

    it('should return null when ajv is not provided', () => {
      const notSchema: JSONSchema = {
        type: 'string',
        enum: ['admin'],
      }

      const result = evaluateNotViolation(notSchema, 'admin', undefined)

      expect(result).toBeNull()
    })

    it('should handle complex not schemas', () => {
      const notSchema: JSONSchema = {
        title: 'empty profile',
        type: 'object',
        properties: {
          bio: { type: 'string', maxLength: 0 },
          website: { type: 'string', maxLength: 0 },
        },
        additionalProperties: false,
      }

      const emptyProfile = { bio: '', website: '' }
      const result = evaluateNotViolation(notSchema, emptyProfile, ajv, [
        'profile',
      ])

      expect(result).toEqual({
        path: ['profile'],
        message: 'Value matches empty profile',
        notSchema,
      })
    })

    it('should return null for valid complex objects', () => {
      const notSchema: JSONSchema = {
        title: 'empty profile',
        type: 'object',
        properties: {
          bio: { type: 'string', maxLength: 0 },
          website: { type: 'string', maxLength: 0 },
        },
        additionalProperties: false,
      }

      const validProfile = {
        bio: 'Hello world',
        website: 'https://example.com',
      }
      const result = evaluateNotViolation(notSchema, validProfile, ajv)

      expect(result).toBeNull()
    })
  })
})
