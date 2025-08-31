import { describe, it, expect } from 'vitest'
import {
  mergeAllOf,
  SchemaContext,
} from '../../src/components/json-schema/schema-context'
import type { JSONSchema7 } from 'json-schema'

describe('allOf merge strategy', () => {
  describe('mergeAllOf', () => {
    it('should merge simple schemas without conflicts', () => {
      const schemas: JSONSchema7[] = [
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
      const schemas: JSONSchema7[] = [{ type: 'string' }, { type: 'number' }]

      const result = mergeAllOf(schemas)

      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0]).toEqual({
        path: ['type'],
        message: 'Incompatible types in allOf: string, number',
        conflictingValues: ['string', 'number'],
      })
      expect(result.mergedSchema.type).toEqual(['string', 'number'])
    })

    it('should detect property conflicts', () => {
      const schemas: JSONSchema7[] = [
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
        message:
          'Property "name" has conflicting definitions in allOf branches',
        conflictingValues: [{ type: 'string' }, { type: 'number' }],
      })
      // Last definition wins
      expect(result.mergedSchema.properties?.name).toEqual({ type: 'number' })
    })

    it('should merge compatible types', () => {
      const schemas: JSONSchema7[] = [{ type: 'object' }, { type: 'object' }]

      const result = mergeAllOf(schemas)

      expect(result.conflicts).toHaveLength(0)
      expect(result.mergedSchema.type).toBe('object')
    })

    it('should union required arrays', () => {
      const schemas: JSONSchema7[] = [
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
      const schemas: JSONSchema7[] = [
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

    it('should handle complex nested merging', () => {
      const schemas: JSONSchema7[] = [
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

      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].message).toContain(
        'Property "user" has conflicting definitions'
      )

      // Should still merge the top-level properties and required
      expect(result.mergedSchema.required).toEqual(['user', 'metadata'])
      expect(result.mergedSchema.properties?.metadata).toEqual({
        type: 'object',
      })
    })

    it('should handle empty schemas array', () => {
      const result = mergeAllOf([])

      expect(result.conflicts).toHaveLength(0)
      expect(result.mergedSchema).toEqual({})
    })

    it('should handle single schema', () => {
      const schemas: JSONSchema7[] = [
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
      const schemas: JSONSchema7[] = [{ type: 'string' }, { type: 'number' }]

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
})
