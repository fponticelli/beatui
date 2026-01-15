/**
 * JSON Structure Types Tests
 *
 * Tests for type definitions, type guards, and utility functions.
 */

import { describe, it, expect } from 'vitest'
import {
  // Type guards
  isBigIntType,
  isIntegerType,
  isFloatType,
  isNumericType,
  isTemporalType,
  isPrimitiveType,
  isCompoundType,
  isTypeReference,
  isNamespace,
  isTypeDefinition,
  isObjectTypeDefinition,
  isArrayTypeDefinition,
  isSetTypeDefinition,
  isMapTypeDefinition,
  isTupleTypeDefinition,
  isChoiceTypeDefinition,
  hasEnumValue,
  hasConstValue,
  // Utility functions
  getResolvedType,
  isNullableType,
  getNonNullTypes,
  // Constants
  INTEGER_BOUNDS,
  // Types
  type TypeDefinition,
  type ChoiceTypeDefinition,
} from '../../src/components/json-structure/structure-types'

describe('JSON Structure Types', () => {
  describe('Type Classification Guards', () => {
    describe('isBigIntType', () => {
      it('should identify 64-bit and 128-bit integer types as BigInt', () => {
        expect(isBigIntType('int64')).toBe(true)
        expect(isBigIntType('int128')).toBe(true)
        expect(isBigIntType('uint64')).toBe(true)
        expect(isBigIntType('uint128')).toBe(true)
      })

      it('should not identify smaller integer types as BigInt', () => {
        expect(isBigIntType('int8')).toBe(false)
        expect(isBigIntType('int16')).toBe(false)
        expect(isBigIntType('int32')).toBe(false)
        expect(isBigIntType('uint8')).toBe(false)
        expect(isBigIntType('uint16')).toBe(false)
        expect(isBigIntType('uint32')).toBe(false)
      })

      it('should not identify non-integer types as BigInt', () => {
        expect(isBigIntType('string')).toBe(false)
        expect(isBigIntType('float')).toBe(false)
        expect(isBigIntType('double')).toBe(false)
      })
    })

    describe('isIntegerType', () => {
      it('should identify all signed integer types', () => {
        expect(isIntegerType('int8')).toBe(true)
        expect(isIntegerType('int16')).toBe(true)
        expect(isIntegerType('int32')).toBe(true)
        expect(isIntegerType('int64')).toBe(true)
        expect(isIntegerType('int128')).toBe(true)
      })

      it('should identify all unsigned integer types', () => {
        expect(isIntegerType('uint8')).toBe(true)
        expect(isIntegerType('uint16')).toBe(true)
        expect(isIntegerType('uint32')).toBe(true)
        expect(isIntegerType('uint64')).toBe(true)
        expect(isIntegerType('uint128')).toBe(true)
      })

      it('should not identify float types as integer', () => {
        expect(isIntegerType('float')).toBe(false)
        expect(isIntegerType('double')).toBe(false)
        expect(isIntegerType('decimal')).toBe(false)
      })

      it('should not identify other types as integer', () => {
        expect(isIntegerType('string')).toBe(false)
        expect(isIntegerType('boolean')).toBe(false)
        expect(isIntegerType('object')).toBe(false)
      })
    })

    describe('isFloatType', () => {
      it('should identify floating-point types', () => {
        expect(isFloatType('float')).toBe(true)
        expect(isFloatType('double')).toBe(true)
        expect(isFloatType('decimal')).toBe(true)
      })

      it('should not identify integer types as float', () => {
        expect(isFloatType('int32')).toBe(false)
        expect(isFloatType('uint8')).toBe(false)
      })

      it('should not identify other types as float', () => {
        expect(isFloatType('string')).toBe(false)
        expect(isFloatType('boolean')).toBe(false)
      })
    })

    describe('isNumericType', () => {
      it('should identify all numeric types', () => {
        expect(isNumericType('int8')).toBe(true)
        expect(isNumericType('int32')).toBe(true)
        expect(isNumericType('uint64')).toBe(true)
        expect(isNumericType('float')).toBe(true)
        expect(isNumericType('double')).toBe(true)
        expect(isNumericType('decimal')).toBe(true)
      })

      it('should not identify non-numeric types', () => {
        expect(isNumericType('string')).toBe(false)
        expect(isNumericType('boolean')).toBe(false)
        expect(isNumericType('date')).toBe(false)
        expect(isNumericType('object')).toBe(false)
      })
    })

    describe('isTemporalType', () => {
      it('should identify temporal types', () => {
        expect(isTemporalType('date')).toBe(true)
        expect(isTemporalType('datetime')).toBe(true)
        expect(isTemporalType('time')).toBe(true)
        expect(isTemporalType('duration')).toBe(true)
      })

      it('should not identify non-temporal types', () => {
        expect(isTemporalType('string')).toBe(false)
        expect(isTemporalType('int32')).toBe(false)
        expect(isTemporalType('timestamp')).toBe(false)
      })
    })

    describe('isPrimitiveType', () => {
      it('should identify string and boolean as primitive', () => {
        expect(isPrimitiveType('string')).toBe(true)
        expect(isPrimitiveType('boolean')).toBe(true)
        expect(isPrimitiveType('null')).toBe(true)
      })

      it('should identify numeric types as primitive', () => {
        expect(isPrimitiveType('int32')).toBe(true)
        expect(isPrimitiveType('float')).toBe(true)
        expect(isPrimitiveType('decimal')).toBe(true)
      })

      it('should identify temporal types as primitive', () => {
        expect(isPrimitiveType('date')).toBe(true)
        expect(isPrimitiveType('datetime')).toBe(true)
        expect(isPrimitiveType('time')).toBe(true)
        expect(isPrimitiveType('duration')).toBe(true)
      })

      it('should identify special types as primitive', () => {
        expect(isPrimitiveType('uuid')).toBe(true)
        expect(isPrimitiveType('uri')).toBe(true)
        expect(isPrimitiveType('binary')).toBe(true)
      })

      it('should not identify compound types as primitive', () => {
        expect(isPrimitiveType('object')).toBe(false)
        expect(isPrimitiveType('array')).toBe(false)
        expect(isPrimitiveType('map')).toBe(false)
      })
    })

    describe('isCompoundType', () => {
      it('should identify compound types', () => {
        expect(isCompoundType('object')).toBe(true)
        expect(isCompoundType('array')).toBe(true)
        expect(isCompoundType('set')).toBe(true)
        expect(isCompoundType('map')).toBe(true)
        expect(isCompoundType('tuple')).toBe(true)
        expect(isCompoundType('choice')).toBe(true)
        expect(isCompoundType('any')).toBe(true)
      })

      it('should not identify primitive types as compound', () => {
        expect(isCompoundType('string')).toBe(false)
        expect(isCompoundType('int32')).toBe(false)
        expect(isCompoundType('boolean')).toBe(false)
      })
    })
  })

  describe('Type Reference Detection', () => {
    describe('isTypeReference', () => {
      it('should identify type references with $ref', () => {
        expect(isTypeReference({ $ref: '#/definitions/User' })).toBe(true)
        expect(isTypeReference({ $ref: 'other-schema#/definitions/Item' })).toBe(true)
      })

      it('should not identify non-references', () => {
        expect(isTypeReference({ type: 'string' })).toBe(false)
        expect(isTypeReference({ name: 'User' })).toBe(false)
        expect(isTypeReference(null)).toBe(false)
        expect(isTypeReference('string')).toBe(false)
        expect(isTypeReference(undefined)).toBe(false)
      })
    })
  })

  describe('Definition Type Guards', () => {
    describe('isNamespace', () => {
      it('should identify namespaces', () => {
        expect(isNamespace({ User: { type: 'object', properties: {} } })).toBe(true)
        expect(isNamespace({ nested: { deeper: { type: 'string' } } })).toBe(true)
      })

      it('should not identify type definitions as namespaces', () => {
        expect(isNamespace({ type: 'object', properties: {} })).toBe(false)
        expect(isNamespace({ $ref: '#/definitions/User' })).toBe(false)
        expect(isNamespace({ enum: ['a', 'b'] })).toBe(false)
        expect(isNamespace({ const: 'fixed' })).toBe(false)
      })

      it('should not identify non-objects as namespaces', () => {
        expect(isNamespace(null)).toBe(false)
        expect(isNamespace('string')).toBe(false)
        expect(isNamespace(123)).toBe(false)
      })
    })

    describe('isTypeDefinition', () => {
      it('should identify definitions with type', () => {
        expect(isTypeDefinition({ type: 'string' })).toBe(true)
        expect(isTypeDefinition({ type: 'object', properties: {} })).toBe(true)
        expect(isTypeDefinition({ type: ['string', 'null'] })).toBe(true)
      })

      it('should identify definitions with $ref', () => {
        expect(isTypeDefinition({ $ref: '#/definitions/User' })).toBe(true)
      })

      it('should identify definitions with enum', () => {
        expect(isTypeDefinition({ enum: ['a', 'b', 'c'] })).toBe(true)
      })

      it('should identify definitions with const', () => {
        expect(isTypeDefinition({ const: 'fixed-value' })).toBe(true)
      })

      it('should not identify non-definitions', () => {
        expect(isTypeDefinition({})).toBe(false)
        expect(isTypeDefinition({ name: 'something' })).toBe(false)
        expect(isTypeDefinition(null)).toBe(false)
      })
    })

    describe('isObjectTypeDefinition', () => {
      it('should identify object definitions', () => {
        const def: TypeDefinition = {
          type: 'object',
          properties: { name: { type: 'string' } },
        }
        expect(isObjectTypeDefinition(def)).toBe(true)
      })

      it('should not identify object without properties', () => {
        const def: TypeDefinition = { type: 'object' }
        expect(isObjectTypeDefinition(def)).toBe(false)
      })

      it('should not identify non-object types', () => {
        const def: TypeDefinition = { type: 'string' }
        expect(isObjectTypeDefinition(def)).toBe(false)
      })
    })

    describe('isArrayTypeDefinition', () => {
      it('should identify array definitions', () => {
        const def: TypeDefinition = {
          type: 'array',
          items: { type: 'string' },
        }
        expect(isArrayTypeDefinition(def)).toBe(true)
      })

      it('should not identify array without items', () => {
        const def: TypeDefinition = { type: 'array' }
        expect(isArrayTypeDefinition(def)).toBe(false)
      })
    })

    describe('isSetTypeDefinition', () => {
      it('should identify set definitions', () => {
        const def: TypeDefinition = {
          type: 'set',
          items: { type: 'string' },
        }
        expect(isSetTypeDefinition(def)).toBe(true)
      })

      it('should not identify set without items', () => {
        const def: TypeDefinition = { type: 'set' }
        expect(isSetTypeDefinition(def)).toBe(false)
      })
    })

    describe('isMapTypeDefinition', () => {
      it('should identify map definitions', () => {
        const def: TypeDefinition = {
          type: 'map',
          values: { type: 'int32' },
        }
        expect(isMapTypeDefinition(def)).toBe(true)
      })

      it('should not identify map without values', () => {
        const def: TypeDefinition = { type: 'map' }
        expect(isMapTypeDefinition(def)).toBe(false)
      })
    })

    describe('isTupleTypeDefinition', () => {
      it('should identify tuple definitions', () => {
        const def: TypeDefinition = {
          type: 'tuple',
          properties: { x: { type: 'int32' }, y: { type: 'int32' } },
          tuple: ['x', 'y'],
        }
        expect(isTupleTypeDefinition(def)).toBe(true)
      })

      it('should not identify tuple without tuple array', () => {
        const def: TypeDefinition = {
          type: 'tuple',
          properties: { x: { type: 'int32' } },
        }
        expect(isTupleTypeDefinition(def)).toBe(false)
      })
    })

    describe('isChoiceTypeDefinition', () => {
      it('should identify choice definitions', () => {
        const def: TypeDefinition = {
          type: 'choice',
          choices: {
            optionA: { type: 'string' },
            optionB: { type: 'int32' },
          },
        }
        expect(isChoiceTypeDefinition(def)).toBe(true)
      })

      it('should identify choice with selector', () => {
        const def: ChoiceTypeDefinition = {
          type: 'choice',
          selector: 'kind',
          choices: {
            text: { type: 'object', properties: { value: { type: 'string' } } },
            number: { type: 'object', properties: { value: { type: 'int32' } } },
          },
        }
        expect(isChoiceTypeDefinition(def)).toBe(true)
        expect(def.selector).toBe('kind')
      })

      it('should not identify choice without choices', () => {
        const def: TypeDefinition = { type: 'choice' }
        expect(isChoiceTypeDefinition(def)).toBe(false)
      })
    })

    describe('hasEnumValue', () => {
      it('should detect enum values', () => {
        const def: TypeDefinition = {
          type: 'string',
          enum: ['red', 'green', 'blue'],
        }
        expect(hasEnumValue(def)).toBe(true)
      })

      it('should handle enum with null', () => {
        const def: TypeDefinition = {
          type: 'string',
          enum: ['a', 'b', null],
        }
        expect(hasEnumValue(def)).toBe(true)
      })

      it('should not detect non-enum definitions', () => {
        const def: TypeDefinition = { type: 'string' }
        expect(hasEnumValue(def)).toBe(false)
      })

      it('should not detect non-array enum', () => {
        const def: TypeDefinition = { type: 'string', enum: 'invalid' as unknown as unknown[] }
        expect(hasEnumValue(def)).toBe(false)
      })
    })

    describe('hasConstValue', () => {
      it('should detect const values', () => {
        expect(hasConstValue({ const: 'fixed' })).toBe(true)
        expect(hasConstValue({ const: 123 })).toBe(true)
        expect(hasConstValue({ const: null })).toBe(true)
        expect(hasConstValue({ const: { nested: 'object' } })).toBe(true)
      })

      it('should not detect non-const definitions', () => {
        expect(hasConstValue({ type: 'string' })).toBe(false)
        expect(hasConstValue({ enum: ['a', 'b'] })).toBe(false)
      })
    })
  })

  describe('Utility Functions', () => {
    describe('getResolvedType', () => {
      it('should return string type directly', () => {
        expect(getResolvedType('string')).toBe('string')
        expect(getResolvedType('int32')).toBe('int32')
        expect(getResolvedType('object')).toBe('object')
      })

      it('should return type array directly', () => {
        expect(getResolvedType(['string', 'null'])).toEqual(['string', 'null'])
        expect(getResolvedType(['int32', 'int64'])).toEqual(['int32', 'int64'])
      })

      it('should return null for type references (need resolution)', () => {
        expect(getResolvedType({ $ref: '#/definitions/User' })).toBeNull()
      })

      it('should return null for undefined', () => {
        expect(getResolvedType(undefined)).toBeNull()
      })
    })

    describe('isNullableType', () => {
      it('should detect explicit null type', () => {
        expect(isNullableType('null')).toBe(true)
      })

      it('should detect null in type array', () => {
        expect(isNullableType(['string', 'null'])).toBe(true)
        expect(isNullableType(['int32', 'null'])).toBe(true)
      })

      it('should not detect non-nullable types', () => {
        expect(isNullableType('string')).toBe(false)
        expect(isNullableType(['string', 'int32'])).toBe(false)
        expect(isNullableType(undefined)).toBe(false)
      })

      it('should handle type references (not nullable by default)', () => {
        expect(isNullableType({ $ref: '#/definitions/User' })).toBe(false)
      })
    })

    describe('getNonNullTypes', () => {
      it('should return single type if not null', () => {
        expect(getNonNullTypes('string')).toEqual(['string'])
        expect(getNonNullTypes('int32')).toEqual(['int32'])
      })

      it('should return empty array for null type', () => {
        expect(getNonNullTypes('null')).toEqual([])
      })

      it('should filter out null from type arrays', () => {
        expect(getNonNullTypes(['string', 'null'])).toEqual(['string'])
        expect(getNonNullTypes(['int32', 'string', 'null'])).toEqual(['int32', 'string'])
        expect(getNonNullTypes(['null', 'boolean', 'null'])).toEqual(['boolean'])
      })

      it('should return all types if no null present', () => {
        expect(getNonNullTypes(['string', 'int32'])).toEqual(['string', 'int32'])
      })

      it('should return empty array for type references', () => {
        expect(getNonNullTypes({ $ref: '#/definitions/User' })).toEqual([])
      })
    })
  })

  describe('Integer Bounds', () => {
    it('should have correct bounds for signed integers', () => {
      expect(INTEGER_BOUNDS.int8.min).toBe(-128n)
      expect(INTEGER_BOUNDS.int8.max).toBe(127n)
      expect(INTEGER_BOUNDS.int16.min).toBe(-32768n)
      expect(INTEGER_BOUNDS.int16.max).toBe(32767n)
      expect(INTEGER_BOUNDS.int32.min).toBe(-2147483648n)
      expect(INTEGER_BOUNDS.int32.max).toBe(2147483647n)
    })

    it('should have correct bounds for unsigned integers', () => {
      expect(INTEGER_BOUNDS.uint8.min).toBe(0n)
      expect(INTEGER_BOUNDS.uint8.max).toBe(255n)
      expect(INTEGER_BOUNDS.uint16.min).toBe(0n)
      expect(INTEGER_BOUNDS.uint16.max).toBe(65535n)
      expect(INTEGER_BOUNDS.uint32.min).toBe(0n)
      expect(INTEGER_BOUNDS.uint32.max).toBe(4294967295n)
    })

    it('should have correct bounds for 64-bit integers', () => {
      expect(INTEGER_BOUNDS.int64.min).toBe(-9223372036854775808n)
      expect(INTEGER_BOUNDS.int64.max).toBe(9223372036854775807n)
      expect(INTEGER_BOUNDS.uint64.min).toBe(0n)
      expect(INTEGER_BOUNDS.uint64.max).toBe(18446744073709551615n)
    })

    it('should have correct bounds for 128-bit integers', () => {
      expect(INTEGER_BOUNDS.int128.min).toBe(-170141183460469231731687303715884105728n)
      expect(INTEGER_BOUNDS.int128.max).toBe(170141183460469231731687303715884105727n)
      expect(INTEGER_BOUNDS.uint128.min).toBe(0n)
      expect(INTEGER_BOUNDS.uint128.max).toBe(340282366920938463463374607431768211455n)
    })
  })
})
