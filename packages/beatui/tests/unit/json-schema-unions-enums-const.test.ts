import { describe, it, expect } from 'vitest'
import {
  SchemaContext,
  type JSONSchema,
} from '../../src/components/json-schema/schema-context'

describe('JSON Schema Unions, Enums, and Const', () => {
  describe('Union type detection', () => {
    it('should detect union types correctly', () => {
      const schema: JSONSchema = {
        type: ['string', 'number'],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.hasType('string')).toBe(true)
      expect(ctx.hasType('number')).toBe(true)
      expect(ctx.hasType('boolean')).toBe(false)
    })

    it('should detect primitive plus null unions', () => {
      const schema: JSONSchema = {
        type: ['string', 'null'],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.hasType('string')).toBe(true)
      expect(ctx.hasType('null')).toBe(true)
      expect(ctx.isNullable).toBe(true)
    })

    it('should handle complex union types', () => {
      const schema: JSONSchema = {
        type: ['string', 'number', 'boolean', 'null'],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.hasType('string')).toBe(true)
      expect(ctx.hasType('number')).toBe(true)
      expect(ctx.hasType('boolean')).toBe(true)
      expect(ctx.hasType('null')).toBe(true)
      expect(ctx.isNullable).toBe(true)
    })
  })

  describe('Enum handling', () => {
    it('should detect enum values correctly', () => {
      const schema: JSONSchema = {
        enum: ['option1', 'option2', 'option3'],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.hasEnumValue('option1')).toBe(true)
      expect(ctx.hasEnumValue('option2')).toBe(true)
      expect(ctx.hasEnumValue('option3')).toBe(true)
      expect(ctx.hasEnumValue('option4')).toBe(false)
      expect(ctx.hasEnumValue(null)).toBe(false)
    })

    it('should detect enum with null values', () => {
      const schema: JSONSchema = {
        enum: ['option1', 'option2', null],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.hasEnumValue('option1')).toBe(true)
      expect(ctx.hasEnumValue('option2')).toBe(true)
      expect(ctx.hasEnumValue(null)).toBe(true)
      expect(ctx.isNullable).toBe(true)
    })

    it('should handle mixed type enums', () => {
      const schema: JSONSchema = {
        enum: ['string_value', 42, true, null],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.hasEnumValue('string_value')).toBe(true)
      expect(ctx.hasEnumValue(42)).toBe(true)
      expect(ctx.hasEnumValue(true)).toBe(true)
      expect(ctx.hasEnumValue(null)).toBe(true)
      expect(ctx.isNullable).toBe(true)
    })

    it('should handle empty enum arrays', () => {
      const schema: JSONSchema = {
        enum: [],
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.hasEnumValue('anything')).toBe(false)
      expect(ctx.hasEnumValue(null)).toBe(false)
      expect(ctx.isNullable).toBe(false)
    })
  })

  describe('Const handling', () => {
    it('should detect const string values', () => {
      const schema: JSONSchema = {
        const: 'fixed_value',
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.hasConstValue('fixed_value')).toBe(true)
      expect(ctx.hasConstValue('other_value')).toBe(false)
      expect(ctx.hasConstValue(null)).toBe(false)
      expect(ctx.isNullable).toBe(false)
    })

    it('should detect const null values', () => {
      const schema: JSONSchema = {
        const: null,
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.hasConstValue(null)).toBe(true)
      expect(ctx.hasConstValue('anything')).toBe(false)
      expect(ctx.isNullable).toBe(true)
    })

    it('should detect const number values', () => {
      const schema: JSONSchema = {
        const: 42,
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.hasConstValue(42)).toBe(true)
      expect(ctx.hasConstValue(43)).toBe(false)
      expect(ctx.hasConstValue(null)).toBe(false)
      expect(ctx.isNullable).toBe(false)
    })

    it('should detect const boolean values', () => {
      const schema: JSONSchema = {
        const: true,
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['field'],
        isPropertyRequired: false,
      })

      expect(ctx.hasConstValue(true)).toBe(true)
      expect(ctx.hasConstValue(false)).toBe(false)
      expect(ctx.hasConstValue(null)).toBe(false)
      expect(ctx.isNullable).toBe(false)
    })
  })

  describe('anyOf and oneOf nullability', () => {
    it('should detect nullability in anyOf branches', () => {
      const schema: JSONSchema = {
        anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }],
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

    it('should detect nullability in oneOf branches', () => {
      const schema: JSONSchema = {
        oneOf: [{ type: 'string' }, { const: null }],
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

    it('should detect non-nullability when no null branches exist', () => {
      const schema: JSONSchema = {
        anyOf: [{ type: 'string' }, { type: 'number' }],
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

    it('should handle nested anyOf/oneOf nullability', () => {
      const schema: JSONSchema = {
        anyOf: [
          { type: 'string' },
          {
            oneOf: [{ type: 'number' }, { type: 'null' }],
          },
        ],
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

  describe('Schema context properties', () => {
    it('should provide correct widget labels', () => {
      const schema: JSONSchema = {
        type: 'string',
        title: 'Custom Title',
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['fieldName'],
        isPropertyRequired: false,
      })

      expect(ctx.widgetLabel).toBe('Custom Title')
      expect(ctx.name).toBe('fieldName')
      expect(ctx.widgetName).toBe('fieldName')
    })

    it('should fall back to humanized field name when no title', () => {
      const schema: JSONSchema = {
        type: 'string',
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['user_name'],
        isPropertyRequired: false,
      })

      expect(ctx.widgetLabel).toBe('User name')
      expect(ctx.name).toBe('user_name')
    })

    it('should handle nested paths correctly', () => {
      const schema: JSONSchema = {
        type: 'string',
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: ['user', 'profile', 'name'],
        isPropertyRequired: false,
      })

      expect(ctx.widgetName).toBe('user.profile.name')
      expect(ctx.name).toBe('name')
      expect(ctx.isRoot).toBe(false)
    })

    it('should detect root level correctly', () => {
      const schema: JSONSchema = {
        type: 'string',
      }

      const ctx = new SchemaContext({
        schema,
        definition: schema,
        horizontal: false,
        path: [],
        isPropertyRequired: false,
      })

      expect(ctx.isRoot).toBe(true)
      expect(ctx.name).toBeUndefined()
    })
  })
})
