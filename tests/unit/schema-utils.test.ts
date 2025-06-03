import { describe, it, expect } from 'vitest'
import {
  convertStandardSchemaPathToPath,
  convertStandardSchemaIssues,
} from '../../src/components/form/schema/schema-utils'
import { StandardSchemaV1 } from '../../src/components/form/schema/standard-schema-v1'

describe('Schema Utils', () => {
  describe('convertStandardSchemaPathToPath', () => {
    it('should handle empty path array', () => {
      const result = convertStandardSchemaPathToPath([])
      expect(result).toEqual([])
    })

    it('should handle path with string keys only', () => {
      const path = ['name', 'firstName', 'lastName']
      const result = convertStandardSchemaPathToPath(path)
      expect(result).toEqual(['name', 'firstName', 'lastName'])
    })

    it('should handle path with number keys only', () => {
      const path = [0, 1, 2]
      const result = convertStandardSchemaPathToPath(path)
      expect(result).toEqual([0, 1, 2])
    })

    it('should handle path with mixed string and number keys', () => {
      const path = ['users', 0, 'name', 1]
      const result = convertStandardSchemaPathToPath(path)
      expect(result).toEqual(['users', 0, 'name', 1])
    })

    it('should handle path with PathSegment objects', () => {
      const path: ReadonlyArray<StandardSchemaV1.PathSegment> = [
        { key: 'user' },
        { key: 0 },
        { key: 'profile' },
      ]
      const result = convertStandardSchemaPathToPath(path)
      expect(result).toEqual(['user', 0, 'profile'])
    })

    it('should handle path with mixed PropertyKey and PathSegment objects', () => {
      const path: ReadonlyArray<PropertyKey | StandardSchemaV1.PathSegment> = [
        'users',
        { key: 0 },
        'name',
        { key: 'first' },
        1,
      ]
      const result = convertStandardSchemaPathToPath(path)
      expect(result).toEqual(['users', 0, 'name', 'first', 1])
    })

    it('should convert symbol keys to strings', () => {
      const symbolKey = Symbol('test')
      const path = [symbolKey, 'name']
      const result = convertStandardSchemaPathToPath(path)
      expect(result).toEqual([symbolKey.toString(), 'name'])
    })

    it('should handle PathSegment with symbol key', () => {
      const symbolKey = Symbol('test')
      const path: ReadonlyArray<StandardSchemaV1.PathSegment> = [
        { key: symbolKey },
        { key: 'name' },
      ]
      const result = convertStandardSchemaPathToPath(path)
      expect(result).toEqual([symbolKey.toString(), 'name'])
    })
  })

  describe('convertStandardSchemaIssues', () => {
    it('should handle empty issues array', () => {
      const result = convertStandardSchemaIssues([])
      expect(result).toEqual({
        error: undefined,
      })
    })

    it('should handle issues with no path (top-level errors)', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'Required field missing' },
        { message: 'Invalid format', path: [] },
      ]
      const result = convertStandardSchemaIssues(issues)
      expect(result).toEqual({
        error: 'Required field missing\nInvalid format',
      })
    })

    it('should handle issues with simple paths', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'Name is required', path: ['name'] },
        { message: 'Email is invalid', path: ['email'] },
      ]
      const result = convertStandardSchemaIssues(issues)
      expect(result).toEqual({
        error: undefined,
        dependencies: {
          name: { error: 'Name is required' },
          email: { error: 'Email is invalid' },
        },
      })
    })

    it('should handle issues with nested paths', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'Street is required', path: ['address', 'street'] },
        { message: 'City is required', path: ['address', 'city'] },
      ]
      const result = convertStandardSchemaIssues(issues)
      expect(result).toEqual({
        error: undefined,
        dependencies: {
          address: {
            dependencies: {
              street: { error: 'Street is required' },
              city: { error: 'City is required' },
            },
          },
        },
      })
    })

    it('should handle issues with array indices in paths', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'First email is invalid', path: ['emails', 0] },
        { message: 'Second email is required', path: ['emails', 1] },
      ]
      const result = convertStandardSchemaIssues(issues)
      expect(result).toEqual({
        error: undefined,
        dependencies: {
          emails: {
            dependencies: {
              0: { error: 'First email is invalid' },
              1: { error: 'Second email is required' },
            },
          },
        },
      })
    })

    it('should handle mixed top-level and nested issues', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'Form is invalid' },
        { message: 'Name is required', path: ['name'] },
        { message: 'Street is required', path: ['address', 'street'] },
      ]
      const result = convertStandardSchemaIssues(issues)
      expect(result).toEqual({
        error: 'Form is invalid',
        dependencies: {
          name: { error: 'Name is required' },
          address: {
            dependencies: {
              street: { error: 'Street is required' },
            },
          },
        },
      })
    })

    it('should handle complex nested object structures', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'User name required', path: ['users', 0, 'profile', 'name'] },
        { message: 'User email invalid', path: ['users', 0, 'contact', 'email'] },
        { message: 'Second user age invalid', path: ['users', 1, 'profile', 'age'] },
      ]
      const result = convertStandardSchemaIssues(issues)
      expect(result).toEqual({
        error: undefined,
        dependencies: {
          users: {
            dependencies: {
              0: {
                dependencies: {
                  profile: {
                    dependencies: {
                      name: { error: 'User name required' },
                    },
                  },
                  contact: {
                    dependencies: {
                      email: { error: 'User email invalid' },
                    },
                  },
                },
              },
              1: {
                dependencies: {
                  profile: {
                    dependencies: {
                      age: { error: 'Second user age invalid' },
                    },
                  },
                },
              },
            },
          },
        },
      })
    })

    it('should handle issues with PathSegment objects in paths', () => {
      const issues: StandardSchemaV1.Issue[] = [
        {
          message: 'Name is required',
          path: [{ key: 'user' }, { key: 'profile' }, { key: 'name' }],
        },
      ]
      const result = convertStandardSchemaIssues(issues)
      expect(result).toEqual({
        error: undefined,
        dependencies: {
          user: {
            dependencies: {
              profile: {
                dependencies: {
                  name: { error: 'Name is required' },
                },
              },
            },
          },
        },
      })
    })

    it('should handle single top-level error', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: 'Single error message' },
      ]
      const result = convertStandardSchemaIssues(issues)
      expect(result).toEqual({
        error: 'Single error message',
      })
    })

    it('should handle empty string error message', () => {
      const issues: StandardSchemaV1.Issue[] = [
        { message: '', path: ['field'] },
      ]
      const result = convertStandardSchemaIssues(issues)
      expect(result).toEqual({
        error: undefined,
        dependencies: {
          field: { error: '' },
        },
      })
    })
  })
})
