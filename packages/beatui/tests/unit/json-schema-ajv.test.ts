import { describe, it, expect } from 'vitest'
import { createAJVStandardSchema } from '../../src/components/json-schema'
import type { JSONSchemaType } from 'ajv'

describe('AJV StandardSchemaV1 wrapper', () => {
  it('validates a simple object successfully', async () => {
    type User = { name: string; age?: number }
    const schema: JSONSchemaType<User> = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }, // optional because not listed in required
      },
      required: ['name'],
      additionalProperties: false,
    } as const

    const standard = createAJVStandardSchema<User>(schema)

    const good: User = { name: 'Alice', age: 30 }
    const result = await standard['~standard'].validate(good)

    expect('value' in result).toBe(true)
    if ('value' in result) {
      expect(result.value).toEqual(good)
    }
  })

  it('maps required error with correct path at top-level', async () => {
    type User = { name: string }
    const schema: JSONSchemaType<User> = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
      additionalProperties: false,
    } as const

    const standard = createAJVStandardSchema<User>(schema)

    const bad = {} as unknown
    const result = await standard['~standard'].validate(bad)

    expect('issues' in result).toBe(true)
    if ('issues' in result) {
      expect(result.issues.length).toBeGreaterThan(0)
      // expect path to point to the missing property
      expect(result.issues[0]?.path).toEqual(['name'])
    }
  })

  it('maps additionalProperties error with offending property in path', async () => {
    type User = { name: string }
    const schema: JSONSchemaType<User> = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
      additionalProperties: false,
    } as const

    const standard = createAJVStandardSchema<User>(schema)

    const bad = { name: 'Bob', extra: true }
    const result = await standard['~standard'].validate(bad)

    expect('issues' in result).toBe(true)
    if ('issues' in result) {
      // Find the additionalProperties issue
      const ap =
        result.issues.find(i => (i.message || '').includes('additional')) ||
        result.issues[0]
      expect(ap?.path).toEqual(['extra'])
    }
  })

  it('maps nested required error within objects', async () => {
    type Profile = { name: string }
    type Data = { user: Profile }

    const schema: JSONSchemaType<Data> = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: { name: { type: 'string' } },
          required: ['name'],
          additionalProperties: false,
        },
      },
      required: ['user'],
      additionalProperties: false,
    } as const

    const standard = createAJVStandardSchema<Data>(schema)

    const bad = { user: {} }
    const result = await standard['~standard'].validate(bad)

    expect('issues' in result).toBe(true)
    if ('issues' in result) {
      expect(result.issues[0]?.path).toEqual(['user', 'name'])
    }
  })

  it('maps nested required error within arrays', async () => {
    type User = { name: string }
    type Data = { users: User[] }

    const schema: JSONSchemaType<Data> = {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: { name: { type: 'string' } },
            required: ['name'],
            additionalProperties: false,
          },
          minItems: 1,
        },
      },
      required: ['users'],
      additionalProperties: false,
    } as const

    const standard = createAJVStandardSchema<Data>(schema)

    const bad = { users: [{}] }
    const result = await standard['~standard'].validate(bad)

    expect('issues' in result).toBe(true)
    if ('issues' in result) {
      expect(result.issues[0]?.path).toEqual(['users', 0, 'name'])
    }
  })
})
