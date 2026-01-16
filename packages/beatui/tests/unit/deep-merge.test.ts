/**
 * Deep Merge Utility Tests
 *
 * Tests for the deepMergeDefaults function used to merge schema defaults
 * with provided initial values.
 */

import { describe, it, expect } from 'vitest'
import { deepMergeDefaults } from '../../src/components/form/utils/deep-merge'

describe('deepMergeDefaults', () => {
  describe('basic merging', () => {
    it('should return defaults when provided is undefined', () => {
      const defaults = { name: 'John', age: 30 }
      const result = deepMergeDefaults(defaults, undefined)
      expect(result).toEqual({ name: 'John', age: 30 })
    })

    it('should return defaults when provided is null', () => {
      const defaults = { name: 'John', age: 30 }
      const result = deepMergeDefaults(defaults, null)
      expect(result).toEqual({ name: 'John', age: 30 })
    })

    it('should return provided when defaults is undefined', () => {
      const provided = { name: 'Jane', age: 25 }
      const result = deepMergeDefaults(undefined, provided)
      expect(result).toEqual({ name: 'Jane', age: 25 })
    })

    it('should return provided when defaults is null', () => {
      const provided = { name: 'Jane', age: 25 }
      const result = deepMergeDefaults(null, provided)
      expect(result).toEqual({ name: 'Jane', age: 25 })
    })

    it('should return provided for primitives', () => {
      expect(deepMergeDefaults('default', 'provided')).toBe('provided')
      expect(deepMergeDefaults(10, 20)).toBe(20)
      expect(deepMergeDefaults(true, false)).toBe(false)
    })
  })

  describe('object merging', () => {
    it('should merge objects with provided values taking precedence', () => {
      const defaults = { name: 'John', age: 30, city: 'NYC' }
      const provided = { name: 'Jane' }
      const result = deepMergeDefaults(defaults, provided)
      expect(result).toEqual({ name: 'Jane', age: 30, city: 'NYC' })
    })

    it('should preserve all provided values', () => {
      const defaults = { a: 1, b: 2 }
      const provided = { a: 10, b: 20, c: 30 }
      const result = deepMergeDefaults(defaults, provided)
      expect(result).toEqual({ a: 10, b: 20, c: 30 })
    })

    it('should not overwrite provided undefined values with defaults', () => {
      const defaults = { name: 'John' }
      const provided = { name: undefined, age: 25 }
      const result = deepMergeDefaults(defaults, provided)
      // provided has name key set to undefined, so default fills it in
      expect(result).toEqual({ name: 'John', age: 25 })
    })
  })

  describe('nested object merging', () => {
    it('should recursively merge nested objects', () => {
      const defaults = {
        user: { name: 'John', settings: { theme: 'dark', lang: 'en' } },
      }
      const provided = {
        user: { settings: { theme: 'light' } },
      }
      const result = deepMergeDefaults(defaults, provided)
      expect(result).toEqual({
        user: { name: 'John', settings: { theme: 'light', lang: 'en' } },
      })
    })

    it('should handle deeply nested structures', () => {
      const defaults = {
        a: { b: { c: { d: 'default' } } },
      }
      const provided = {
        a: { b: { c: { e: 'provided' } } },
      }
      const result = deepMergeDefaults(defaults, provided)
      expect(result).toEqual({
        a: { b: { c: { d: 'default', e: 'provided' } } },
      })
    })
  })

  describe('array handling', () => {
    it('should not merge arrays - provided array replaces default', () => {
      const defaults = { items: [1, 2, 3] }
      const provided = { items: [4, 5] }
      const result = deepMergeDefaults(defaults, provided)
      expect(result).toEqual({ items: [4, 5] })
    })

    it('should use default array when provided is undefined', () => {
      const defaults = { items: [1, 2, 3] }
      const provided = {}
      const result = deepMergeDefaults(defaults, provided)
      expect(result).toEqual({ items: [1, 2, 3] })
    })
  })

  describe('immutability', () => {
    it('should not mutate the defaults object', () => {
      const defaults = { name: 'John', nested: { value: 1 } }
      const provided = { nested: { value: 2 } }
      const originalDefaults = JSON.parse(JSON.stringify(defaults))
      deepMergeDefaults(defaults, provided)
      expect(defaults).toEqual(originalDefaults)
    })

    it('should not mutate the provided object', () => {
      const defaults = { name: 'John' }
      const provided = { age: 30 }
      const originalProvided = JSON.parse(JSON.stringify(provided))
      deepMergeDefaults(defaults, provided)
      expect(provided).toEqual(originalProvided)
    })
  })

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      expect(deepMergeDefaults({}, {})).toEqual({})
      expect(deepMergeDefaults({ a: 1 }, {})).toEqual({ a: 1 })
      expect(deepMergeDefaults({}, { a: 1 })).toEqual({ a: 1 })
    })

    it('should handle mixed types (object default, primitive provided)', () => {
      const defaults = { nested: { value: 1 } }
      const provided = { nested: 'string' }
      const result = deepMergeDefaults(defaults, provided)
      // Provided value takes precedence even if types differ
      expect(result).toEqual({ nested: 'string' })
    })

    it('should handle Date objects as non-plain objects', () => {
      const date = new Date('2024-01-01')
      const defaults = { date: new Date('2020-01-01') }
      const provided = { date }
      const result = deepMergeDefaults(defaults, provided)
      expect(result.date).toBe(date)
    })
  })
})
