/**
 * JSON Structure Error Transform Tests
 *
 * Tests for validation error formatting and grouping utilities.
 */

import { describe, it, expect } from 'vitest'
import {
  formatValidationError,
  formatValidationErrors,
  groupErrorsByPath,
  getErrorsForPath,
  hasErrorsAtPath,
  getChildErrors,
  type RawValidationError,
  type FormattedValidationError,
} from '../../src/components/json-structure/validation/error-transform'
import type { TypeDefinition } from '../../src/components/json-structure/structure-types'

describe('JSON Structure Error Transform', () => {
  describe('formatValidationError', () => {
    describe('type errors', () => {
      it('should format type error', () => {
        const error: RawValidationError = {
          path: '/name',
          type: 'type',
          expected: 'string',
          actual: 123, // actual value is the actual value passed, formatTypeActual will call typeof on it
        }

        const result = formatValidationError(error)
        expect(result.path).toBe('/name')
        expect(result.code).toBe('type')
        expect(result.message).toContain('text') // 'string' is formatted as 'text'
        expect(result.message).toContain('number') // typeof 123 = 'number'
      })

      it('should format type error with array expected', () => {
        const error: RawValidationError = {
          path: '/value',
          type: 'type',
          expected: ['string', 'null'],
          actual: 'number',
        }

        const result = formatValidationError(error)
        expect(result.message).toContain('or')
      })

      it('should format type_mismatch error', () => {
        const error: RawValidationError = {
          path: '/field',
          type: 'type_mismatch',
          expected: 'int32',
        }

        const result = formatValidationError(error)
        expect(result.message).toContain('integer')
      })
    })

    describe('string validation errors', () => {
      it('should format minLength error', () => {
        const error: RawValidationError = {
          path: '/name',
          type: 'minLength',
          expected: 3,
          actual: 1,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be at least 3 characters')
      })

      it('should format maxLength error', () => {
        const error: RawValidationError = {
          path: '/name',
          type: 'maxLength',
          expected: 10,
          actual: 15,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be no more than 10 characters')
      })

      it('should format pattern error with known pattern', () => {
        const error: RawValidationError = {
          path: '/code',
          type: 'pattern',
          expected: '^[a-zA-Z]+$',
          actual: '123',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be letters only')
      })

      it('should format pattern error with definition description', () => {
        const error: RawValidationError = {
          path: '/code',
          type: 'pattern',
          expected: '^[A-Z]{2}[0-9]{4}$',
          actual: 'invalid',
        }

        const definition: TypeDefinition = {
          type: 'string',
          description: 'Product code (2 letters + 4 digits)',
        }

        const result = formatValidationError(error, definition)
        expect(result.message).toContain('Product code')
      })

      it('should format pattern error for unknown pattern', () => {
        const error: RawValidationError = {
          path: '/field',
          type: 'pattern',
          expected: '^custom-pattern$',
          actual: 'value',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Does not match required format')
      })
    })

    describe('format errors', () => {
      it('should format email format error', () => {
        const error: RawValidationError = {
          path: '/email',
          type: 'format',
          expected: 'email',
          actual: 'not-an-email',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be a valid email address')
      })

      it('should format uuid format error', () => {
        const error: RawValidationError = {
          path: '/id',
          type: 'format',
          expected: 'uuid',
          actual: 'invalid',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be a valid UUID')
      })

      it('should format uri format error', () => {
        const error: RawValidationError = {
          path: '/url',
          type: 'format',
          expected: 'uri',
          actual: 'not a url',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be a valid URL')
      })

      it('should format unknown format error', () => {
        const error: RawValidationError = {
          path: '/custom',
          type: 'format',
          expected: 'custom-format',
          actual: 'value',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be a valid custom-format')
      })
    })

    describe('numeric validation errors', () => {
      it('should format minimum error', () => {
        const error: RawValidationError = {
          path: '/age',
          type: 'minimum',
          expected: 18,
          actual: 16,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be at least 18')
      })

      it('should format maximum error', () => {
        const error: RawValidationError = {
          path: '/count',
          type: 'maximum',
          expected: 100,
          actual: 150,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be at most 100')
      })

      it('should format exclusiveMinimum error', () => {
        const error: RawValidationError = {
          path: '/value',
          type: 'exclusiveMinimum',
          expected: 0,
          actual: 0,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be greater than 0')
      })

      it('should format exclusiveMaximum error', () => {
        const error: RawValidationError = {
          path: '/value',
          type: 'exclusiveMaximum',
          expected: 10,
          actual: 10,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be less than 10')
      })

      it('should format multipleOf error', () => {
        const error: RawValidationError = {
          path: '/quantity',
          type: 'multipleOf',
          expected: 5,
          actual: 7,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be a multiple of 5')
      })

      it('should format integer_bounds error', () => {
        const error: RawValidationError = {
          path: '/value',
          type: 'integer_bounds',
          expected: { min: '-128', max: '127' },
          actual: '200',
          context: { type: 'int8' },
        }

        const result = formatValidationError(error)
        expect(result.message).toContain('between')
        expect(result.message).toContain('-128')
        expect(result.message).toContain('127')
      })
    })

    describe('array/set validation errors', () => {
      it('should format minItems error', () => {
        const error: RawValidationError = {
          path: '/items',
          type: 'minItems',
          expected: 1,
          actual: 0,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must have at least 1 items')
      })

      it('should format maxItems error', () => {
        const error: RawValidationError = {
          path: '/items',
          type: 'maxItems',
          expected: 5,
          actual: 10,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must have no more than 5 items')
      })

      it('should format uniqueItems error', () => {
        const error: RawValidationError = {
          path: '/items',
          type: 'uniqueItems',
          actual: 'duplicate',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('All items must be unique')
      })

      it('should format contains error', () => {
        const error: RawValidationError = {
          path: '/items',
          type: 'contains',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must contain at least one matching item')
      })

      it('should format minContains error', () => {
        const error: RawValidationError = {
          path: '/items',
          type: 'minContains',
          expected: 2,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must contain at least 2 matching items')
      })

      it('should format maxContains error', () => {
        const error: RawValidationError = {
          path: '/items',
          type: 'maxContains',
          expected: 3,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must contain no more than 3 matching items')
      })
    })

    describe('object validation errors', () => {
      it('should format required error', () => {
        const error: RawValidationError = {
          path: '/name',
          type: 'required',
          expected: 'name',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('This field is required')
      })

      it('should format minProperties error', () => {
        const error: RawValidationError = {
          path: '/obj',
          type: 'minProperties',
          expected: 1,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must have at least 1 properties')
      })

      it('should format maxProperties error', () => {
        const error: RawValidationError = {
          path: '/obj',
          type: 'maxProperties',
          expected: 5,
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must have no more than 5 properties')
      })

      it('should format additionalProperties error', () => {
        const error: RawValidationError = {
          path: '/obj',
          type: 'additionalProperties',
          actual: 'extraField',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Unknown property: extraField')
      })

      it('should format dependentRequired error', () => {
        const error: RawValidationError = {
          path: '/obj',
          type: 'dependentRequired',
          context: {
            dependent: 'email',
            required: ['confirmEmail'],
          },
        }

        const result = formatValidationError(error)
        expect(result.message).toContain('email')
        expect(result.message).toContain('confirmEmail')
      })
    })

    describe('enum/const errors', () => {
      it('should format enum error with few values', () => {
        const error: RawValidationError = {
          path: '/status',
          type: 'enum',
          expected: ['active', 'inactive'],
          actual: 'unknown',
        }

        const result = formatValidationError(error)
        expect(result.message).toContain('active')
        expect(result.message).toContain('inactive')
      })

      it('should format enum error with many values', () => {
        const error: RawValidationError = {
          path: '/country',
          type: 'enum',
          expected: ['US', 'UK', 'CA', 'AU', 'NZ', 'DE'],
          actual: 'XX',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Invalid value')
      })

      it('should format const error', () => {
        const error: RawValidationError = {
          path: '/version',
          type: 'const',
          expected: '1.0.0',
          actual: '2.0.0',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Must be exactly "1.0.0"')
      })
    })

    describe('reference errors', () => {
      it('should format ref_not_found error', () => {
        const error: RawValidationError = {
          path: '/field',
          type: 'ref_not_found',
          expected: '#/definitions/Missing',
        }

        const result = formatValidationError(error)
        expect(result.message).toContain('Invalid reference')
      })

      it('should format circular_ref error', () => {
        const error: RawValidationError = {
          path: '/field',
          type: 'circular_ref',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Circular reference detected')
      })
    })

    describe('generic errors', () => {
      it('should format invalid error', () => {
        const error: RawValidationError = {
          path: '/field',
          type: 'invalid',
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Invalid value')
      })

      it('should use context message for unknown errors', () => {
        const error: RawValidationError = {
          path: '/field',
          type: 'custom_error',
          context: { message: 'Custom error message' },
        }

        const result = formatValidationError(error)
        expect(result.message).toBe('Custom error message')
      })

      it('should format unknown error type', () => {
        const error: RawValidationError = {
          path: '/field',
          type: 'unknown_type',
        }

        const result = formatValidationError(error)
        expect(result.message).toContain('unknown_type')
      })
    })
  })

  describe('formatValidationErrors', () => {
    it('should format multiple errors', () => {
      const errors: RawValidationError[] = [
        { path: '/name', type: 'required', expected: 'name' },
        { path: '/age', type: 'minimum', expected: 0, actual: -1 },
      ]

      const result = formatValidationErrors(errors)
      expect(result).toHaveLength(2)
      expect(result[0].path).toBe('/name')
      expect(result[1].path).toBe('/age')
    })

    it('should use definitions map when provided', () => {
      const errors: RawValidationError[] = [
        { path: '/code', type: 'pattern', expected: '^[A-Z]{3}$', actual: 'invalid' },
      ]

      const definitions = new Map<string, TypeDefinition>([
        ['/code', { type: 'string', description: 'Airport code' }],
      ])

      const result = formatValidationErrors(errors, definitions)
      expect(result[0].message).toContain('Airport code')
    })
  })

  describe('groupErrorsByPath', () => {
    it('should group errors by path', () => {
      const errors: FormattedValidationError[] = [
        { path: '/name', message: 'Required', code: 'required' },
        { path: '/name', message: 'Too short', code: 'minLength' },
        { path: '/email', message: 'Invalid', code: 'format' },
      ]

      const grouped = groupErrorsByPath(errors)
      expect(grouped.get('/name')).toHaveLength(2)
      expect(grouped.get('/email')).toHaveLength(1)
    })

    it('should return empty map for empty errors', () => {
      const grouped = groupErrorsByPath([])
      expect(grouped.size).toBe(0)
    })
  })

  describe('getErrorsForPath', () => {
    it('should return errors for specific path', () => {
      const errors: FormattedValidationError[] = [
        { path: '/name', message: 'Required', code: 'required' },
        { path: '/email', message: 'Invalid', code: 'format' },
        { path: '/name', message: 'Too short', code: 'minLength' },
      ]

      const result = getErrorsForPath(errors, '/name')
      expect(result).toHaveLength(2)
    })

    it('should return empty array for non-existent path', () => {
      const errors: FormattedValidationError[] = [
        { path: '/name', message: 'Required', code: 'required' },
      ]

      const result = getErrorsForPath(errors, '/missing')
      expect(result).toHaveLength(0)
    })
  })

  describe('hasErrorsAtPath', () => {
    it('should return true when errors exist at path', () => {
      const errors: FormattedValidationError[] = [
        { path: '/name', message: 'Required', code: 'required' },
      ]

      expect(hasErrorsAtPath(errors, '/name')).toBe(true)
    })

    it('should return false when no errors at path', () => {
      const errors: FormattedValidationError[] = [
        { path: '/name', message: 'Required', code: 'required' },
      ]

      expect(hasErrorsAtPath(errors, '/email')).toBe(false)
    })
  })

  describe('getChildErrors', () => {
    it('should return child errors', () => {
      const errors: FormattedValidationError[] = [
        { path: '/user/name', message: 'Required', code: 'required' },
        { path: '/user/email', message: 'Invalid', code: 'format' },
        { path: '/other', message: 'Other', code: 'other' },
      ]

      const result = getChildErrors(errors, '/user')
      expect(result).toHaveLength(2)
    })

    it('should handle root path', () => {
      const errors: FormattedValidationError[] = [
        { path: '/name', message: 'Required', code: 'required' },
        { path: '/email', message: 'Invalid', code: 'format' },
      ]

      const result = getChildErrors(errors, '')
      expect(result).toHaveLength(2)
    })

    it('should not include exact path match', () => {
      const errors: FormattedValidationError[] = [
        { path: '/user', message: 'Invalid', code: 'type' },
        { path: '/user/name', message: 'Required', code: 'required' },
      ]

      const result = getChildErrors(errors, '/user')
      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('/user/name')
    })
  })
})
