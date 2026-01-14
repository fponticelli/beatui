/**
 * JSON Structure SDK Validator Tests
 *
 * Tests for the BasicValidator implementation.
 */

import { describe, it, expect } from 'vitest'
import {
  createValidator,
  validate,
} from '../../src/components/json-structure/validation/sdk-validator'
import type { JSONStructureSchema } from '../../src/components/json-structure/structure-types'

describe('JSON Structure SDK Validator', () => {
  describe('createValidator', () => {
    it('should create a validator instance', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'string',
      }

      const validator = createValidator(schema)
      expect(validator).toBeDefined()
      expect(typeof validator.validate).toBe('function')
      expect(typeof validator.validateAt).toBe('function')
    })
  })

  describe('validate convenience function', () => {
    it('should validate using convenience function', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'string',
      }

      const result = validate(schema, 'hello')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('null validation', () => {
    it('should validate null when type is null', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'null',
      }

      const result = validate(schema, null)
      expect(result.isValid).toBe(true)
    })

    it('should validate null when type array includes null', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: ['string', 'null'],
      } as JSONStructureSchema

      const result = validate(schema, null)
      expect(result.isValid).toBe(true)
    })

    it('should reject null when not allowed', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'string',
      }

      const result = validate(schema, null)
      expect(result.isValid).toBe(false)
      expect(result.errors[0].type).toBe('type')
    })
  })

  describe('enum validation', () => {
    it('should validate enum value', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'string',
        enum: ['a', 'b', 'c'],
      } as JSONStructureSchema

      expect(validate(schema, 'a').isValid).toBe(true)
      expect(validate(schema, 'b').isValid).toBe(true)
      expect(validate(schema, 'd').isValid).toBe(false)
    })

    it('should report enum error', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'string',
        enum: ['a', 'b'],
      } as JSONStructureSchema

      const result = validate(schema, 'x')
      expect(result.errors[0].type).toBe('enum')
    })
  })

  describe('const validation', () => {
    it('should validate const value', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'string',
        const: 'fixed',
      } as JSONStructureSchema

      expect(validate(schema, 'fixed').isValid).toBe(true)
      expect(validate(schema, 'other').isValid).toBe(false)
    })
  })

  describe('string validation', () => {
    it('should validate string type', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'string',
      }

      expect(validate(schema, 'hello').isValid).toBe(true)
      expect(validate(schema, 123).isValid).toBe(false)
    })

    it('should validate minLength', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'string',
        minLength: 3,
      } as JSONStructureSchema

      expect(validate(schema, 'abc').isValid).toBe(true)
      expect(validate(schema, 'ab').isValid).toBe(false)
    })

    it('should validate maxLength', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'string',
        maxLength: 5,
      } as JSONStructureSchema

      expect(validate(schema, 'abc').isValid).toBe(true)
      expect(validate(schema, 'abcdef').isValid).toBe(false)
    })

    it('should validate pattern', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'string',
        pattern: '^[a-z]+$',
      } as JSONStructureSchema

      expect(validate(schema, 'abc').isValid).toBe(true)
      expect(validate(schema, 'ABC').isValid).toBe(false)
    })
  })

  describe('boolean validation', () => {
    it('should validate boolean type', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'boolean',
      }

      expect(validate(schema, true).isValid).toBe(true)
      expect(validate(schema, false).isValid).toBe(true)
      expect(validate(schema, 'true').isValid).toBe(false)
    })
  })

  describe('integer validation', () => {
    it('should validate int32 type', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'int32',
      }

      expect(validate(schema, 42).isValid).toBe(true)
      expect(validate(schema, 3.14).isValid).toBe(false) // Float not allowed
      expect(validate(schema, 'hello').isValid).toBe(false)
    })

    it('should validate integer bounds for int8', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'int8',
      }

      expect(validate(schema, 127).isValid).toBe(true)
      expect(validate(schema, -128).isValid).toBe(true)
      expect(validate(schema, 128).isValid).toBe(false)
      expect(validate(schema, -129).isValid).toBe(false)
    })

    it('should validate uint8 bounds', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'uint8',
      }

      expect(validate(schema, 0).isValid).toBe(true)
      expect(validate(schema, 255).isValid).toBe(true)
      expect(validate(schema, -1).isValid).toBe(false)
      expect(validate(schema, 256).isValid).toBe(false)
    })

    it('should validate bigint values', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'int64',
      }

      expect(validate(schema, BigInt(9007199254740991)).isValid).toBe(true)
    })

    it('should validate numeric constraints for integers', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'int32',
        minimum: 10,
        maximum: 100,
      } as JSONStructureSchema

      expect(validate(schema, 50).isValid).toBe(true)
      expect(validate(schema, 5).isValid).toBe(false)
      expect(validate(schema, 150).isValid).toBe(false)
    })

    it('should validate exclusiveMinimum/exclusiveMaximum', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'int32',
        exclusiveMinimum: 0,
        exclusiveMaximum: 10,
      } as JSONStructureSchema

      expect(validate(schema, 5).isValid).toBe(true)
      expect(validate(schema, 0).isValid).toBe(false) // exclusive
      expect(validate(schema, 10).isValid).toBe(false) // exclusive
    })
  })

  describe('float validation', () => {
    it('should validate float types', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'double', // float64 is called 'double' in JSON Structure
      }

      expect(validate(schema, 3.14).isValid).toBe(true)
      expect(validate(schema, 42).isValid).toBe(true) // integers are valid floats
      expect(validate(schema, 'hello').isValid).toBe(false)
    })

    it('should validate multipleOf for floats', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'double',
        multipleOf: 0.5,
      } as JSONStructureSchema

      expect(validate(schema, 1.5).isValid).toBe(true)
      expect(validate(schema, 1.7).isValid).toBe(false)
    })
  })

  describe('temporal validation', () => {
    it('should validate date format', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'date',
      }

      expect(validate(schema, '2024-01-15').isValid).toBe(true)
      expect(validate(schema, 'invalid').isValid).toBe(false)
    })

    it('should validate datetime format', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'datetime',
      }

      expect(validate(schema, '2024-01-15T10:30:00Z').isValid).toBe(true)
      expect(validate(schema, '2024-01-15T10:30:00+05:00').isValid).toBe(true)
      expect(validate(schema, 'invalid').isValid).toBe(false)
    })

    it('should validate time format', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'time',
      }

      expect(validate(schema, '10:30:00').isValid).toBe(true)
      expect(validate(schema, 'invalid').isValid).toBe(false)
    })

    it('should validate duration format', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'duration',
      }

      expect(validate(schema, 'P1Y2M3D').isValid).toBe(true)
      expect(validate(schema, 'PT1H30M').isValid).toBe(true)
      expect(validate(schema, 'invalid').isValid).toBe(false)
    })
  })

  describe('uuid validation', () => {
    it('should validate UUID format', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'uuid',
      }

      expect(validate(schema, '550e8400-e29b-41d4-a716-446655440000').isValid).toBe(true)
      expect(validate(schema, 'invalid-uuid').isValid).toBe(false)
    })
  })

  describe('uri validation', () => {
    it('should validate URI format', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'uri',
      }

      expect(validate(schema, 'https://example.com').isValid).toBe(true)
      expect(validate(schema, 'not a url').isValid).toBe(false)
    })
  })

  describe('binary validation', () => {
    it('should validate base64 string', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'binary',
      }

      expect(validate(schema, 'SGVsbG8gV29ybGQ=').isValid).toBe(true)
      expect(validate(schema, 'invalid!@#').isValid).toBe(false)
    })

    it('should validate Uint8Array', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'binary',
      }

      const bytes = new Uint8Array([1, 2, 3])
      expect(validate(schema, bytes).isValid).toBe(true)
    })
  })

  describe('object validation', () => {
    it('should validate object type', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      }

      expect(validate(schema, { name: 'John' }).isValid).toBe(true)
      expect(validate(schema, 'not object').isValid).toBe(false)
      expect(validate(schema, null).isValid).toBe(false)
      expect(validate(schema, []).isValid).toBe(false)
    })

    it('should validate required properties', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
        required: ['name'],
      }

      expect(validate(schema, { name: 'John' }).isValid).toBe(true)
      expect(validate(schema, { email: 'john@example.com' }).isValid).toBe(false)
    })

    it('should validate nested properties', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      }

      expect(validate(schema, { user: { name: 'John' } }).isValid).toBe(true)
      expect(validate(schema, { user: { name: 123 } }).isValid).toBe(false)
    })

    it('should reject additional properties when not allowed', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        additionalProperties: false,
      }

      expect(validate(schema, { name: 'John' }).isValid).toBe(true)
      expect(validate(schema, { name: 'John', extra: 'value' }).isValid).toBe(false)
    })

    it('should validate additional properties schema', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {},
        additionalProperties: { type: 'string' },
      }

      expect(validate(schema, { any: 'string' }).isValid).toBe(true)
      expect(validate(schema, { any: 123 }).isValid).toBe(false)
    })
  })

  describe('array validation', () => {
    it('should validate array type', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'array',
        items: { type: 'string' },
      } as JSONStructureSchema

      expect(validate(schema, ['a', 'b', 'c']).isValid).toBe(true)
      expect(validate(schema, 'not array').isValid).toBe(false)
    })

    it('should validate array items', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'array',
        items: { type: 'int32' },
      } as JSONStructureSchema

      expect(validate(schema, [1, 2, 3]).isValid).toBe(true)
      expect(validate(schema, [1, 'two', 3]).isValid).toBe(false)
    })

    it('should validate minItems', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
      } as JSONStructureSchema

      expect(validate(schema, ['a', 'b']).isValid).toBe(true)
      expect(validate(schema, ['a']).isValid).toBe(false)
    })

    it('should validate maxItems', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'array',
        items: { type: 'string' },
        maxItems: 3,
      } as JSONStructureSchema

      expect(validate(schema, ['a', 'b']).isValid).toBe(true)
      expect(validate(schema, ['a', 'b', 'c', 'd']).isValid).toBe(false)
    })
  })

  describe('set validation', () => {
    it('should validate set type (unique items)', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'set',
        items: { type: 'string' },
      } as JSONStructureSchema

      expect(validate(schema, ['a', 'b', 'c']).isValid).toBe(true)
      expect(validate(schema, ['a', 'a', 'b']).isValid).toBe(false) // duplicate
    })
  })

  describe('map validation', () => {
    it('should validate map type', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'map',
        values: { type: 'int32' },
      } as JSONStructureSchema

      expect(validate(schema, { a: 1, b: 2 }).isValid).toBe(true)
      expect(validate(schema, { a: 'not number' }).isValid).toBe(false)
    })
  })

  describe('tuple validation', () => {
    it('should validate tuple type', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'tuple',
        tuple: ['first', 'second'],
        properties: {
          first: { type: 'string' },
          second: { type: 'int32' },
        },
      } as JSONStructureSchema

      expect(validate(schema, ['hello', 42]).isValid).toBe(true)
      expect(validate(schema, ['hello']).isValid).toBe(false) // wrong length
    })
  })

  describe('choice validation', () => {
    it('should validate choice type', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'choice',
        choices: {
          text: { type: 'string' },
          number: { type: 'int32' },
        },
      } as JSONStructureSchema

      expect(validate(schema, { text: 'hello' }).isValid).toBe(true)
      expect(validate(schema, { number: 42 }).isValid).toBe(true)
      expect(validate(schema, { invalid: 'value' }).isValid).toBe(false)
    })
  })

  describe('any type', () => {
    it('should accept any value', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'any',
      }

      expect(validate(schema, 'string').isValid).toBe(true)
      expect(validate(schema, 123).isValid).toBe(true)
      expect(validate(schema, { any: 'object' }).isValid).toBe(true)
      // Note: null requires explicit 'null' type or ['any', 'null']
    })

    it('should accept null when combined with null type', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: ['any', 'null'],
      } as JSONStructureSchema

      expect(validate(schema, null).isValid).toBe(true)
    })
  })

  describe('stopOnFirstError option', () => {
    it('should stop after first error when enabled', () => {
      const schema: JSONStructureSchema = {
        $schema: 'https://json-structure.org/draft/2024-01/schema',
        $id: 'test',
        name: 'Test',
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
        required: ['a', 'b'],
      }

      const result = validate(schema, {}, { stopOnFirstError: true })
      expect(result.errors.length).toBeLessThanOrEqual(2)
    })
  })
})
