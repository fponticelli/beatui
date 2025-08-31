import { describe, it, expect } from 'vitest'
import { SchemaContext } from '../../src/components/json-schema/schema-context'
import type { JSONSchema7 } from 'json-schema'

describe('JSON Schema Optionality and Nullability', () => {
  describe('SchemaContext optionality detection', () => {
    it('should detect required properties correctly', () => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          requiredField: { type: 'string' },
          optionalField: { type: 'string' },
        },
        required: ['requiredField'],
      }

      const requiredCtx = new SchemaContext({
        schema,
        definition: schema.properties!.requiredField,
        horizontal: false,
        path: ['requiredField'],
        isPropertyRequired: true,
      })

      const optionalCtx = new SchemaContext({
        schema,
        definition: schema.properties!.optionalField,
        horizontal: false,
        path: ['optionalField'],
        isPropertyRequired: false,
      })

      expect(requiredCtx.isOptional).toBe(false)
      expect(requiredCtx.shouldShowPresenceToggle).toBe(false)

      expect(optionalCtx.isOptional).toBe(true)
      expect(optionalCtx.shouldShowPresenceToggle).toBe(false) // Optional primitives don't show presence toggles
    })

    it('should not show presence toggle for root level properties', () => {
      const schema: JSONSchema7 = {
        type: 'string',
      }

      const rootCtx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: [],
        isPropertyRequired: false,
      })

      expect(rootCtx.isOptional).toBe(true)
      expect(rootCtx.shouldShowPresenceToggle).toBe(false) // Root level
    })
  })

  describe('SchemaContext nullability detection', () => {
    it('should detect nullable from union with null type', () => {
      const schema: JSONSchema7 = {
        type: ['string', 'null'],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isNullable).toBe(true)
    })

    it('should detect nullable from OpenAPI nullable extension', () => {
      const schema: JSONSchema7 = {
        type: 'string',
        nullable: true,
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isNullable).toBe(true)
    })

    it('should detect nullable from enum with null', () => {
      const schema: JSONSchema7 = {
        enum: ['option1', 'option2', null],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isNullable).toBe(true)
    })

    it('should detect nullable from const null', () => {
      const schema: JSONSchema7 = {
        const: null,
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isNullable).toBe(true)
    })

    it('should detect non-nullable for simple types', () => {
      const schema: JSONSchema7 = {
        type: 'string',
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isNullable).toBe(false)
    })

    it('should detect nullable from anyOf branches', () => {
      const schema: JSONSchema7 = {
        anyOf: [{ type: 'string' }, { type: 'null' }],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isNullable).toBe(true)
    })

    it('should detect nullable from oneOf branches', () => {
      const schema: JSONSchema7 = {
        oneOf: [{ type: 'string' }, { type: 'null' }],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isNullable).toBe(true)
    })
  })

  describe('Combined optionality and nullability', () => {
    it('should handle required nullable fields', () => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          field: { type: ['string', 'null'] },
        },
        required: ['field'],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema.properties!.field,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: true,
      })

      expect(ctx.isOptional).toBe(false)
      expect(ctx.isNullable).toBe(true)
      expect(ctx.shouldShowPresenceToggle).toBe(false)
    })

    it('should handle optional nullable fields', () => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          field: { type: ['string', 'null'] },
        },
        // field is not in required array
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema.properties!.field,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isOptional).toBe(true)
      expect(ctx.isNullable).toBe(true)
      expect(ctx.isPrimitive).toBe(false) // Unions including null are treated as non-primitive
      expect(ctx.shouldShowPresenceToggle).toBe(true) // Show presence toggle for optional non-primitive
    })

    it('should handle optional non-nullable fields', () => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          field: { type: 'string' },
        },
        // field is not in required array
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema.properties!.field,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.isOptional).toBe(true)
      expect(ctx.isNullable).toBe(false)
      expect(ctx.shouldShowPresenceToggle).toBe(false) // Optional primitives don't show presence toggles
    })

    it('should handle required non-nullable fields', () => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          field: { type: 'string' },
        },
        required: ['field'],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema.properties!.field,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: true,
      })

      expect(ctx.isOptional).toBe(false)
      expect(ctx.isNullable).toBe(false)
      expect(ctx.shouldShowPresenceToggle).toBe(false)
    })

    it('should not show presence toggle for optional nullable primitives', () => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          stringField: { type: ['string', 'null'] },
          numberField: { type: ['number', 'null'] },
          booleanField: { type: ['boolean', 'null'] },
        },
        // None are required, so all are optional
      }

      const stringCtx = new SchemaContext({
        schema,
        definition: schema.properties!.stringField,
        horizontal: false,
        path: ['stringField'],
        isPropertyRequired: false,
      })

      const numberCtx = new SchemaContext({
        schema,
        definition: schema.properties!.numberField,
        horizontal: false,
        path: ['numberField'],
        isPropertyRequired: false,
      })

      const booleanCtx = new SchemaContext({
        schema,
        definition: schema.properties!.booleanField,
        horizontal: false,
        path: ['booleanField'],
        isPropertyRequired: false,
      })

      // All should be optional and nullable
      expect(stringCtx.isOptional).toBe(true)
      expect(stringCtx.isNullable).toBe(true)
      expect(stringCtx.isPrimitive).toBe(false)
      expect(stringCtx.shouldShowPresenceToggle).toBe(true) // Presence toggle shown for optional unions incl. null

      expect(numberCtx.isOptional).toBe(true)
      expect(numberCtx.isNullable).toBe(true)
      expect(numberCtx.isPrimitive).toBe(false)
      expect(numberCtx.shouldShowPresenceToggle).toBe(true) // Presence toggle shown for optional unions incl. null

      expect(booleanCtx.isOptional).toBe(true)
      expect(booleanCtx.isNullable).toBe(true)
      expect(booleanCtx.isPrimitive).toBe(false)
      expect(booleanCtx.shouldShowPresenceToggle).toBe(true) // Presence toggle shown for optional unions incl. null
    })

    it('should show presence toggle for optional non-nullable objects', () => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          nestedObject: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
        // nestedObject is not required, so it's optional
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema.properties!.nestedObject,
        horizontal: false,
        path: ['nestedObject'],
        isPropertyRequired: false,
      })

      expect(ctx.isOptional).toBe(true)
      expect(ctx.isNullable).toBe(false)
      expect(ctx.isPrimitive).toBe(false) // Object is not primitive
      expect(ctx.shouldShowPresenceToggle).toBe(true) // Should show presence toggle for non-primitive
    })
  })
})
