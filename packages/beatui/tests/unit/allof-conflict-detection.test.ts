import { describe, it, expect } from 'vitest'
import {
  mergeAllOf,
  JSONSchema,
} from '../../src/components/json-schema/schema-context'

describe('Enhanced allOf conflict detection', () => {
  it('should detect type conflicts with detailed messages', () => {
    const schemas: JSONSchema[] = [
      { type: 'string', minLength: 5 },
      { type: 'number', minimum: 0 },
    ]

    const result = mergeAllOf(schemas)

    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]).toEqual({
      path: ['type'],
      message: 'Incompatible types in allOf (no common types)',
      conflictingValues: [['string'], ['number', 'integer']],
    })
  })

  it('should detect property type conflicts', () => {
    const schemas: JSONSchema[] = [
      {
        type: 'object',
        properties: {
          value: { type: 'string' },
        },
      },
      {
        type: 'object',
        properties: {
          value: { type: 'number' },
        },
      },
    ]

    const result = mergeAllOf(schemas)

    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]).toEqual({
      path: ['properties', 'value'],
      message: 'Property "value" has conflicting types: string vs number',
      conflictingValues: [{ type: 'string' }, { type: 'number' }],
    })
  })

  it('should detect string constraint conflicts', () => {
    const schemas: JSONSchema[] = [
      {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 10 },
        },
      },
      {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 5 },
        },
      },
    ]

    const result = mergeAllOf(schemas)

    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]).toEqual({
      path: ['properties', 'name'],
      message:
        'Property "name" has conflicting string constraints: minLength 10 > maxLength 5',
      conflictingValues: [
        { type: 'string', minLength: 10 },
        { type: 'string', maxLength: 5 },
      ],
    })
  })

  it('should detect numeric constraint conflicts', () => {
    const schemas: JSONSchema[] = [
      {
        type: 'object',
        properties: {
          age: { type: 'number', minimum: 18 },
        },
      },
      {
        type: 'object',
        properties: {
          age: { type: 'number', maximum: 16 },
        },
      },
    ]

    const result = mergeAllOf(schemas)

    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]).toEqual({
      path: ['properties', 'age'],
      message:
        'Property "age" has conflicting numeric constraints: minimum 18 > maximum 16',
      conflictingValues: [
        { type: 'number', minimum: 18 },
        { type: 'number', maximum: 16 },
      ],
    })
  })

  it('should detect additionalProperties conflicts', () => {
    const schemas: JSONSchema[] = [
      {
        type: 'object',
        additionalProperties: true,
      },
      {
        type: 'object',
        additionalProperties: false,
      },
    ]

    const result = mergeAllOf(schemas)

    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]).toEqual({
      path: ['additionalProperties'],
      message:
        'Conflicting additionalProperties values in allOf: true vs false',
      conflictingValues: [true, false],
    })
  })

  it('should detect property count conflicts', () => {
    const schemas: JSONSchema[] = [
      {
        type: 'object',
        maxProperties: 3,
      },
      {
        type: 'object',
        minProperties: 5,
      },
    ]

    const result = mergeAllOf(schemas)

    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]).toEqual({
      path: ['minProperties'],
      message: 'minProperties 5 conflicts with existing maxProperties 3',
      conflictingValues: [5, 3],
    })
  })

  it('should detect boolean schema conflicts', () => {
    const schemas: JSONSchema[] = [
      {
        type: 'object',
        properties: {
          flag: true, // Allow anything
        },
      },
      {
        type: 'object',
        properties: {
          flag: false, // Allow nothing
        },
      },
    ]

    const result = mergeAllOf(schemas)

    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]).toEqual({
      path: ['properties', 'flag'],
      message:
        'Property "flag" has conflicting boolean schema definitions in allOf branches',
      conflictingValues: [true, false],
    })
  })

  it('should handle multiple conflicts in one merge', () => {
    const schemas: JSONSchema[] = [
      {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 10 },
          age: { type: 'number', minimum: 18 },
        },
        additionalProperties: true,
        maxProperties: 2,
      },
      {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 5 },
          age: { type: 'number', maximum: 16 },
        },
        additionalProperties: false,
        minProperties: 5,
      },
    ]

    const result = mergeAllOf(schemas)

    expect(result.conflicts).toHaveLength(4)

    // Check that all expected conflicts are present
    const conflictMessages = result.conflicts.map(c => c.message)
    expect(conflictMessages).toContain(
      'Property "name" has conflicting string constraints: minLength 10 > maxLength 5'
    )
    expect(conflictMessages).toContain(
      'Property "age" has conflicting numeric constraints: minimum 18 > maximum 16'
    )
    expect(conflictMessages).toContain(
      'Conflicting additionalProperties values in allOf: true vs false'
    )
    expect(conflictMessages).toContain(
      'minProperties 5 conflicts with existing maxProperties 2'
    )
  })

  it('should not report conflicts for compatible constraints', () => {
    const schemas: JSONSchema[] = [
      {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3 },
          age: { type: 'number', minimum: 0 },
        },
        additionalProperties: false,
        minProperties: 1,
      },
      {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 50 },
          age: { type: 'number', maximum: 120 },
        },
        additionalProperties: false,
        maxProperties: 10,
      },
    ]

    const result = mergeAllOf(schemas)

    expect(result.conflicts).toHaveLength(0)
    expect(result.mergedSchema.properties?.name).toEqual({
      type: 'string',
      minLength: 3,
      maxLength: 50,
    })
    expect(result.mergedSchema.properties?.age).toEqual({
      type: 'number',
      minimum: 0,
      maximum: 120,
    })
  })
})
