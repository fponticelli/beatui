import { describe, it, expect } from 'vitest'
import { detectMismatches, type Mismatch } from '../../src/components/json-schema-display/mismatch'

describe('detectMismatches', () => {
  // Type mismatch
  describe('type-mismatch', () => {
    it('detects string where number expected', () => {
      const result = detectMismatches('hello', { type: 'number' })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('type-mismatch')
      expect(result[0].expected).toBe('number')
      expect(result[0].actual).toBe('string')
    })

    it('detects number where string expected', () => {
      const result = detectMismatches(42, { type: 'string' })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('type-mismatch')
    })

    it('detects object where array expected', () => {
      const result = detectMismatches({}, { type: 'array' })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('type-mismatch')
    })

    it('allows integer when number expected', () => {
      const result = detectMismatches(42, { type: 'number' })
      expect(result).toHaveLength(0)
    })

    it('handles union types', () => {
      const result = detectMismatches('hello', { type: ['number', 'boolean'] })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('type-mismatch')
    })

    it('passes for value matching union type', () => {
      const result = detectMismatches(42, { type: ['number', 'string'] })
      expect(result).toHaveLength(0)
    })

    it('passes for null in nullable type', () => {
      const result = detectMismatches(null, { type: ['string', 'null'] })
      expect(result).toHaveLength(0)
    })
  })

  // Missing required
  describe('missing-required', () => {
    it('detects missing required property', () => {
      const result = detectMismatches(
        { name: 'Alice' },
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
          },
          required: ['name', 'email'],
        }
      )
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('missing-required')
      expect(result[0].path).toEqual(['email'])
    })

    it('passes when all required present', () => {
      const result = detectMismatches(
        { name: 'Alice', email: 'a@b.com' },
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
          },
          required: ['name', 'email'],
        }
      )
      expect(result).toHaveLength(0)
    })
  })

  // Extra property
  describe('extra-property', () => {
    it('detects extra property when additionalProperties is false', () => {
      const result = detectMismatches(
        { name: 'Alice', age: 30 },
        {
          type: 'object',
          properties: { name: { type: 'string' } },
          additionalProperties: false,
        }
      )
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('extra-property')
      expect(result[0].path).toEqual(['age'])
    })

    it('allows extra properties when additionalProperties is true', () => {
      const result = detectMismatches(
        { name: 'Alice', age: 30 },
        {
          type: 'object',
          properties: { name: { type: 'string' } },
          additionalProperties: true,
        }
      )
      expect(result).toHaveLength(0)
    })

    it('allows properties matching patternProperties', () => {
      const result = detectMismatches(
        { name: 'Alice', x_custom: 'value' },
        {
          type: 'object',
          properties: { name: { type: 'string' } },
          patternProperties: { '^x_': { type: 'string' } },
          additionalProperties: false,
        }
      )
      expect(result).toHaveLength(0)
    })
  })

  // Enum mismatch
  describe('enum-mismatch', () => {
    it('detects value not in enum', () => {
      const result = detectMismatches('orange', {
        type: 'string',
        enum: ['red', 'green', 'blue'],
      })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('enum-mismatch')
    })

    it('passes for value in enum', () => {
      const result = detectMismatches('red', {
        type: 'string',
        enum: ['red', 'green', 'blue'],
      })
      expect(result).toHaveLength(0)
    })
  })

  // Const mismatch
  describe('const-mismatch', () => {
    it('detects value not matching const', () => {
      const result = detectMismatches('world', {
        type: 'string',
        const: 'hello',
      })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('const-mismatch')
    })

    it('passes for value matching const', () => {
      const result = detectMismatches('hello', {
        type: 'string',
        const: 'hello',
      })
      expect(result).toHaveLength(0)
    })
  })

  // Constraint violations
  describe('constraint-violation', () => {
    it('detects string shorter than minLength', () => {
      const result = detectMismatches('hi', {
        type: 'string',
        minLength: 5,
      })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('constraint-violation')
    })

    it('detects string longer than maxLength', () => {
      const result = detectMismatches('hello world', {
        type: 'string',
        maxLength: 5,
      })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('constraint-violation')
    })

    it('detects string not matching pattern', () => {
      const result = detectMismatches('abc', {
        type: 'string',
        pattern: '^\\d+$',
      })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('constraint-violation')
    })

    it('detects number below minimum', () => {
      const result = detectMismatches(3, {
        type: 'number',
        minimum: 5,
      })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('constraint-violation')
    })

    it('detects number above maximum', () => {
      const result = detectMismatches(15, {
        type: 'number',
        maximum: 10,
      })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('constraint-violation')
    })

    it('detects exclusiveMinimum violation', () => {
      const result = detectMismatches(5, {
        type: 'number',
        exclusiveMinimum: 5,
      })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('constraint-violation')
    })

    it('detects exclusiveMaximum violation', () => {
      const result = detectMismatches(10, {
        type: 'number',
        exclusiveMaximum: 10,
      })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('constraint-violation')
    })

    it('detects multipleOf violation', () => {
      const result = detectMismatches(7, {
        type: 'number',
        multipleOf: 3,
      })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('constraint-violation')
    })

    it('detects array shorter than minItems', () => {
      const result = detectMismatches([1], {
        type: 'array',
        minItems: 2,
      })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('constraint-violation')
    })

    it('detects array longer than maxItems', () => {
      const result = detectMismatches([1, 2, 3], {
        type: 'array',
        maxItems: 2,
      })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('constraint-violation')
    })
  })

  // Recursive detection
  describe('recursive detection', () => {
    it('detects mismatches in nested objects', () => {
      const result = detectMismatches(
        { user: { name: 42 } },
        {
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
      )
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('type-mismatch')
      expect(result[0].path).toEqual(['user', 'name'])
    })

    it('detects mismatches in array items', () => {
      const result = detectMismatches(
        [1, 'two', 3],
        {
          type: 'array',
          items: { type: 'number' },
        }
      )
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('type-mismatch')
      expect(result[0].path).toEqual([1])
    })

    it('detects mismatches in prefixItems', () => {
      const result = detectMismatches(
        ['hello', 'world'],
        {
          type: 'array',
          prefixItems: [
            { type: 'string' },
            { type: 'number' },
          ],
        }
      )
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('type-mismatch')
      expect(result[0].path).toEqual([1])
    })
  })

  // Edge cases
  describe('edge cases', () => {
    it('returns empty array for boolean true schema', () => {
      const result = detectMismatches('anything', true)
      expect(result).toHaveLength(0)
    })

    it('returns mismatch for boolean false schema', () => {
      const result = detectMismatches('anything', false)
      expect(result).toHaveLength(1)
    })

    it('handles undefined value gracefully', () => {
      const result = detectMismatches(undefined, { type: 'string' })
      expect(result).toHaveLength(0) // undefined skips type check
    })

    it('handles null value with non-null schema', () => {
      const result = detectMismatches(null, { type: 'string' })
      expect(result).toHaveLength(1)
      expect(result[0].kind).toBe('type-mismatch')
    })

    it('handles empty schema (no constraints)', () => {
      const result = detectMismatches({ any: 'value' }, {})
      expect(result).toHaveLength(0)
    })

    it('collects multiple mismatches in one object', () => {
      const result = detectMismatches(
        { age: 'not-a-number' },
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
          required: ['name', 'age'],
        }
      )
      // Missing 'name' + type mismatch on 'age'
      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(result.some(m => m.kind === 'missing-required')).toBe(true)
      expect(result.some(m => m.kind === 'type-mismatch')).toBe(true)
    })
  })
})
